import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  type PeerCell,
  type PeerGrid,
  type PeerSnapshot,
  ROOM_CODE_LENGTH,
  type ServerMessage
} from '../../../shared/tetrisProtocol'
import server from '../../index'
import { MAX_JOIN_ATTEMPTS } from './room'
import { tetrisRoute } from './route'

/**
 * The endpoint observed from outside: two real WebSocket clients against a real
 * server runtime — the application's own `fetch` and `websocket` handlers under
 * `Bun.serve`, on an ephemeral port. Nothing here reaches into a room; every
 * assertion is a frame a client sent or received, which is the only contract the
 * endpoint publishes.
 */

/** A wire-valid board at the arena's own size, empty but for one named cell. */
const grid = (filled: PeerCell = null): PeerGrid =>
  Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => (x === 0 && y === 0 ? filled : null))
  )

const snapshot = (filled: PeerCell = null, score = 0): PeerSnapshot => ({
  grid: grid(filled),
  score,
  status: 'running'
})

/** One real client: what it sent, what it heard, and how it waits for an answer. */
type Peer = {
  send: (payload: unknown) => void
  /** The next frame of `type`, which must already be in hand or arrive within the timeout. */
  next: <T extends ServerMessage['type']>(
    type: T,
    timeout?: number
  ) => Promise<Extract<ServerMessage, { type: T }>>
  /** The frames that arrive over a short window, for asserting nothing did. */
  quiet: (window?: number) => Promise<ServerMessage[]>
  close: () => void
}

const sleep = (ms: number): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>()
  setTimeout(resolve, ms)

  return promise
}

const sockets: WebSocket[] = []
let endpoint = ''

const connect = (): Promise<Peer> => {
  const { promise, resolve, reject } = Promise.withResolvers<Peer>()
  const socket = new WebSocket(endpoint)
  const inbox: ServerMessage[] = []
  const waiters: { type: ServerMessage['type']; settle: (message: ServerMessage) => void }[] = []

  sockets.push(socket)

  socket.addEventListener('message', (event) => {
    // Read the wire as JSON: what the endpoint sends is what the test asserts on.
    const message = JSON.parse(String(event.data)) as ServerMessage
    const waiting = waiters.findIndex((waiter) => waiter.type === message.type)

    if (waiting === -1) inbox.push(message)
    else waiters.splice(waiting, 1)[0]?.settle(message)
  })

  socket.addEventListener('error', () =>
    reject(new Error(`the client could not reach ${endpoint}`))
  )

  socket.addEventListener('open', () => {
    resolve({
      send: (payload) => socket.send(JSON.stringify(payload)),
      next: (type, timeout = 1000) => {
        const heard = inbox.findIndex((message) => message.type === type)
        if (heard !== -1) {
          return Promise.resolve(
            inbox.splice(heard, 1)[0] as Extract<ServerMessage, { type: typeof type }>
          )
        }

        const waiting = Promise.withResolvers<Extract<ServerMessage, { type: typeof type }>>()
        const timer = setTimeout(() => {
          waiting.reject(new Error(`no ${type} frame within ${timeout}ms`))
        }, timeout)

        waiters.push({
          type,
          settle: (message) => {
            clearTimeout(timer)
            waiting.resolve(message as Extract<ServerMessage, { type: typeof type }>)
          }
        })

        return waiting.promise
      },
      quiet: async (window = 50) => {
        await sleep(window)
        return inbox.splice(0)
      },
      close: () => socket.close()
    })
  })

  return promise
}

/** A room with two players seated, both drained of what seating them produced. */
const seated = async (): Promise<{ host: Peer; guest: Peer; code: string }> => {
  const host = await connect()
  host.send({ type: 'initSession', clientId: 'host', state: snapshot() })
  const { code } = await host.next('sessionInitialized')

  const guest = await connect()
  guest.send({ type: 'joinSession', clientId: 'guest', code, state: snapshot(), token: null })

  await guest.next('sessionBroadcast')
  await host.next('sessionBroadcast')

  return { host, guest, code }
}

beforeAll(() => {
  const runtime = Bun.serve({ ...server, port: 0, hostname: '127.0.0.1' })
  endpoint = `ws://127.0.0.1:${runtime.port}/ws/tetris`
})

afterAll(() => {
  for (const socket of sockets) socket.close()
})

describe('tetrisRoute', () => {
  it('serves the upgrade at a fixed path, with no room code in it', () => {
    const routes = tetrisRoute.routes.map((route) => `${route.method} ${route.path}`)

    expect(routes).toContain('GET /ws/tetris')
  })
})

