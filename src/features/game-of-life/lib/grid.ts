import { CellState, type Grid, type GridSize, type Neighbourhood } from '../types'

/**
 * The engine, ported from `tuximetal-game-of-life-engine/src/Cell.js` and
 * `Game.js`. The original classes carried their own mutable `state` and a
 * `toggleTorusMode`; the same behaviour is kept here as pure functions over an
 * immutable grid, so a caller never wonders which generation a reference points
 * at and the rules can be tested on explicit boards.
 */

/** Share of live cells a random seed starts with. */
const RANDOM_DENSITY = 0.3

/**
 * The glider the original seeded its empty board with
 * (`tuximetal-game-of-life/src/helpers/GameState.js`), kept as offsets from the
 * pattern's own top-left corner so it can be dropped anywhere.
 */
const GLIDER_OFFSETS: readonly (readonly [number, number])[] = [
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 1],
  [2, 2]
]

/** An empty board of `size`: every cell dead. */
export const createGrid = ({ rows, cols }: GridSize): Grid =>
  Array.from({ length: rows }, () => new Array<CellState>(cols).fill(CellState.dead))

export const isAlive = (grid: Grid, row: number, col: number): boolean =>
  grid[row]?.[col] === CellState.alive

/**
 * The same board with one cell set. Out-of-bounds coordinates, and a cell that
 * already holds `state`, hand the board back untouched — the caller's pointer
 * can land outside the canvas on a fast drag, and a stroke retraces cells it has
 * already painted. Keeping the board's identity there also tells React the
 * update changed nothing, so the canvas is not repainted for it.
 */
export const setCell = (grid: Grid, row: number, col: number, state: CellState): Grid => {
  const line = row >= 0 && row < grid.length ? grid[row] : undefined
  if (line === undefined || col < 0 || col >= line.length) return grid
  if (line[col] === state) return grid

  return grid.map((cells, rowIndex) =>
    rowIndex === row ? cells.map((cell, colIndex) => (colIndex === col ? state : cell)) : cells
  )
}

/** A board where each cell is alive with probability `density`. */
export const randomGrid = (
  { rows, cols }: GridSize,
  density = RANDOM_DENSITY,
  random: () => number = Math.random
): Grid =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (random() < density ? CellState.alive : CellState.dead))
  )

/**
 * The original's starting board: its glider on an otherwise empty field, seeded
 * where `GameState.js` seeded it — rows 1–3, columns 0–2.
 */
export const seedGlider = (grid: Grid, origin = { row: 1, col: 0 }): Grid =>
  GLIDER_OFFSETS.reduce(
    (board, [row, col]) => setCell(board, origin.row + row, origin.col + col, CellState.alive),
    grid
  )

/** `Cell#getNextState`, character for character: 2–3 neighbours for a survivor, 3 for a birth. */
const nextCellState = (state: CellState, aliveNeighbours: number): CellState => {
  if (state === CellState.alive && (aliveNeighbours === 2 || aliveNeighbours === 3)) {
    return CellState.alive
  }

  if (state === CellState.dead && aliveNeighbours === 3) {
    return CellState.alive
  }

  return CellState.dead
}

/** `Game#getAliveNeighbors`: the eight cells around one, clamped at the edges. */
const countBoundedNeighbours = (grid: Grid, row: number, col: number): number => {
  const cols = grid[0]?.length ?? 0
  const startRow = Math.max(row - 1, 0)
  const endRow = Math.min(row + 1, grid.length - 1)
  const startCol = Math.max(col - 1, 0)
  const endCol = Math.min(col + 1, cols - 1)

  let aliveNeighbours = 0
  for (let neighbourRow = startRow; neighbourRow <= endRow; neighbourRow++) {
    for (let neighbourCol = startCol; neighbourCol <= endCol; neighbourCol++) {
      if (neighbourRow === row && neighbourCol === col) continue
      if (isAlive(grid, neighbourRow, neighbourCol)) aliveNeighbours++
    }
  }

  return aliveNeighbours
}

/** `Game#getTorusAliveNeighbors`: the same eight cells, wrapped around the edges. */
const countTorusNeighbours = (grid: Grid, row: number, col: number): number => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  let aliveNeighbours = 0
  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      const neighbourRow = (row + rowOffset + rows) % rows
      const neighbourCol = (col + colOffset + cols) % cols
      // The original skipped every offset whose wrapped coordinates land back on
      // the cell itself; on a one-row or one-column board that is more than the
      // single `(0, 0)` offset, which would otherwise count the cell twice more.
      if (neighbourRow === row && neighbourCol === col) continue
      if (isAlive(grid, neighbourRow, neighbourCol)) aliveNeighbours++
    }
  }

  return aliveNeighbours
}

export const countAliveNeighbours = (
  grid: Grid,
  row: number,
  col: number,
  { torus }: Neighbourhood
): number => (torus ? countTorusNeighbours(grid, row, col) : countBoundedNeighbours(grid, row, col))

/** The board one generation later, every cell read from the generation before it. */
export const nextGeneration = (grid: Grid, neighbourhood: Neighbourhood): Grid =>
  grid.map((row, rowIndex) =>
    row.map((state, colIndex) =>
      nextCellState(state, countAliveNeighbours(grid, rowIndex, colIndex, neighbourhood))
    )
  )
