import { GRID_HEIGHT, GRID_WIDTH } from '~/shared/tetrisProtocol'
import type { Board, Cell, GameState, Piece, Position, Shape } from '../types'
import { localCells } from './pieces'

/**
 * The board rules, taken from the original's `Arena.js`: a fixed 12 × 20 field, a
 * collision test that reads only the falling piece's own cells, the merge that
 * writes them into the stack, and the sweep that drops a filled row and scores it.
 *
 * The original mutated one matrix in place and announced every change over an
 * event bus; here each function returns a new board, so a caller can compare two
 * states and React can tell an update from a no-op. The numbers — the field's
 * size and the scoring — are the original's, unchanged.
 */

/**
 * The original's `new Arena(12, 20)` (`Tetris.js:7`) — the same field the wire
 * carries, so the arena this feature plays on and the grid a snapshot relays can
 * never disagree about its size.
 */
export const BOARD_WIDTH = GRID_WIDTH
export const BOARD_HEIGHT = GRID_HEIGHT

const emptyRow = (): Cell[] => new Array<Cell>(BOARD_WIDTH).fill(null)

/** An empty field of 12 × 20 cells. */
export const createBoard = (): Board => Array.from({ length: BOARD_HEIGHT }, emptyRow)

/** The piece's filled cells, as board coordinates. */
const filledCells = (shape: Shape, { x, y }: Position): (readonly [number, number])[] =>
  localCells(shape).map(([cellX, cellY]) => [x + cellX, y + cellY] as const)

/**
 * Whether `shape` at `position` runs into a wall, the floor, or the stack —
 * `Arena.collide`, which read a cell as blocked when it sat outside the matrix or
 * was already filled. Only the piece's own cells count: the empty row the T, S
 * and Z grids carry may hang below the floor while the piece rests on it.
 */
export const collides = (board: Board, shape: Shape, position: Position): boolean =>
  filledCells(shape, position).some(([x, y]) => {
    const cell = board[y]?.[x]

    return cell === undefined || cell !== null
  })

/**
 * The board with the piece written into it — `Arena.merge`, which wrote the
 * piece's own cells and left the stack's where the piece was empty.
 *
 * Only the rows the piece reaches are copied; the rest are carried over as they
 * were, so a display render rebuilds at most four rows instead of the field.
 */
export const merge = (board: Board, piece: Piece): Board => {
  const touched = new Map<number, Cell[]>()

  for (const [x, y] of filledCells(piece.shape, piece.position)) {
    const row = board[y]
    if (row === undefined) continue

    const target = touched.get(y) ?? [...row]
    target[x] = piece.type
    touched.set(y, target)
  }

  return board.map((row, y) => touched.get(y) ?? row)
}

/**
 * The field as it is drawn: the falling piece written into the stack. The state
 * keeps the two apart until the piece locks, so this is the reading that shows a
 * piece mid-fall — what `Board` renders, and what a player relays to the player
 * beside them.
 */
export const displayBoard = (state: GameState): Board =>
  state.piece === null ? state.board : merge(state.board, state.piece)

/**
 * The board with every filled row dropped and the rows above it falling one row,
 * and the score the pass earns.
 *
 * The original's `Arena.sweep` added `rowCount * 10` per cleared row and
 * incremented `rowCount`, so the four passes a tetromino can make score 10, 30,
 * 60 and 100 — cumulative rather than the flat 10, 20, 30, 40 a per-row count
 * would give, which is the reading the modernized rules keep.
 *
 * A board with no filled row comes back as the one it was given, identity and
 * all, so the caller can keep its own and React sees the frame as a no-op.
 */
export const sweep = (board: Board): { board: Board; score: number } => {
  const kept = board.filter((line) => !line.every((cell) => cell !== null))
  const cleared = BOARD_HEIGHT - kept.length

  if (cleared === 0) return { board, score: 0 }

  return {
    board: [...Array.from({ length: cleared }, emptyRow), ...kept],
    score: (10 * cleared * (cleared + 1)) / 2
  }
}
