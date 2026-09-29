import {
  type PeerSnapshot,
  type RecoveryAction,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  SEAT_TAKEN_CLOSE_CODE,
  type ServerMessage,
  type SessionPeer,
  type TetrisErrorCode
} from '../../../shared/tetrisProtocol'

/**
 * The rooms the endpoint holds, in memory and nowhere else: a room is a code and
 * at most two seats, each seat a player's last relayed board. A server restart
 * loses every room, which the design accepts — there is no persistence, and no
 * authority either: the room carries a player's snapshot to the other seat and
 * never reads a board for itself.
 *
 * The module knows nothing about the WebSocket library. It sends through
 * `PeerSocket`, a two-method view of a connection, so the room's own rules — the
 * two-player cap, the held seat, the refusal that names why — can be read on
 * their own.
 */

/** The players a room holds, as the design fixes it: two, head to head. */
const ROOM_CAPACITY = 2

/**
 * How long a seat is held after its socket is gone, so a refresh — or a
 * reconnect whose backoff is a second at its first step — reclaims it instead of
 * arriving as a third player. A seat nobody comes back to is released, and the
 * room with its last seat.
 */
const SEAT_GRACE_MS = 15_000

/** How many `joinSession` frames one connection spends before it is refused without a lookup. */
export const MAX_JOIN_ATTEMPTS = 8

/** How many codes a room creation tries before giving up on finding a free one. */
const MAX_CODE_ATTEMPTS = 64

/** What a room needs of a connection: the two things it can do to a player. */
export type PeerSocket = {
  send: (message: ServerMessage) => void
  close: (code: number, reason: string) => void
}

/** What the player can do about a refusal: the endpoint's own policy, sent with the code. */
export const RECOVERY_BY_CODE: Readonly<Record<TetrisErrorCode, RecoveryAction | null>> = {
  'invalid-message': null,
  'already-in-room': null,
  'not-in-room': null,
  'room-not-found': 'create-room',
  'room-full': 'play-solo',
  'join-attempts-exceeded': 'play-solo',
  'room-unavailable': 'play-solo'
}

/**
 * What a session message did: the room it landed the player in and the seat's own
 * proof, or the reason it was refused. The reason is a code only — what the player
 * can do about it is the endpoint's policy and stays in `RECOVERY_BY_CODE`, told
 * with the code rather than beside it.
 */
type RoomOutcome = { ok: true; code: string; token: string } | { ok: false; code: TetrisErrorCode }

type Seat = {
  clientId: string
  /**
   * The seat's proof of ownership, known to its holder alone. The identifier
   * beside it is not a secret — every seat of a room is told every other seat's
   * identifier — so the token is what makes "I am the player who was here" a
   * question the endpoint can answer.
   */
  token: string
  /** The socket that holds the seat, or `null` while the player is away and the grace runs. */
  socket: PeerSocket | null
  /** The last board this player relayed — what a joiner is handed on arrival. */
  state: PeerSnapshot
  /** The timer that releases the seat at the end of the grace, or `null` while it is held. */
  expiry: Timer | null
}

type Room = {
  code: string
  /**
   * A `Map` because the key space is the players' own identifiers, added and
   * removed as they come and go — not a fixed set of names.
   */
  seats: Map<string, Seat>
}

/**
 * A room code: six characters drawn from the alphabet above, taken from the
 * platform's cryptographic source. The original's `createId` used `Math.random`
 * (`ConnectionManager.js`), a predictable sequence rather than a secret; a code
 * is the only thing standing between a room and a stranger, so it is drawn the
 * way a token is.
 *
 * The bytes past the last whole multiple of the alphabet are rejected rather
 * than folded in with a modulo, which would favour the first characters. A pass
 * draws exactly the characters still missing, so a rejected byte shortens that
 * pass instead of being made up for by a full one — the code is six characters,
 * always, and not six-or-more.
 */
export const createRoomCode = (): string => {
  const bound = 256 - (256 % ROOM_CODE_ALPHABET.length)
  const drawn: string[] = []

  while (drawn.length < ROOM_CODE_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH - drawn.length))

    for (const byte of bytes) {
      if (byte < bound) drawn.push(ROOM_CODE_ALPHABET.charAt(byte % ROOM_CODE_ALPHABET.length))
    }
  }

  return drawn.join('')
}

/** How many bytes a seat token carries. 128 bits: not a thing to guess. */
const SEAT_TOKEN_BYTES = 16

/**
 * A seat's proof of ownership: sixteen random bytes, written the way a token is
 * written rather than the way a code a player reads aloud is. It travels to its
 * own seat only, and a claim on a seat without it is refused like any other third
 * player — which is what keeps a seat a return rather than a takeover, since an
 * identifier is told to the whole room and a token is not.
 */
const createSeatToken = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(SEAT_TOKEN_BYTES)), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')

/**
 * A code is written by a player's friend as often as it is clicked, so a lookup
 * forgives the case and the padding around a paste.
 */
const normalize = (code: string): string => code.trim().toUpperCase()

export class RoomRegistry {
  /** Rooms by code, minted and dropped as they are created and emptied. */
  private readonly rooms = new Map<string, Room>()

