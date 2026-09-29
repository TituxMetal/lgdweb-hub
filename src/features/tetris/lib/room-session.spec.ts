import { describe, expect, it } from 'bun:test'
import {
  type ClientMessage,
  GRID_HEIGHT,
  GRID_WIDTH,
  HEARTBEAT_INTERVAL_MS,
  type PeerGrid,
  type PeerSnapshot,
  SEAT_TAKEN_CLOSE_CODE,
  type ServerMessage
} from '~/shared/tetris-protocol'
import {
  createRoomSession,
  type RoomSessionDeps,
  type RoomSocket,
  type RoomSocketHandlers,
  type RoomTimers
} from './room-session'

/**
 * The visitor's end of the socket, observed where it is supposed to be
 * observable: the frames it writes, the timers it holds, and what it reports when
 * the connection goes.
 *
 * A socket and a clock are the whole conversation here — the session reads
 * nothing else off its platform — so both are injected, and the lifecycle the
 * spec has to prove is the spec's to drive: a heartbeat it can see scheduled, a
 * rebuild it can step through one backoff at a time, and a visit it can end and
 * then check left nothing behind. Acceptance criterion 7's client half and the
 * "ghost room" decision 8 binds are what these cases stand on.
 */

/** A connection the test drives, standing in for the platform's `WebSocket`. */
type FakeSocket = {
  /** What the session holds. */
  handle: RoomSocket
  /** Every frame the session sent, parsed back from the text it wrote. */
  sent: ClientMessage[]
  /** Whether the session itself closed it. */
  closed: boolean
  /** The connection came up. Fired after `connect` returned, as a real socket's events are. */
  opened: () => void
  /** One frame from the endpoint. */
  received: (payload: ServerMessage) => void
  /** The connection went away, with the code the endpoint gave it. */
  dropped: (code?: number) => void
}

/** The session's clock, with the delays it asked for and the timers it cancelled. */
type FakeClock = {
  timers: RoomTimers
  /** The delays of the timers still scheduled, in the order they were set. */
  delays: () => number[]
  /** Fires every timer due within `ms`; a periodic timer fires once per advance. */
  advance: (ms: number) => void
}

const createClock = (): FakeClock => {
  let nextId = 0
  const pending = new Map<number, { delay: number; run: () => void; periodic: boolean }>()

  const cancel = (handle: Timer): void => {
    pending.delete(handle as unknown as number)
  }

  return {
    timers: {
      setInterval: (run, delay) => {
        const id = ++nextId
        pending.set(id, { delay, run, periodic: true })

        return id as unknown as Timer
      },
      clearInterval: cancel,
      setTimeout: (run, delay) => {
        const id = ++nextId
        pending.set(id, { delay, run, periodic: false })

        return id as unknown as Timer
      },
      clearTimeout: cancel
    },
    delays: () => [...pending.values()].map((timer) => timer.delay),
    advance: (ms) => {
      for (const [id, timer] of [...pending]) {
        if (timer.delay > ms) continue

        if (!timer.periodic) pending.delete(id)
        timer.run()
      }
    }
  }
}

const grid: PeerGrid = Array.from({ length: GRID_HEIGHT }, () =>
  Array.from({ length: GRID_WIDTH }, () => null)
)

const snapshot: PeerSnapshot = { grid, score: 0, status: 'running' }

const sessionInitialized: ServerMessage = {
  type: 'sessionInitialized',
  code: 'ABC234',
  token: 'seat-token'
}

/**
 * A session over a fake platform: every socket it opens is kept, so the test can
 * open it, feed it a frame, or take it away.
 */
const harness = () => {
  const clock = createClock()
  const sockets: FakeSocket[] = []
  const closes: ('seat-taken' | 'lost' | 'unreachable')[] = []

  const deps: RoomSessionDeps = {
    connect: (handlers: RoomSocketHandlers) => {
      const sent: ClientMessage[] = []
      let isOpen = false
      let closed = false

      const socket: FakeSocket = {
        handle: {
          get open() {
            return isOpen
          },
          send: (frame) => {
            sent.push(JSON.parse(frame) as ClientMessage)
          },
          close: () => {
            isOpen = false
            closed = true
          }
        },
        sent,
        get closed() {
          return closed
        },
        opened: () => {
          isOpen = true
          handlers.onOpen()
        },
        received: (payload) => handlers.onFrame(JSON.stringify(payload)),
        dropped: (code = 1006) => {
          isOpen = false
          handlers.onClose(code)
        }
      }

      sockets.push(socket)

      return socket.handle
    },
    timers: clock.timers
  }

  const session = createRoomSession(
    'client-1',
    () => snapshot,
    { onOpen: () => {}, onMessage: () => {}, onClose: (cause) => closes.push(cause) },
    deps
  )

  return { session, sockets, clock, closes }
}

/** The socket the session opened last; every case gets there by opening one. */
const current = (sockets: FakeSocket[]): FakeSocket => sockets[sockets.length - 1] as FakeSocket

