import { describe, expect, it } from 'bun:test'
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  MAX_MESSAGE_LENGTH,
  type PeerCell,
  type PeerGrid,
  type PeerSnapshot,
  parseClientMessage,
  parseServerMessage
} from './tetrisProtocol'

/**
 * The boundary itself: what the endpoint accepts as a message and what it
 * refuses. A frame that parse returns `null` for is answered with one structured
 * `invalid-message` error, so the cases here are the ones that must never reach a
 * room, and the ones that must.
 */

/** A wire-valid board at the arena's own size, empty but for one named cell. */
const grid = (filled: PeerCell = null): PeerGrid =>
  Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => (x === 0 && y === 0 ? filled : null))
  )

const snapshot = (): PeerSnapshot => ({ grid: grid(), score: 0, status: 'ready' })

const frame = (payload: unknown): string => JSON.stringify(payload)

describe('parseClientMessage', () => {
  it('reads every message of the vocabulary', () => {
    const state = snapshot()

    expect(parseClientMessage(frame({ type: 'initSession', clientId: 'c1', state }))).toEqual({
      type: 'initSession',
      clientId: 'c1',
      state
    })
    expect(
      parseClientMessage(
        frame({ type: 'joinSession', clientId: 'c1', code: 'ABC234', state, token: null })
      )
    ).toEqual({ type: 'joinSession', clientId: 'c1', code: 'ABC234', state, token: null })
    expect(
      parseClientMessage(
        frame({ type: 'joinSession', clientId: 'c1', code: 'ABC234', state, token: 'seat-token' })
      )
    ).toEqual({ type: 'joinSession', clientId: 'c1', code: 'ABC234', state, token: 'seat-token' })
    expect(parseClientMessage(frame({ type: 'stateUpdate', state }))).toEqual({
      type: 'stateUpdate',
      state
    })
    expect(parseClientMessage(frame({ type: 'ping' }))).toEqual({ type: 'ping' })
  })

  it('accepts any code a client sends, so the lookup names the room and not the parser', () => {
    // The lookup, not the parser, decides what a code names: a visitor who
    // mistyped their friend's code gets "that room does not exist" and not "that
    // is not a message". Length is no part of that — the frame's own ceiling
    // bounds the field — so a fragment longer than a code reaches the lookup too,
    // rather than being refused here as unreadable with no recovery to offer.
    const join = (code: string): unknown => ({
      type: 'joinSession',
      clientId: 'c1',
      code,
      state: snapshot(),
      token: null
    })

    for (const code of ['hello', 'A'.repeat(33), 'x'.repeat(64), '#:~:text=quoted']) {
      expect(parseClientMessage(frame(join(code)))).toEqual({
        type: 'joinSession',
        clientId: 'c1',
        code,
        state: snapshot(),
        token: null
      })
    }
  })

  it('refuses a join whose seat token is not a token', () => {
    const join = (token: unknown): unknown => ({
      type: 'joinSession',
      clientId: 'c1',
      code: 'ABC234',
      state: snapshot(),
      token
    })

    for (const token of [undefined, '', 42, 'x'.repeat(65)]) {
      expect(parseClientMessage(frame(join(token)))).toBeNull()
    }

    // The seat that has no token yet says so with `null`, and only `null` says it.
    expect(parseClientMessage(frame(join(null)))).not.toBeNull()
  })

  it('drops what a client sent alongside the board, keeping only the fields it validated', () => {
    const state = { ...snapshot(), board: 'x'.repeat(1000) }

    expect(parseClientMessage(frame({ type: 'stateUpdate', state, clientId: 'someone' }))).toEqual({
      type: 'stateUpdate',
      state: snapshot()
    })
  })

  it('refuses a frame that is not a JSON object', () => {
    for (const raw of ['', 'not json at all', '[]', 'null', '"a string"', '42', 'true']) {
      expect(parseClientMessage(raw)).toBeNull()
    }
  })

  it('refuses a type the vocabulary does not have', () => {
    expect(parseClientMessage(frame({ type: 'leaveSession', code: 'ABC234' }))).toBeNull()
    expect(parseClientMessage(frame({ type: 'sessionBroadcast' }))).toBeNull()
    expect(parseClientMessage(frame({}))).toBeNull()
  })

  it('refuses a session whose identity is missing, empty or oversized', () => {
    for (const clientId of [undefined, '', 42, 'x'.repeat(65)]) {
      expect(
        parseClientMessage(frame({ type: 'initSession', clientId, state: snapshot() }))
      ).toBeNull()
    }

    expect(
      parseClientMessage(
        frame({ type: 'initSession', clientId: 'x'.repeat(64), state: snapshot() })
      )
    ).not.toBeNull()
  })

  it('refuses a board that is not the arena the game draws', () => {
    const wrong: unknown[] = [
      [],
      grid().slice(0, GRID_HEIGHT - 1),
      [...grid(), grid()[0]],
      grid().map((row) => row.slice(0, GRID_WIDTH - 1)),
      grid().map((row) => [...row, null]),
      grid().map((row, y) => (y === 0 ? ['Q', ...row.slice(1)] : row)),
      grid().map((row, y) => (y === 0 ? [2, ...row.slice(1)] : row))
    ]

    for (const candidate of wrong) {
      expect(
        parseClientMessage(
          frame({ type: 'stateUpdate', state: { grid: candidate, score: 0, status: 'ready' } })
        )
      ).toBeNull()
    }
  })

  it('refuses a score that is not a whole, non-negative number', () => {
    for (const score of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '10', null, undefined]) {
      expect(
        parseClientMessage(
          frame({ type: 'stateUpdate', state: { grid: grid(), score, status: 'ready' } })
        )
      ).toBeNull()
    }
  })

  it('refuses a status the game does not have', () => {
    for (const status of ['Paused', 'done', '', null, undefined]) {
      expect(
        parseClientMessage(
          frame({ type: 'stateUpdate', state: { grid: grid(), score: 0, status } })
        )
      ).toBeNull()
    }
  })

  it('refuses an oversized frame before reading it', () => {
    const padding = 'x'.repeat(MAX_MESSAGE_LENGTH)

    expect(parseClientMessage(frame({ type: 'ping', padding }))).toBeNull()
  })
})

