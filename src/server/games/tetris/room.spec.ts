import { describe, expect, it } from 'bun:test'
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  type PeerSnapshot,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  type ServerMessage
} from '../../../shared/tetrisProtocol'
import { createRoomCode, type PeerSocket, RoomRegistry } from './room'

/**
 * The generator on its own, because the integration test can only mint a couple
 * of codes per run and this shape is a probability question: the draw rejects the
 * bytes the 31-character alphabet cannot cover evenly, and a draw that folds a
 * short pass into a full one mints six-or-more characters a sixth of the time —
 * rare enough to slip through a couple of sockets and common enough to be a real
 * room code. A few hundred draws settle it.
 */

const DRAWS = 500

const codes = Array.from({ length: DRAWS }, () => createRoomCode())

describe('createRoomCode', () => {
  it(`always mints exactly ${ROOM_CODE_LENGTH} characters`, () => {
    expect(codes.filter((code) => code.length !== ROOM_CODE_LENGTH)).toEqual([])
  })

  it('draws every character from the alphabet the endpoint names', () => {
    const strays = codes.flatMap((code) =>
      [...code].filter((character) => !ROOM_CODE_ALPHABET.includes(character))
    )

    expect(strays).toEqual([])
  })

  it('is a draw, not a constant', () => {
    expect(new Set(codes).size).toBeGreaterThan(DRAWS - 100)
  })
})

/** A connection the registry only ever sends through, standing in for the endpoint's. */
const connection = () => {
  const sent: ServerMessage[] = []

  return {
    sent,
    socket: {
      send: (message: ServerMessage) => sent.push(message),
      close: () => {}
    } satisfies PeerSocket
  }
}

const board: PeerSnapshot = {
  grid: Array.from({ length: GRID_HEIGHT }, () => Array.from({ length: GRID_WIDTH }, () => null)),
  score: 0,
  status: 'running'
}

/**
 * The room's own rules on the registry, where a socket pair is readable: the
 * endpoint's integration test drives the wire, and a frame a socket had already
 * queued before its close is not a thing the wire can be made to produce.
 */
describe('RoomRegistry relay', () => {
  it('refuses a board from a socket the seat has moved off', () => {
    const registry = new RoomRegistry()
    const host = connection()
    const guest = connection()

    const created = registry.init('host', board, host.socket)
    if (!created.ok) throw new Error('the room was not created')

    registry.join('guest', created.code, board, guest.socket, null)

    // How a refresh reclaims a seat: the identity comes back on a new socket, the
    // endpoint hands it the seat, and the socket left behind is closed.
    const returned = connection()
    const reclaimed = registry.join('host', created.code, board, returned.socket, created.token)

    expect(reclaimed.ok).toBe(true)

    guest.sent.length = 0

    // The displaced socket's own board, queued before its close landed: it is not
    // the holder's board any more, and it must not reach the seat opposite.
    expect(registry.relay(created.code, 'host', host.socket, board)).toBe(false)
    expect(guest.sent).toEqual([])

    // The socket that holds the seat is still the one the room carries boards from.
    expect(registry.relay(created.code, 'host', returned.socket, board)).toBe(true)
    expect(guest.sent.map((message) => message.type)).toEqual(['stateUpdate'])
  })
})
