/**
 * The Game of Life's own vocabulary, carried over from the 2019 original
 * (`tuximetal-game-of-life-engine/src/CellState.js`, `Cell.js`): two cell states
 * named the way the original named them, a board as rows of states, and the one
 * switch the engine ever had — whether the neighbourhood wraps around the edges.
 *
 * Pure types and one frozen object: no DOM, no React, importable from a plain
 * Bun test.
 */

/** The two states a cell can hold, as the original's `CellState.js` had them. */
export const CellState = {
  dead: 0,
  alive: 1
} as const

export type CellState = (typeof CellState)[keyof typeof CellState]

/** A rectangular board: every row carries the same number of cells. */
export type Grid = readonly (readonly CellState[])[]

export type GridSize = {
  rows: number
  cols: number
}

/** Neighbour neighbourhood: `torus` wraps around the edges, otherwise they clamp. */
export type Neighbourhood = {
  torus: boolean
}

/** One entry of the viewer's speed selector. */
export type Speed = {
  id: string
  label: string
  intervalMs: number
}