  /**
   * `initSession`: a fresh room, its maker its first player. A code is never
   * reused and a join never creates, so an unknown code can only ever be refused.
   */
  init(clientId: string, state: PeerSnapshot, socket: PeerSocket): RoomOutcome {
    const code = this.mintCode()
    if (code === null) return { ok: false, code: 'room-unavailable' }

    const room: Room = { code, seats: new Map() }
    this.rooms.set(code, room)

    const seat = this.seat(room, clientId, state, socket)

    return { ok: true, code, token: seat.token }
  }

  /**
   * `joinSession`: the seat of a player coming back, or a place in a room that
   * has one, or a refusal that names why — never a room of its own.
   *
   * A seat that already exists is reclaimed by its holder, and the identifier
   * alone does not make someone its holder: a token that does not match — or no
   * token at all — is refused as the room being full, which it is. A player
   * coming back after a reload holds the token the endpoint gave them; a player
   * who never sat there does not.
   */
  join(
    clientId: string,
    code: string,
    state: PeerSnapshot,
    socket: PeerSocket,
    token: string | null
  ): RoomOutcome {
    const room = this.rooms.get(normalize(code))
    if (room === undefined) return { ok: false, code: 'room-not-found' }

    const seat = room.seats.get(clientId)

    if (seat === undefined) {
      if (room.seats.size >= ROOM_CAPACITY) {
        return { ok: false, code: 'room-full' }
      }

      const seated = this.seat(room, clientId, state, socket)
      this.broadcast(room)

      return { ok: true, code: room.code, token: seated.token }
    }

    if (token === null || token !== seat.token) {
      return { ok: false, code: 'room-full' }
    }

    this.reclaim(seat, state, socket)
    this.broadcast(room)

    return { ok: true, code: room.code, token: seat.token }
  }

  /**
   * `stateUpdate`: the player's own board, stored as the seat's and carried to
   * the other seat. The sender is never echoed to; the room reads nothing out of
   * the board it carries.
   */
  relay(code: string, clientId: string, state: PeerSnapshot): boolean {
    const room = this.rooms.get(code)
    const seat = room?.seats.get(clientId)
    if (room === undefined || seat === undefined) return false

    seat.state = state

    for (const other of room.seats.values()) {
      if (other.clientId !== clientId) {
        other.socket?.send({ type: 'stateUpdate', clientId, state })
      }
    }

    return true
  }

  /**
   * A connection is gone. Its seat stays, held for the grace so a player whose
   * socket died — or whose tab reloaded — comes back to the place they left,
   * rather than to a room that counted them out. The other player is told.
   *
   * The socket is named because a close races the identity that replaced it: a
   * reconnected client's own close must not unseat the seat it has just taken.
   */
  leave(code: string, clientId: string, socket: PeerSocket): void {
    const room = this.rooms.get(code)
    const seat = room?.seats.get(clientId)
    if (room === undefined || seat === undefined || seat.socket !== socket) return

    seat.socket = null
    seat.expiry = this.expire(() => this.release(room, clientId))
    this.broadcast(room)
  }

  /** A fresh seat, its socket the one that asked for it and its token freshly minted. */
  private seat(room: Room, clientId: string, state: PeerSnapshot, socket: PeerSocket): Seat {
    const seat: Seat = { clientId, token: createSeatToken(), socket, state, expiry: null }
    room.seats.set(clientId, seat)

    return seat
  }

  /**
   * The same identity, on a new socket: the seat is kept — its place in the room,
   * and which of the two it is — and the socket that holds it moves to the one
   * asking. The socket left behind is closed with the code that tells it the seat
   * is not its own any more, so the tab that lost it does not reconnect in a
   * loop against the tab that took it.
   */
  private reclaim(seat: Seat, state: PeerSnapshot, socket: PeerSocket): void {
    const previous = seat.socket

    if (seat.expiry !== null) {
      clearTimeout(seat.expiry)
      seat.expiry = null
    }

    seat.socket = socket
    seat.state = state

    if (previous !== null && previous !== socket) {
      previous.close(SEAT_TAKEN_CLOSE_CODE, 'seat reclaimed')
    }
  }

  /** The end of a seat's grace: released, unless a reconnect took it back in the meantime. */
  private release(room: Room, clientId: string): void {
    const seat = room.seats.get(clientId)
    if (seat === undefined || seat.socket !== null) return

    room.seats.delete(clientId)

    if (room.seats.size === 0) {
      this.rooms.delete(room.code)
      return
    }

    this.broadcast(room)
  }

  /**
   * Every seat, as each of them is told the room stands — with its own token and
   * nobody else's: the roster names the players, and only the seat being written
   * to is told the proof that keeps it its own.
   */
  private broadcast(room: Room): void {
    const clients: SessionPeer[] = [...room.seats.values()].map((seat) => ({
      id: seat.clientId,
      state: seat.state,
      connected: seat.socket !== null
    }))

    for (const seat of room.seats.values()) {
      seat.socket?.send({
        type: 'sessionBroadcast',
        code: room.code,
        token: seat.token,
        peers: { you: seat.clientId, clients }
      })
    }
  }

  private mintCode(): string | null {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = createRoomCode()
      if (!this.rooms.has(code)) return code
    }

    return null
  }

  /**
   * A timer that never holds the process open on its own: the server lives
   * because it serves, and a test that stops the server must not wait out a grace.
   */
  private expire(release: () => void): Timer {
    const timer = setTimeout(release, SEAT_GRACE_MS)
    timer.unref()

    return timer
  }
}
