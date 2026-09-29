/**
 * The wire vocabulary of the Tetris multiplayer endpoint, in one file both
 * programs import: the browser feature that speaks it and the Bun server that
 * answers it. Nothing here touches the DOM or Bun, so the same module compiles
 * under either `tsconfig` program.
 *
 * The message names are the original's (`TituxMetal/tetrisGame`,
 * `client/modules/ConnectionManager.js` and `src/ConnectionManager.js`):
 * `initSession`, `joinSession` and `stateUpdate` incoming;
 * `sessionInitialized`, `sessionBroadcast` and `stateUpdate` outgoing. The
 * payloads are hardened rather than preserved. The original wrote whatever a
 * client sent into a server-held state object, one `[property, value]` pair at a
 * time, and threw out of its handlers when a client broke an assumption; here a
 * player relays one validated snapshot of their own board (`PeerSnapshot`), the
 * server keeps no rules of its own, and every incoming frame is checked in
 * `parseClientMessage` before a room sees it — a frame that does not validate is
 * answered with a structured `error`, never a thrown exception and never a
 * silent drop.
 *
 * Two messages the original did not have come with the hardening, not instead of
 * the vocabulary: the heartbeat (`ping`/`pong`) and the structured `error`. They
 * live here so both ends agree on their shape.
 */

/** The seven tetrominoes, in the order the original dealt them (`Piece.js:11`, `'IJLOSTZ'`). */
export type Tetromino = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