describe('parseServerMessage', () => {
  const peers = { you: 'c1', clients: [{ id: 'c1', state: snapshot(), connected: true }] }

  it('reads every message of the vocabulary', () => {
    expect(
      parseServerMessage(frame({ type: 'sessionInitialized', code: 'ABC234', token: 'seat-token' }))
    ).toEqual({ type: 'sessionInitialized', code: 'ABC234', token: 'seat-token' })
    expect(
      parseServerMessage(
        frame({ type: 'sessionBroadcast', code: 'ABC234', token: 'seat-token', peers })
      )
    ).toEqual({ type: 'sessionBroadcast', code: 'ABC234', token: 'seat-token', peers })
    expect(
      parseServerMessage(frame({ type: 'stateUpdate', clientId: 'c2', state: snapshot() }))
    ).toEqual({ type: 'stateUpdate', clientId: 'c2', state: snapshot() })
    expect(
      parseServerMessage(frame({ type: 'error', code: 'room-full', recovery: 'play-solo' }))
    ).toEqual({ type: 'error', code: 'room-full', recovery: 'play-solo' })
    expect(
      parseServerMessage(frame({ type: 'error', code: 'invalid-message', recovery: null }))
    ).toEqual({ type: 'error', code: 'invalid-message', recovery: null })
    expect(parseServerMessage(frame({ type: 'pong' }))).toEqual({ type: 'pong' })
  })

  it('refuses a session frame carrying no proof of the seat it names', () => {
    expect(parseServerMessage(frame({ type: 'sessionInitialized', code: 'ABC234' }))).toBeNull()
    expect(
      parseServerMessage(frame({ type: 'sessionInitialized', code: 'ABC234', token: '' }))
    ).toBeNull()
    expect(
      parseServerMessage(frame({ type: 'sessionBroadcast', code: 'ABC234', peers }))
    ).toBeNull()
  })

  it('drops what came alongside a roster entry, keeping only the fields it validated', () => {
    const noisy = {
      you: 'c1',
      clients: [{ id: 'c1', state: { ...snapshot(), extra: 'x' }, connected: true, admin: true }],
      extra: 'x'
    }

    expect(
      parseServerMessage(
        frame({ type: 'sessionBroadcast', code: 'ABC234', token: 't', peers: noisy })
      )
    ).toEqual({ type: 'sessionBroadcast', code: 'ABC234', token: 't', peers })
  })

  it('refuses an error whose code or recovery is not one of ours', () => {
    expect(parseServerMessage(frame({ type: 'error', code: 'nope', recovery: null }))).toBeNull()
    expect(parseServerMessage(frame({ type: 'error', code: 'room-full' }))).toBeNull()
    expect(
      parseServerMessage(frame({ type: 'error', code: 'room-full', recovery: 'retry' }))
    ).toBeNull()
  })

  it('refuses a roster that is not a roster of players', () => {
    const wrong: unknown[] = [
      { you: 'c1' },
      { you: 'c1', clients: {} },
      { you: 'c1', clients: [{ id: 'c1', state: snapshot() }] },
      { you: 'c1', clients: [{ id: 'c1', state: snapshot(), connected: 'yes' }] },
      { you: '', clients: [] }
    ]

    for (const candidate of wrong) {
      expect(
        parseServerMessage(frame({ type: 'sessionBroadcast', code: 'ABC234', peers: candidate }))
      ).toBeNull()
    }
  })

  it('refuses a frame that is not a JSON object', () => {
    for (const raw of ['', 'nonsense', '[]', 'null']) {
      expect(parseServerMessage(raw)).toBeNull()
    }
  })
})
