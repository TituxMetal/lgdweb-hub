/**
 * The Tetris feature's own vocabulary, carried over from the 2018 original
 * (`TituxMetal/tetrisGame`: `client/modules/Piece.js`, `Arena.js`, `Player.js`):
 * the seven tetrominoes in the original's own order, a board of resting cells, a
 * piece as a square shape plus a position, and the queue the falling piece is
 * dealt from.
 *
 * Pure types: no DOM, no React, importable from a plain Bun test.
 */

/** The seven tetrominoes, in the order the original dealt them (`Piece.js:11`, `'IJLOSTZ'`). */
export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'

/** A board cell: the piece resting in it, or `null` when nothing sits there. */
export type Cell = PieceType | null

/** Rectangular board: every row carries the same number of cells. */
export type Board = readonly (readonly Cell[])[]

/**
 * A piece's grid. Square by construction — the original rotated it in place with
 * a transpose (`Player.js:88-105`), which only holds for a square matrix.
 */
export type Shape = readonly (readonly boolean[])[]

export type Position = {
  x: number
  y: number
}

/** A falling piece: which tetromino it is, its current shape, and where its top-left sits. */
export type Piece = {
  type: PieceType
  shape: Shape
  position: Position
}

/** `ready` before the first start, `running` while a piece falls, `paused` while the visitor holds the game, `over` when the stack reaches the top. */
export type GameStatus = 'ready' | 'running' | 'paused' | 'over'

/** A rotation step: `1` turns clockwise, `-1` counter-clockwise, as `Player.rotate(dir)` took it. */
export type Turn = 1 | -1

/** A sideways step: `-1` left, `1` right, as `Player.move(direction)` took it. */
export type Move = -1 | 1

/** A source of randomness in `[0, 1)` — injectable so the deals can be tested. */
export type Rng = () => number

export type GameState = {
  status: GameStatus
  /** The resting stack; the falling piece is not part of it until it locks. */
  board: Board
  /** The falling piece, or `null` while the game waits for a start and once it is over. */
  piece: Piece | null
  /** The upcoming pieces, head first; `queue[0]` is what the preview shows. */
  queue: readonly PieceType[]
  score: number
  /** Milliseconds between two gravity steps — the original's `dropInterval`. */
  dropInterval: number
}
