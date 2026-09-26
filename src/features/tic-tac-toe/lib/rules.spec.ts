import { describe, expect, it } from 'bun:test'
import type { Board } from '../types'
import {
  BOARD_POSITIONS,
  createBoard,
  findWinner,
  isBoardFull,
  markForMove,
  placeMark,
  WINNING_LINES
} from './rules'

const boardOf = (cells: ReadonlyArray<'X' | 'O' | null>): Board => cells

// The eight lines as the 2017 original hard-codes them, first match winning
// (ticTacToe/src/js/app.js:61-117): three rows, three columns, the descending
// diagonal, then the ascending one.
const ARCHIVE_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

describe('createBoard', () => {
  it('opens nine empty cells in reading order', () => {
    const board = createBoard()

    expect(board).toEqual([null, null, null, null, null, null, null, null, null])
    expect(BOARD_POSITIONS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('markForMove', () => {
  // The 2017 source increments `round` before reading its parity (app.js:10-18),
  // so `X` — "Joueur un" — lays the first mark of every round.
  it('lays X on the first move and O on the second', () => {
    expect(markForMove(0)).toBe('X')
    expect(markForMove(1)).toBe('O')
    expect(markForMove(2)).toBe('X')
    expect(markForMove(8)).toBe('X')
  })
})

describe('placeMark', () => {
  it('returns a new board holding the mark, leaving the previous board untouched', () => {
    const board = createBoard()
    const next = placeMark(board, 4, 'X')

    expect(next?.[4]).toBe('X')
    expect(board[4]).toBeNull()
  })

  it('refuses an occupied cell and a position outside the board', () => {
    const occupied = boardOf(['O', null, null, null, null, null, null, null, null])

    expect(placeMark(occupied, 0, 'X')).toBeNull()
    expect(placeMark(occupied, 9, 'X')).toBeNull()
    expect(placeMark(occupied, -1, 'X')).toBeNull()
  })
})

describe('findWinner', () => {
  it('keeps the eight lines of the original, in its order', () => {
    expect(WINNING_LINES).toEqual(ARCHIVE_LINES)
  })

  it('detects each of the eight lines', () => {
    for (const [first, second, third] of ARCHIVE_LINES) {
      const cells: Array<'X' | 'O' | null> = [null, null, null, null, null, null, null, null, null]
      cells[first] = 'O'
      cells[second] = 'O'
      cells[third] = 'O'

      expect(findWinner(boardOf(cells))).toBe('O')
    }
  })

  it('ignores three empty cells in a line', () => {
    expect(findWinner(createBoard())).toBeNull()
  })

  it('returns no winner for a full board without a line', () => {
    expect(findWinner(boardOf(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']))).toBeNull()
  })

  // First match wins in that order: rows before columns, and the descending
  // diagonal before the ascending one.
  it('returns the earlier line when two lines are complete', () => {
    expect(findWinner(boardOf(['X', 'X', 'X', 'O', 'O', 'O', null, null, null]))).toBe('X')
    expect(findWinner(boardOf(['O', 'X', 'X', 'O', 'X', 'X', 'O', null, null]))).toBe('O')
  })
})

describe('isBoardFull', () => {
  it('is false while a cell is free and true once every cell holds a mark', () => {
    expect(isBoardFull(boardOf(['X', 'X', 'X', 'O', 'O', 'O', 'O', 'X', null]))).toBe(false)
    expect(isBoardFull(boardOf(['X', 'X', 'X', 'O', 'O', 'O', 'O', 'X', 'X']))).toBe(true)
  })
})
