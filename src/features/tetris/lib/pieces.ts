import type { PieceType, Position, Shape, Turn } from '../types'

/**
 * The piece rules, taken from the original's `Piece.js`: the seven tetrominoes as
 * square grids, the rotation the original applied to them, and its colour table.
 *
 * The original kept these on a `Piece` instance that mutated a piece's matrix in
 * place (`Player.rotateMatrix`); here they are pure — every function hands back a
 * new shape and the shared grids are never written to.
 */

/** The seven tetrominoes in the order the original dealt them (`Piece.js:11`, `'IJLOSTZ'`). */
export const PIECE_TYPES: readonly PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

/**
 * The original's `createPiece` grids (`Piece.js:13-57`), `true` where the
 * original wrote the colour index of the piece. Each grid is square: the
 * original rotated them in place with a transpose, which only holds for a square
 * matrix, so the empty row the original padded the T, S and Z with is part of
 * their shape.
 */
const SHAPES: Readonly<Record<PieceType, Shape>> = {
  I: [
    [false, true, false, false],
    [false, true, false, false],
    [false, true, false, false],
    [false, true, false, false]
  ],
  J: [
    [false, true, false],
    [false, true, false],
    [true, true, false]
  ],
  L: [
    [false, true, false],
    [false, true, false],
    [false, true, true]
  ],
  O: [
    [true, true],
    [true, true]
  ],
  S: [
    [false, true, true],
    [true, true, false],
    [false, false, false]
  ],
  T: [
    [true, true, true],
    [false, true, false],
    [false, false, false]
  ],
  Z: [
    [true, true, false],
    [false, true, true],
    [false, false, false]
  ]
}

/**
 * The original's colour table (`Piece.js:3-12`) as the Tailwind entries
 * `palette.md` maps each hex to. The table was indexed by the value the
 * `createPiece` grids carried — `I` carried 6, `J` 2, `L` 3, `O` 7, `S` 5, `T` 1,
 * `Z` 4 — so the yellow belongs to the long piece and the pink to the T, and not
 * the other way round.
 */
export const PIECE_CLASSES: Readonly<Record<PieceType, string>> = {
  I: 'bg-yellow-300',
  J: 'bg-sky-400',
  L: 'bg-green-400',
  O: 'bg-blue-500',
  S: 'bg-orange-400',
  T: 'bg-pink-600',
  Z: 'bg-fuchsia-500'
}

/** The original's grid for a tetromino. The caller reads it; it is shared and never written to. */
export const createShape = (type: PieceType): Shape => SHAPES[type]

/** The transpose the original's `rotateMatrix` opened with (`Player.js:89-97`). */
const transpose = (shape: Shape): Shape => shape.map((_, y) => shape.map((row) => row[y] === true))

/**
 * One quarter turn, as `Player.rotateMatrix(dir)` did it: transpose, then read
 * the rows backwards for clockwise (`dir > 0`), or the rows themselves backwards
 * for counter-clockwise.
 *
 * The pivot is therefore the matrix, not the piece's centre, and a turn can leave
 * the piece a row or a column away from where a centre-pivoted rotation would
 * put it — the long tetromino's bar lands in whichever grid column or row the
 * transpose read it back from, so a clockwise cycle walks it across all four
 * (`pieces.spec.ts`). Reproduced on purpose: it is the original's play, and the
 * wall-kick offsets below were written against it.
 */
export const rotateShape = (shape: Shape, turn: Turn): Shape => {
  const transposed = transpose(shape)

  if (turn === 1) return transposed.map((row) => [...row].reverse())

  return [...transposed].reverse()
}

/** A shape's filled cells, in the shape's own coordinates. */
export const localCells = (shape: Shape): (readonly [number, number])[] =>
  shape.flatMap((row, y) => row.flatMap((filled, x) => (filled ? [[x, y] as const] : [])))

/** The piece's filled cells, cut down to the box they occupy — what the preview draws. */
export const trimShape = (shape: Shape): Shape => {
  const filled = localCells(shape)

  if (filled.length === 0) return []

  const xs = filled.map(([x]) => x)
  const ys = filled.map(([, y]) => y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const width = Math.max(...xs) - minX + 1
  const height = Math.max(...ys) - minY + 1

  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => shape[minY + y]?.[minX + x] === true)
  )
}

/**
 * Where a fresh piece enters: hard against the top, centred by the original's
 * own arithmetic — half the board's width minus half the piece's (`Player.js:52-55`).
 */
export const spawnPosition = (shape: Shape, boardWidth: number): Position => ({
  x: Math.floor(boardWidth / 2) - Math.floor(shape.length / 2),
  y: 0
})