/** The seven tetrominoes as a value, for the validation the wire needs. */
export const TETROMINOES: readonly Tetromino[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

/** The field every snapshot carries: the original's `new Arena(12, 20)`, and the grid the feature draws. */
export const GRID_WIDTH = 12
export const GRID_HEIGHT = 20

/** One cell of a relayed grid: the letter of the piece resting or falling in it, or nothing. */
export type PeerCell = Tetromino | null

/** A player's own board as the opponent draws it: the falling piece already merged into the stack. */
export type PeerGrid = readonly (readonly PeerCell[])[]

/** What a game is doing, as its owner reports it. */
export type PeerStatus = 'ready' | 'running' | 'paused' | 'over'

/**
 * One player's board, relayed as it stands. The sender computes it; the server
 * only carries it, and neither side derives a game from it — the mode is
 * side-by-side play, so no board is anybody else's to decide.
 */
export type PeerSnapshot = {
  grid: PeerGrid
  score: number
  status: PeerStatus
}

/** What one player of a room is, as the room broadcasts it. */
export type SessionPeer = {
  /** The identifier the player's own browser minted. */
  id: string
  /** The last board that player relayed. */
  state: PeerSnapshot
  /** `false` while that player's socket is gone — the seat is held for a while, so a refresh can reclaim it. */
  connected: boolean
}

/** The roster a `sessionBroadcast` carries: every seat, the receiver's own among them. */
export type SessionPeers = {
  /** The receiving client's own identifier, as the original's `peers.you` had it. */
  you: string
  clients: readonly SessionPeer[]
}

/** A frame a client sends. Each one is validated at the endpoint before it reaches a room. */
export type ClientMessage =
  | { type: 'initSession'; clientId: string; state: PeerSnapshot }
  /**
   * `token` is the seat's own proof, sent back when a player returns to a room
   * they already sat in — `null` for a first seating.
   */
  | {
      type: 'joinSession'
      clientId: string
      code: string
      state: PeerSnapshot
      token: string | null
    }
  | { type: 'stateUpdate'; state: PeerSnapshot }
  | { type: 'ping' }

/**
 * Why the server refused, as a stable token: the interface owns the words, the
 * endpoint owns the reason.
 */
export type TetrisErrorCode =
  /** The frame was not a message this endpoint speaks. */
  | 'invalid-message'
  /** A session message from a connection that already holds a seat. */
  | 'already-in-room'
  /** A state update from a connection that holds no seat. */
  | 'not-in-room'
  /** The code names no live room — a new one is never created from a join. */
  | 'room-not-found'
  /** The room already holds two players. */
  | 'room-full'
  /** This connection spent its budget of join attempts. */
  | 'join-attempts-exceeded'
  /** The server could not mint a free room code. */
  | 'room-unavailable'

/** What the player can do about a refusal. */
export type RecoveryAction = 'create-room' | 'play-solo'

/**
 * A frame the server sends.
 *
 * `token` is the receiving seat's own proof of ownership, and only ever its own:
 * it is what makes "I am the player who was here" checkable, since every seat's
 * identifier is public to the room. A player is never told another player's token.
 */
export type ServerMessage =
  | { type: 'sessionInitialized'; code: string; token: string }
  | { type: 'sessionBroadcast'; code: string; token: string; peers: SessionPeers }
  | { type: 'stateUpdate'; clientId: string; state: PeerSnapshot }
  | { type: 'error'; code: TetrisErrorCode; recovery: RecoveryAction | null }
  | { type: 'pong' }

/** How long a room code is, as the original's `createId(6)` had it. */
export const ROOM_CODE_LENGTH = 6

/**
 * The characters a room code is drawn from: the original's unambiguous set
 * (`ConnectionManager.createId`, without `i`, `l`, `o`), in uppercase and with
 * `0` and `1` gone as well, so a code read aloud or copied by hand is not
 * confused with a neighbour. 31 characters, six of them — 887 million codes.
 */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * The close code a seat's former socket gets when the same identity connects
 * again — a refresh that raced its own close, or the same room open in a
 * duplicated tab. The client reads it as "the seat is not yours any more" and
 * stops reconnecting; any other close is a connection to rebuild.
 */
export const SEAT_TAKEN_CLOSE_CODE = 4001

/** How often a client pings the endpoint. */
export const HEARTBEAT_INTERVAL_MS = 15_000

/**
 * How long the endpoint tolerates silence — a ping counts as a word — before it
 * drops a connection: six ping periods, for two reasons. One lost frame is not a
 * death, and a hidden tab is not a dead one either: a browser slows the timers of
 * a tab nobody is looking at, so a player who switches away to send their friend
 * the link pings late through no fault of their own. A connection that is really
 * gone is still reaped, on the sweep's own next pass.
 */
export const HEARTBEAT_TIMEOUT_MS = 90_000

/**
 * The ceiling on one incoming frame. A board snapshot is around a kilobyte, so
 * anything past this is not a message this endpoint speaks, and the length is
 * checked before the JSON parser ever sees it.
 */
export const MAX_MESSAGE_LENGTH = 64 * 1024

/** A client identifier is a UUID the browser minted; the bound keeps an oversized frame out of the room. */
const MAX_IDENTIFIER_LENGTH = 64

/**
 * The `code` a client sends, whatever it carries. What a code names is the
 * registry lookup's question, not the parser's: an unknown or malformed one is
 * answered `room-not-found` with `create-room`, the contract the ticket fixes, so
 * it must reach the lookup instead of being refused here as a message the
 * endpoint cannot read. The frame's own ceiling (`MAX_MESSAGE_LENGTH`) is what
 * bounds this field.
 */
const isInboundCode = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

/**
 * A room code is six characters; the bound here is only the frame's, on the
 * endpoint's own frames, so a code of an unexpected shape is still a frame the
 * client can read rather than one it drops.
 */
const MAX_ROOM_CODE_LENGTH = 32

/**
 * A seat token is 32 hexadecimal characters minted by the endpoint. The bound is
 * the frame's, like the others: a token of the wrong shape is a token that will
 * not match a seat, and the reclaim rule refuses it there.
 */
const MAX_TOKEN_LENGTH = 64

const PEER_STATUSES: readonly PeerStatus[] = ['ready', 'running', 'paused', 'over']

const ERROR_CODES: readonly TetrisErrorCode[] = [
  'invalid-message',
  'already-in-room',
  'not-in-room',
  'room-not-found',
  'room-full',
  'join-attempts-exceeded',
  'room-unavailable'
]

/**
 * A frame, opened only as far as the fields this endpoint reads. The shape is
 * taken at the boundary — a parsed JSON value is an object or the frame is
 * refused — and every field is then checked for itself.
 */
const asFrame = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const isIdentifier = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= MAX_IDENTIFIER_LENGTH

/** A room code the endpoint itself sends, bounded as a frame field. */
const isOutboundCode = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= MAX_ROOM_CODE_LENGTH

const isSeatToken = (value: unknown): value is string | null =>
  value === null ||
  (typeof value === 'string' && value.length > 0 && value.length <= MAX_TOKEN_LENGTH)

const isPeerCell = (value: unknown): value is PeerCell =>
  value === null || TETROMINOES.includes(value as Tetromino)

const isPeerGrid = (value: unknown): value is PeerGrid =>
  Array.isArray(value) &&
  value.length === GRID_HEIGHT &&
  value.every((row) => Array.isArray(row) && row.length === GRID_WIDTH && row.every(isPeerCell))

const isPeerStatus = (value: unknown): value is PeerStatus =>
  PEER_STATUSES.includes(value as PeerStatus)

/**
 * A board as the fields that validated, and nothing else — `null` when the frame
 * is not a board this vocabulary carries.
 *
 * The rebuild is the point: the endpoint stores what a player relayed and hands
 * it on to the other player, so a seat must hold a board and not whatever a
 * client sent alongside one. The grid itself is handed over by reference: it has
 * been read cell by cell, and a JSON array carries nothing but its cells.
 */
const asPeerSnapshot = (value: unknown): PeerSnapshot | null => {
  const frame = asFrame(value)
  if (frame === null) return null

  const { grid, score, status } = frame

  if (
    !isPeerGrid(grid) ||
    typeof score !== 'number' ||
    !Number.isInteger(score) ||
    score < 0 ||
    !isPeerStatus(status)
  ) {
    return null
  }

  return { grid, score, status }
}

/** One seat of a roster, rebuilt like a board is. */
const asSessionPeer = (value: unknown): SessionPeer | null => {
  const frame = asFrame(value)
  if (frame === null) return null

  const state = asPeerSnapshot(frame.state)

  if (state === null || !isIdentifier(frame.id) || typeof frame.connected !== 'boolean') return null

  return { id: frame.id, state, connected: frame.connected }
}

/** A roster, rebuilt seat by seat. */
const asSessionPeers = (value: unknown): SessionPeers | null => {
  const frame = asFrame(value)
  if (frame === null || !isIdentifier(frame.you) || !Array.isArray(frame.clients)) return null

  const clients: SessionPeer[] = []

  for (const client of frame.clients) {
    const peer = asSessionPeer(client)
    if (peer === null) return null

    clients.push(peer)
  }

  return { you: frame.you, clients }
}

/** A parsed frame, or `null` when the frame is not one of ours. */
const parseFrame = (raw: string): unknown => {
  if (raw.length === 0 || raw.length > MAX_MESSAGE_LENGTH) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * A frame a client sent, as a validated message — or `null`, which the endpoint
 * answers with an `invalid-message` error. Every object is rebuilt from the
 * fields that validated rather than cast, so nothing a client invented travels
 * on, and the grids inside are handed over by reference rather than copied: their
 * cells, their count and their width have all been read.
 */
export const parseClientMessage = (raw: string): ClientMessage | null => {
  const frame = asFrame(parseFrame(raw))
  if (frame === null) return null

  const { type, clientId, code, state, token } = frame

  switch (type) {
    case 'initSession': {
      const snapshot = asPeerSnapshot(state)

      return isIdentifier(clientId) && snapshot !== null
        ? { type: 'initSession', clientId, state: snapshot }
        : null
    }
    case 'joinSession': {
      const snapshot = asPeerSnapshot(state)

      return isIdentifier(clientId) &&
        isInboundCode(code) &&
        snapshot !== null &&
        isSeatToken(token)
        ? { type: 'joinSession', clientId, code, state: snapshot, token }
        : null
    }
    case 'stateUpdate': {
      const snapshot = asPeerSnapshot(state)

      return snapshot === null ? null : { type: 'stateUpdate', state: snapshot }
    }
    case 'ping':
      return { type: 'ping' }
    default:
      return null
  }
}

/**
 * A frame the server sent, as a validated message — or `null`, which the client
 * drops: its own endpoint always speaks this vocabulary, and a frame that does
 * not is no reason to tear down a connection the heartbeat is watching anyway.
 */
export const parseServerMessage = (raw: string): ServerMessage | null => {
  const frame = asFrame(parseFrame(raw))
  if (frame === null) return null

  const { type, clientId, code, state, token, peers, recovery } = frame

  switch (type) {
    case 'sessionInitialized':
      return isOutboundCode(code) && typeof token === 'string' && token.length > 0
        ? { type: 'sessionInitialized', code, token }
        : null

    case 'sessionBroadcast': {
      const roster = asSessionPeers(peers)

      return isOutboundCode(code) &&
        typeof token === 'string' &&
        token.length > 0 &&
        roster !== null
        ? { type: 'sessionBroadcast', code, token, peers: roster }
        : null
    }

    case 'stateUpdate': {
      const snapshot = asPeerSnapshot(state)

      return isIdentifier(clientId) && snapshot !== null
        ? { type: 'stateUpdate', clientId, state: snapshot }
        : null
    }

    case 'error':
      return isTetrisErrorCode(code) && isRecoveryAction(recovery)
        ? { type: 'error', code, recovery }
        : null

    case 'pong':
      return { type: 'pong' }

    default:
      return null
  }
}

const isTetrisErrorCode = (value: unknown): value is TetrisErrorCode =>
  ERROR_CODES.includes(value as TetrisErrorCode)

const isRecoveryAction = (value: unknown): value is RecoveryAction | null =>
  value === null || value === 'create-room' || value === 'play-solo'
