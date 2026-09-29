import { describe, expect, it } from 'bun:test'
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '../../../shared/tetris-protocol'
import { createRoomCode } from './room'

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
