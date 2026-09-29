import {
  type ClientMessage,
  HEARTBEAT_INTERVAL_MS,
  HEARTBEAT_TIMEOUT_MS,
  type PeerSnapshot,
  parseServerMessage,
  SEAT_TAKEN_CLOSE_CODE,
  type ServerMessage
} from '~/shared/tetris-protocol'
import { readSeatToken, writeSeatToken } from './seat-token'

/**
 * The visitor's end of the endpoint: one socket, the heartbeat that watches it,
 * and the rebuild that follows it if it goes.
 *
 * The session owns nothing the interface shows — it reports what happened and the
 * hook turns that into a room. It is not a React module: everything here is a
 * socket, a timer and an intent, which is exactly what has to be released when
 * the visitor leaves the feature.
 *
 * The endpoint is the visitor's own origin, `/ws/tetris`, with the room code in
 * the page's fragment rather than in the address: a URL a player can read aloud
 * never carries a code to a log.
 */

/** What the session tells the interface. */
type RoomSessionEvents = {
  /** The socket is up: the frames that seat the visitor are on their way. */
  onOpen: () => void
  /** A frame the visitor's end understood. */
  onMessage: (message: ServerMessage) => void
  /**
   * The connection is over: `seat-taken` when the identity came back elsewhere,
   * `unreachable` when the rebuild budget ran out without a single seating, `lost`
   * otherwise.
   */
  onClose: (cause: 'seat-taken' | 'lost' | 'unreachable') => void
}

export type RoomSession = {
  /** Opens a room of the visitor's own, `initSession`. */
  init: () => void
  /** Asks for a seat in an existing room, `joinSession`. */
  join: (code: string) => void
  /** Sends the player's own board, `stateUpdate`. */
  relay: (snapshot: PeerSnapshot) => void
  /** Releases everything: the socket, the heartbeat and any pending rebuild. */
  close: () => void
}

/**
 * How long the visitor's end waits for any frame before it calls the socket dead.
 *
 * The same tolerance the endpoint gives the visitor, which is deliberate: a
 * browser slows the timers of a tab nobody is looking at, so a hidden tab pings
 * late — up to a minute late — and a shorter patience would tear down a
 * perfectly healthy game every time a player switched away to send their friend
 * the link. A clean close needs no patience at all: the browser reports it, and
 * this only catches the path that goes quiet while the socket still claims to be
 * open — a phone that left the network, a proxy that dropped the connection
 * without saying so.
 */
const STALE_AFTER_MS = HEARTBEAT_TIMEOUT_MS

/** The first rebuild waits a second, then ever longer, so a server that is down is not hammered. */
const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 10_000

/**
 * How many rebuilds the ladder spends before the visitor is told the room is not
 * coming back. Six, which the backoff above spreads over about thirty-five
 * seconds — comfortably past the endpoint's own fifteen-second seat grace, so a
 * seat a live server is holding is reclaimed rather than abandoned, and short
 * enough that an endpoint that is really gone is named instead of being retried
 * behind a notice that keeps promising another attempt. A successful seating
 * resets the budget, so a transient blip — one rebuild, seated again — never
 * counts towards it.
 */
const MAX_RECONNECT_ATTEMPTS = 6

/** One connection, as the session drives it: a frame out, and the close that ends it. */
export type RoomSocket = {
  /** Whether the connection is up; a frame is only written to a socket that is. */
  readonly open: boolean
  /** One frame, as the JSON text the vocabulary is written in. */
  send: (frame: string) => void
  /** Ends the connection. The close it causes is one the session already knows about. */
  close: () => void
}

/** The three moments of a connection the session reads, wired as it is opened. */
export type RoomSocketHandlers = {
  onOpen: () => void
  onFrame: (data: unknown) => void
  onClose: (code: number) => void
}

/**
 * The timers the session schedules — the heartbeat's period, the rebuild's
 * backoff, and the cancellation of either — so the lifecycle a spec has to
 * observe is driven by the spec's clock rather than the wall's.
 */
export type RoomTimers = {
  setInterval: (tick: () => void, ms: number) => Timer
  clearInterval: (handle: Timer) => void
  setTimeout: (tick: () => void, ms: number) => Timer
  clearTimeout: (handle: Timer) => void
}

/** What the session opens and schedules with: the platform's, unless a spec says otherwise. */
export type RoomSessionDeps = {
  connect: (handlers: RoomSocketHandlers) => RoomSocket
  timers: RoomTimers
}

/**
 * The platform's own socket and clock — the endpoint being the visitor's own
 * origin, `/ws/tetris`, which is built here rather than in the session, so the
 * session itself reads nothing off `window`.
 *
 * The timers are wrapped rather than handed over as bare globals: the session
 * calls them off `deps.timers`, and `window.setInterval` invoked as a method of
 * anything but `window` is an illegal invocation that throws. A plain call keeps
 * the receiver the platform insists on.
 *
 * A `WebSocket` reports its open, its frames and its close from the event loop,
 * never before `connect` returns, which is what lets the session tie a close to
 * the socket it opened.
 */
