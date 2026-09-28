/**
 * A grid's cells in reading order, each carrying the coordinate that identifies
 * it. The board and the preview both render a grid as one element per cell, and
 * a cell's identity in a fixed grid is its coordinate rather than its place in
 * the array — so the elements are keyed by that, not by the list's index.
 */
export const flattenCells = <T>(rows: readonly (readonly T[])[]): { key: string; cell: T }[] =>
  rows.flatMap((line, y) => line.map((cell, x) => ({ key: `${x}-${y}`, cell })))
