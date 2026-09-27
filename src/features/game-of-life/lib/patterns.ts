import type { Pattern } from '../types'

/**
 * The patterns a visitor can stamp on the board — the handful of shapes the Game
 * of Life is read through, kept as pure data: no import beyond the type, no DOM,
 * so the engine can seed its opening board from the same record the viewer offers.
 *
 * The offsets are measured from each pattern's own top-left corner, so a pattern
 * can be dropped anywhere without carrying a position of its own. Ids are the
 * English names; the label and the note are the visitor's copy.
 */

/** The glider: the 2019 seed (`GameState.js`), and the viewer's `glider` pattern. */
export const GLIDER_CELLS: readonly (readonly [number, number])[] = [
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 1],
  [2, 2]
]

export const PATTERNS: readonly Pattern[] = [
  {
    id: 'blinker',
    label: 'Clignotant',
    note: 'trois cellules qui battent, deux générations par cycle',
    cells: [
      [0, 0],
      [1, 0],
      [2, 0]
    ]
  },
  {
    id: 'block',
    label: 'Bloc',
    note: 'quatre cellules qui ne bougent jamais',
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ]
  },
  {
    id: 'toad',
    label: 'Crapaud',
    note: 'deux formes alternées, deux générations par cycle',
    cells: [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 0],
      [1, 1],
      [1, 2]
    ]
  },
  {
    id: 'glider',
    label: 'Planeur',
    note: 'traverse la grille en diagonale, une case toutes les quatre générations',
    cells: GLIDER_CELLS
  }
]

export const DEFAULT_PATTERN_ID = 'blinker'

/** The pattern an id names, or `undefined` for an id the catalogue does not hold. */
export const patternById = (id: string): Pattern | undefined =>
  PATTERNS.find((pattern) => pattern.id === id)