describe('the tetris endpoint', () => {
  it('mints a six-character alphanumeric code for the player who opens a room', async () => {
    const host = await connect()
    host.send({ type: 'initSession', clientId: 'host-a', state: snapshot() })

    const initialized = await host.next('sessionInitialized')

    expect(initialized.code).toHaveLength(ROOM_CODE_LENGTH)
    expect(initialized.token.length).toBeGreaterThan(0)
    expect(initialized.code).toMatch(/^[A-Z0-9]{6}$/)

    const another = await connect()
    another.send({ type: 'initSession', clientId: 'host-b', state: snapshot() })

    expect((await another.next('sessionInitialized')).code).not.toBe(initialized.code)
  })

  it('seats a second player and hands them the room, the host’s own board among the peers', async () => {
    const host = await connect()
    host.send({ type: 'initSession', clientId: 'host-c', state: snapshot('I', 120) })
    const { code } = await host.next('sessionInitialized')

    const guest = await connect()
    guest.send({
      type: 'joinSession',
      clientId: 'guest-c',
      code,
      state: snapshot('O', 40),
      token: null
    })

    const toGuest = await guest.next('sessionBroadcast')

    expect(toGuest.code).toBe(code)
    expect(toGuest.peers.you).toBe('guest-c')
    expect(toGuest.peers.clients).toHaveLength(2)
    expect(toGuest.peers.clients).toContainEqual({
      id: 'host-c',
      state: snapshot('I', 120),
      connected: true
    })
    expect(toGuest.peers.clients).toContainEqual({
      id: 'guest-c',
      state: snapshot('O', 40),
      connected: true
    })

    // The player already in the room learns someone arrived, and no frame ever
    // carries the other seat's proof: each player is told the token of their own.
    const toHost = await host.next('sessionBroadcast')

    expect(toHost.peers.clients).toHaveLength(2)
    expect(toHost.token.length).toBeGreaterThan(0)
    expect(toHost.token).not.toBe(toGuest.token)
  })

  it('refuses a third player, naming the room full and what to do instead', async () => {
    const { code } = await seated()

    const extra = await connect()
    extra.send({ type: 'joinSession', clientId: 'extra', code, state: snapshot(), token: null })

    expect(await extra.next('error')).toEqual({
      type: 'error',
      code: 'room-full',
      recovery: 'play-solo'
    })
    expect(await extra.quiet()).toEqual([])
  })

  it('refuses a code that names no live room, and never quietly creates one', async () => {
    const stranger = await connect()
    stranger.send({
      type: 'joinSession',
      clientId: 'stranger',
      code: 'ZZZZZZ',
      state: snapshot(),
      token: null
    })

    expect(await stranger.next('error')).toEqual({
      type: 'error',
      code: 'room-not-found',
      recovery: 'create-room'
    })

    // Had the refused join created a room, this second attempt would have found it.
    const again = await connect()
    again.send({
      type: 'joinSession',
      clientId: 'stranger',
      code: 'zzzzzz',
      state: snapshot(),
      token: null
    })

    expect(await again.next('error')).toEqual({
      type: 'error',
      code: 'room-not-found',
      recovery: 'create-room'
    })
  })

  it('refuses a code longer than a room code as naming no room, not as an unreadable message', async () => {
    // The lookup owns the classification, so the length of a code is the
    // lookup's business: a strung-out code is a room that does not exist with a
    // way to open one, rather than a frame the endpoint cannot read.
    const stranger = await connect()
    stranger.send({
      type: 'joinSession',
      clientId: 'stranger-long',
      code: 'x'.repeat(64),
      state: snapshot(),
      token: null
    })

    expect(await stranger.next('error')).toEqual({
      type: 'error',
      code: 'room-not-found',
      recovery: 'create-room'
    })
  })

  it('answers a message it cannot read with a structured error, and keeps the connection', async () => {
    const peer = await connect()

    peer.send('{ not json at all')
    expect(await peer.next('error')).toEqual({
      type: 'error',
      code: 'invalid-message',
      recovery: null
    })

    peer.send({ type: 'nonsense' })
    expect(await peer.next('error')).toEqual({
      type: 'error',
      code: 'invalid-message',
      recovery: null
    })

    peer.send({
      type: 'initSession',
      clientId: 'host-d',
      state: { grid: [], score: 0, status: 'running' }
    })
    expect(await peer.next('error')).toEqual({
      type: 'error',
      code: 'invalid-message',
      recovery: null
    })

    // Every refusal left the socket alone: it still holds a conversation.
    peer.send({ type: 'initSession', clientId: 'host-d', state: snapshot() })

    expect((await peer.next('sessionInitialized')).code).toHaveLength(ROOM_CODE_LENGTH)
  })

  it('refuses a board from a connection holding no seat, and a second room from one that holds it', async () => {
    const peer = await connect()

    // Nobody to relay a board to yet.
    peer.send({ type: 'stateUpdate', state: snapshot() })

    expect(await peer.next('error')).toEqual({
      type: 'error',
      code: 'not-in-room',
      recovery: null
    })

    peer.send({ type: 'initSession', clientId: 'host-f', state: snapshot() })
    expect((await peer.next('sessionInitialized')).code).toHaveLength(ROOM_CODE_LENGTH)

    // One connection, one seat: a second room is refused rather than opened beside it.
    peer.send({ type: 'initSession', clientId: 'host-f', state: snapshot() })

    expect(await peer.next('error')).toEqual({
      type: 'error',
      code: 'already-in-room',
      recovery: null
    })
  })

  it('carries a board to the other player, and never back to its sender', async () => {
    const { host, guest } = await seated()

    host.send({ type: 'stateUpdate', state: snapshot('Z', 300) })

    expect(await guest.next('stateUpdate')).toEqual({
      type: 'stateUpdate',
      clientId: 'host',
      state: snapshot('Z', 300)
    })
    expect(await host.quiet()).toEqual([])
  })

  it('answers a ping, the heartbeat the client drives', async () => {
    const peer = await connect()

    peer.send({ type: 'ping' })

    expect(await peer.next('pong')).toEqual({ type: 'pong' })
  })

  it('notices a socket that closed and tells the player who is left', async () => {
    const { host, guest } = await seated()

    guest.close()

    const roster = await host.next('sessionBroadcast')

    expect(roster.peers.clients).toHaveLength(2)
    expect(roster.peers.clients).toContainEqual({
      id: 'host',
      state: snapshot(),
      connected: true
    })
    expect(roster.peers.clients).toContainEqual({
      id: 'guest',
      state: snapshot(),
      connected: false
    })
  })

  it('holds the seat of a player who comes back under the same identifier', async () => {
    const host = await connect()
    host.send({ type: 'initSession', clientId: 'host-e', state: snapshot() })
    const { code, token } = await host.next('sessionInitialized')

    // A refresh: the socket goes, the identity and the seat's proof stay.
    host.close()

    const back = await connect()
    back.send({ type: 'joinSession', clientId: 'host-e', code, state: snapshot('T', 10), token })

    const roster = await back.next('sessionBroadcast')

    expect(roster.code).toBe(code)
    expect(roster.token).toBe(token)
    expect(roster.peers.you).toBe('host-e')
    expect(roster.peers.clients).toEqual([
      { id: 'host-e', state: snapshot('T', 10), connected: true }
    ])
  })

  it('refuses a seat named by an identifier whose token is not the seat’s own', async () => {
    const { host, guest, code } = await seated()

    // Every seat of a room is told every other seat's identifier, so a player
    // knows the other's name. Without that seat's token, the name is all they
    // have — and a second connection claiming it is refused as any third player is.
    const thief = await connect()
    thief.send({ type: 'joinSession', clientId: 'guest', code, state: snapshot(), token: null })

    expect(await thief.next('error')).toEqual({
      type: 'error',
      code: 'room-full',
      recovery: 'play-solo'
    })

    const forger = await connect()
    forger.send({
      type: 'joinSession',
      clientId: 'guest',
      code,
      state: snapshot(),
      token: 'not-the-token'
    })

    expect(await forger.next('error')).toEqual({
      type: 'error',
      code: 'room-full',
      recovery: 'play-solo'
    })

    // The seat's holder is untouched: still seated, still relaying to the other player.
    guest.send({ type: 'stateUpdate', state: snapshot('L', 5) })

    expect(await host.next('stateUpdate')).toEqual({
      type: 'stateUpdate',
      clientId: 'guest',
      state: snapshot('L', 5)
    })
  })

  it('bounds the join attempts one connection may spend', async () => {
    const peer = await connect()

    for (let attempt = 0; attempt < MAX_JOIN_ATTEMPTS; attempt++) {
      peer.send({
        type: 'joinSession',
        clientId: 'brute',
        code: 'AAAAAA',
        state: snapshot(),
        token: null
      })

      expect(await peer.next('error')).toEqual({
        type: 'error',
        code: 'room-not-found',
        recovery: 'create-room'
      })
    }

    peer.send({
      type: 'joinSession',
      clientId: 'brute',
      code: 'AAAAAA',
      state: snapshot(),
      token: null
    })

    expect(await peer.next('error')).toEqual({
      type: 'error',
      code: 'join-attempts-exceeded',
      recovery: 'play-solo'
    })
  })
})
