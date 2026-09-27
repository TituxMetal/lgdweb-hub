import { describe, expect, it } from 'bun:test'
import { applyMove, applyNotation, isPosition, resolvePosition, STARTING_FEN } from './moves'

/** Two positions the archived content carries and no board can draw: one names two
 *  black kings, the other none at all. */
const TWO_BLACK_KINGS = 'r3kb1r/ppppkppp/8/8/8/2N5/PPPPPPPP/R1BQKB1R w KQq - 0 1'
const NO_BLACK_KING = '8/8/8/8/8/8/4Q3/6K1 b - - 0 1'

describe('resolvePosition', () => {
  it('reads the original’s keywords as the starting position', () => {
    expect(resolvePosition('startpos')).toBe(STARTING_FEN)
    expect(resolvePosition('start')).toBe(STARTING_FEN)
  })

  it('reads a chapter that names no position as the starting position', () => {
    expect(resolvePosition(undefined)).toBe(STARTING_FEN)
  })

  it('leaves a position the engine reads alone', () => {
    const endgame = '8/8/8/3k4/8/3K4/8/8 w - - 0 1'

    expect(resolvePosition(endgame)).toBe(endgame)
  })

  it('falls back to the starting position for a position the engine refuses', () => {
    expect(resolvePosition('invalid-fen-string')).toBe(STARTING_FEN)
    expect(resolvePosition(TWO_BLACK_KINGS)).toBe(STARTING_FEN)
    expect(resolvePosition(NO_BLACK_KING)).toBe(STARTING_FEN)
  })
})

describe('isPosition', () => {
  it('accepts a position the engine reads', () => {
    expect(isPosition(STARTING_FEN)).toBe(true)
  })

  it('refuses a position the engine cannot load', () => {
    expect(isPosition('invalid-fen-string')).toBe(false)
    expect(isPosition(TWO_BLACK_KINGS)).toBe(false)
    expect(isPosition(NO_BLACK_KING)).toBe(false)
    expect(isPosition('')).toBe(false)
  })
})

describe('applyMove', () => {
  it('plays a legal move and hands back what it leaves behind', () => {
    expect(applyMove(STARTING_FEN, 'e2', 'e4')).toEqual({
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      uci: 'e2e4'
    })
  })

  it('refuses a move the rules do not allow', () => {
    expect(applyMove(STARTING_FEN, 'e2', 'e5')).toBeNull()
    expect(applyMove(STARTING_FEN, 'e2', 'e3')).not.toBeNull()
    expect(applyMove(STARTING_FEN, 'e3', 'e4')).toBeNull()
    expect(applyMove(STARTING_FEN, 'd7', 'd5')).toBeNull()
  })

  it('plays a capture, as the archived tactic chapters ask for', () => {
    expect(
      applyMove('rnbqkb1r/pppp1ppp/8/3p4/2B5/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1', 'c4', 'd5')
    ).toEqual({
      fen: 'rnbqkb1r/pppp1ppp/8/3B4/8/8/PPPP1PPP/RNBQK1NR b KQkq - 0 1',
      uci: 'c4d5'
    })
  })

  it('plays the castling the opening chapters ask for', () => {
    const before = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4'

    expect(applyMove(before, 'e1', 'g1')?.uci).toBe('e1g1')
  })

  it('promotes to a queen, as the original did for every move', () => {
    expect(applyMove('8/P7/8/8/8/8/8/K6k w - - 0 1', 'a7', 'a8')?.fen).toBe(
      'Q7/8/8/8/8/8/8/K6k b - - 0 1'
    )
  })

  it('refuses to play on a position the engine cannot load', () => {
    expect(applyMove(TWO_BLACK_KINGS, 'c3', 'd5')).toBeNull()
  })
})

describe('applyNotation', () => {
  it('reads standard algebraic notation', () => {
    expect(applyNotation(STARTING_FEN, 'e4')?.uci).toBe('e2e4')
    expect(applyNotation(STARTING_FEN, 'Nf3')?.uci).toBe('g1f3')
  })

  it('reads the two squares, which is how the content names a move', () => {
    expect(applyNotation(STARTING_FEN, 'e2e4')?.uci).toBe('e2e4')
  })

  it('ignores the case and the room around what was typed', () => {
    expect(applyNotation(STARTING_FEN, ' E4 ')?.uci).toBe('e2e4')
    expect(applyNotation(STARTING_FEN, 'E2E4')?.uci).toBe('e2e4')
  })

  it('answers nothing for an entry that names no legal move', () => {
    expect(applyNotation(STARTING_FEN, '')).toBeNull()
    expect(applyNotation(STARTING_FEN, '   ')).toBeNull()
    expect(applyNotation(STARTING_FEN, 'zzz')).toBeNull()
    expect(applyNotation(STARTING_FEN, 'e5')).toBeNull()
    expect(applyNotation(STARTING_FEN, 'e2e5')).toBeNull()
  })

  it('answers nothing on a position the engine cannot load', () => {
    expect(applyNotation(TWO_BLACK_KINGS, 'e4')).toBeNull()
  })
})