const platformDeps: RoomSessionDeps = {
  connect: (handlers) => {
    const socket = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/tetris`
    )

    socket.addEventListener('open', () => handlers.onOpen())
    socket.addEventListener('message', (event) => handlers.onFrame(event.data))
    socket.addEventListener('close', (event) => handlers.onClose(event.code))

    return {
      get open() {
        return socket.readyState === WebSocket.OPEN
      },
      send: (frame) => socket.send(frame),
      close: () => socket.close()
    }
  },
  timers: {
    setInterval: (tick, ms) => setInterval(tick, ms),
    clearInterval: (handle) => clearInterval(handle),
    setTimeout: (tick, ms) => setTimeout(tick, ms),
    clearTimeout: (handle) => clearTimeout(handle)
  }
}

export const createRoomSession = (
  clientId: string,
  currentSnapshot: () => PeerSnapshot,
  events: RoomSessionEvents,
  deps: RoomSessionDeps = platformDeps
): RoomSession => {
  let socket: RoomSocket | null = null
  /** What to ask the endpoint for: set by `init`/`join`, replayed on every rebuild. */
  let intent: { kind: 'init' } | { kind: 'join'; code: string } | null = null
  /**
   * The seat's proof as this session last heard it. Storage carries it across a
   * reload; this carries it across a rebuild, where the fragment a player arrived
   * with is not necessarily the code the endpoint answered with.
   */
  let seatToken: string | null = null
  let seated = false
  let closed = false
  let attempts = 0
  let lastFrameAt = 0
  let heartbeat: Timer | null = null
  let rebuild: Timer | null = null

  const send = (message: ClientMessage): void => {
    if (socket?.open !== true) return

    socket.send(JSON.stringify(message))
  }

  const ask = (): void => {
    if (intent === null) return

    if (intent.kind === 'init') {
      send({ type: 'initSession', clientId, state: currentSnapshot() })
      return
    }

    send({
      type: 'joinSession',
      clientId,
      code: intent.code,
      state: currentSnapshot(),
      token: seatToken ?? readSeatToken(intent.code)
    })
  }

  const stopHeartbeat = (): void => {
    if (heartbeat === null) return

    deps.timers.clearInterval(heartbeat)
    heartbeat = null
  }

  const rebuildLater = (): void => {
    if (closed || rebuild !== null) return

    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempts, RECONNECT_MAX_MS)
    attempts += 1

    rebuild = deps.timers.setTimeout(() => {
      rebuild = null
      open()
    }, delay)
  }

  /**
   * The connection is over. The seat stays at the endpoint for a while, so the
   * rebuild reclaims it rather than arriving as a stranger — unless the seat went
   * to the identity itself, in another tab, where rebuilding would only fight for
   * it, or unless the budget is spent and not one rebuild has found the endpoint.
   */
  const drop = (cause: 'seat-taken' | 'lost'): void => {
    socket = null
    seated = false
    stopHeartbeat()

    if (cause === 'seat-taken') {
      events.onClose('seat-taken')
      return
    }

    if (attempts >= MAX_RECONNECT_ATTEMPTS) {
      // Every attempt the budget allowed has gone unanswered: the room is not
      // coming back through this door, and a notice promising another attempt
      // would be a lie. The visitor is told, and the way out is playing alone.
      events.onClose('unreachable')
      return
    }

    events.onClose('lost')
    rebuildLater()
  }

  /** One ping per period, and the watchdog reading the same clock. */
  const beat = (): void => {
    if (socket?.open !== true) return

    if (Date.now() - lastFrameAt > STALE_AFTER_MS) {
      const dead = socket
      drop('lost')
      // Closing after the drop, so the abandoned socket's own close event is one
      // the session already knows about and does not count twice.
      dead.close()
      return
    }

    send({ type: 'ping' })
  }

  const open = (): void => {
    if (closed) return

    lastFrameAt = Date.now()

    const opening = deps.connect({
      onOpen: () => {
        lastFrameAt = Date.now()
        stopHeartbeat()
        heartbeat = deps.timers.setInterval(beat, HEARTBEAT_INTERVAL_MS)
        events.onOpen()
        ask()
      },
      onFrame: (data) => {
        lastFrameAt = Date.now()
        if (typeof data !== 'string') return

        const message = parseServerMessage(data)
        if (message === null) return

        if (message.type === 'sessionInitialized' || message.type === 'sessionBroadcast') {
          // The proof of this seat, kept for the tab: a refresh, or a connection
          // that has to be rebuilt, comes back with it and returns to the same seat.
          seatToken = message.token
          writeSeatToken(message.code, message.token)
          seated = true
          attempts = 0
        }

        if (message.type === 'sessionInitialized') {
          // The room exists now: a rebuild asks to rejoin it rather than opening a
          // second one under a new code the player's friend does not have.
          intent = { kind: 'join', code: message.code }
        }

        events.onMessage(message)
      },
      onClose: (code) => {
        // A socket the session has already given up on — a stale one it closed, or
        // a seat the endpoint handed to another tab — is not the connection's end.
        if (socket !== opening) return

        drop(code === SEAT_TAKEN_CLOSE_CODE ? 'seat-taken' : 'lost')
      }
    })

    socket = opening
  }

  return {
    init: () => {
      intent = { kind: 'init' }

      if (socket === null) open()
      else ask()
    },
    join: (code) => {
      intent = { kind: 'join', code }

      if (socket === null) open()
      else ask()
    },
    relay: (snapshot) => {
      if (!seated) return

      send({ type: 'stateUpdate', state: snapshot })
    },
    close: () => {
      closed = true

      if (rebuild !== null) {
        deps.timers.clearTimeout(rebuild)
        rebuild = null
      }

      stopHeartbeat()

      const leaving = socket
      socket = null
      seated = false
      leaving?.close()
    }
  }
}