describe('createRoomSession', () => {
  it('asks to open a room on the first open, and pings on the heartbeat it started', () => {
    const { session, sockets, clock } = harness()

    session.init()
    expect(sockets).toHaveLength(1)

    const socket = current(sockets)
    socket.opened()

    expect(socket.sent).toEqual([{ type: 'initSession', clientId: 'client-1', state: snapshot }])
    expect(clock.delays()).toEqual([HEARTBEAT_INTERVAL_MS])

    clock.advance(HEARTBEAT_INTERVAL_MS)

    expect(socket.sent.map((frame) => frame.type)).toEqual(['initSession', 'ping'])
  })

  it('replays the intent on every rebuild: init first, then a join carrying the seat’s own token', () => {
    const { session, sockets, clock } = harness()

    session.init()
    const first = current(sockets)
    first.opened()
    first.received(sessionInitialized)

    first.dropped()
    clock.advance(1_000)

    const second = current(sockets)
    second.opened()

    // The room exists now, so the rebuild rejoins it under the code the endpoint
    // minted and the proof it handed this seat — not a second room.
    expect(second.sent).toEqual([
      {
        type: 'joinSession',
        clientId: 'client-1',
        code: 'ABC234',
        state: snapshot,
        token: 'seat-token'
      }
    ])
  })

  it('rebuilds a lost connection with a doubling backoff, and a seating resets the ladder', () => {
    const { session, sockets, clock, closes } = harness()

    session.init()
    const first = current(sockets)
    first.opened()
    first.dropped()

    expect(closes).toEqual(['lost'])
    expect(clock.delays()).toEqual([1_000])

    clock.advance(1_000)
    const second = current(sockets)
    second.opened()
    second.dropped()

    expect(clock.delays()).toEqual([2_000])

    clock.advance(2_000)
    const third = current(sockets)
    third.opened()
    third.received(sessionInitialized)
    third.dropped()

    // Seated once, so the next loss starts the ladder over at its first step: a
    // transient blip never advances the budget that ends the room.
    expect(clock.delays()).toEqual([1_000])
  })

  it('reads a seat taken away by another tab as the end of the ladder, not a connection to rebuild', () => {
    const { session, sockets, clock, closes } = harness()

    session.init()
    const socket = current(sockets)
    socket.opened()
    socket.received(sessionInitialized)

    socket.dropped(SEAT_TAKEN_CLOSE_CODE)

    expect(closes).toEqual(['seat-taken'])
    expect(clock.delays()).toEqual([])

    clock.advance(HEARTBEAT_INTERVAL_MS * 4)

    // Reconnecting here would only fight the tab that holds the seat.
    expect(sockets).toHaveLength(1)
  })

  it('stops rebuilding once the budget is spent, and says the room could not be reached', () => {
    const { session, sockets, clock, closes } = harness()

    session.init()

    // The ladder's own shape: a second, then ever longer up to the cap — six
    // rebuilds, which is what keeps a room that never opens from waiting forever.
    for (const delay of [1_000, 2_000, 4_000, 8_000, 10_000, 10_000]) {
      current(sockets).opened()
      current(sockets).dropped()

      expect(clock.delays()).toEqual([delay])
      clock.advance(delay)
    }

    const last = current(sockets)
    last.opened()
    last.dropped()

    expect(closes).toEqual(['lost', 'lost', 'lost', 'lost', 'lost', 'lost', 'unreachable'])
    expect(clock.delays()).toEqual([])

    clock.advance(HEARTBEAT_INTERVAL_MS * 4)

    expect(sockets).toHaveLength(7)
  })

  it('closes the socket and stops the heartbeat when the visitor leaves', () => {
    const { session, sockets, clock } = harness()

    session.init()
    const socket = current(sockets)
    socket.opened()
    socket.received(sessionInitialized)

    expect(clock.delays()).toEqual([HEARTBEAT_INTERVAL_MS])

    session.close()

    expect(socket.closed).toBe(true)
    expect(clock.delays()).toEqual([])

    // Neither a heartbeat nor a relay survives the visit: nothing is written to
    // the socket that was left behind, and advancing the clock writes nothing.
    clock.advance(HEARTBEAT_INTERVAL_MS * 4)
    session.relay(snapshot)

    expect(sockets).toHaveLength(1)
    expect(socket.sent.map((frame) => frame.type)).toEqual(['initSession'])
  })

  it('cancels a pending rebuild when the visitor leaves, so nothing opens a socket again', () => {
    const { session, sockets, clock } = harness()

    session.init()
    const socket = current(sockets)
    socket.opened()
    socket.dropped()

    // The connection went and the ladder was armed; the visit ends before it fires.
    expect(clock.delays()).toEqual([1_000])

    session.close()

    expect(clock.delays()).toEqual([])

    clock.advance(HEARTBEAT_INTERVAL_MS * 4)

    expect(sockets).toHaveLength(1)
  })
})
