import type { Board, Mark } from '../types'

/** The nine cells, in reading order. Grid positions are stable: nothing reorders a board. */
export const BOARD_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const

/**
 * The 2017 original hard-codes its eight winning lines and tests them in this
 * exact order, first match winning (app.js:61-117): three rows, three columns,
 * then the descending and the ascending diagonal.
 */
export const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

export const createBoard = (): Board => BOARD_POSITIONS.map(() => null)

/**
 * The original increments `round` and then asks `round % 2 === 0 ? 'O' : 'X'`
 * (app.js:6-8, :10-18), so the first mark laid down is `X` and the second is
 * `O`. `moveCount` counts the marks already played.
 */
export const markForMove = (moveCount: number): Mark => (moveCount % 2 === 0 ? 'X' : 'O')

/** Returns the next board, or `null` when the cell is taken or out of range. */
export const placeMark = (board: Board, position: number, mark: Mark): Board | null => {
  const current = board[position]
  if (current !== null) return null

  const next = [...board]
  next[position] = mark
  return next
}

export const findWinner = (board: Board): Mark | null => {
  for (const [first, second, third] of WINNING_LINES) {
    const mark = board[first]
    if (mark === null || mark === undefined) continue
    if (mark === board[second] && mark === board[third]) return mark
  }

  return null
}

export const isBoardFull = (board: Board): boolean =>
  board.every((cell) => cell !== null && cell !== undefined)
