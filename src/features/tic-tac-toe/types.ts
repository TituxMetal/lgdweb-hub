export type Mark = 'X' | 'O'

export type Cell = Mark | null

export type Board = ReadonlyArray<Cell>

/**
 * The 2017 original keeps its score as `{ playerOne, playerTwo }`, with
 * `playerOne` counting `X` and `playerTwo` counting `O` (app.js:1-2, :49-59).
 */
export type PlayerKey = 'playerOne' | 'playerTwo'

export type Score = {
  readonly playerOne: number
  readonly playerTwo: number
}

export type RoundOutcome =
  | { readonly kind: 'win'; readonly winner: Mark }
  | { readonly kind: 'draw' }

export type GameState = {
  readonly board: Board
  /** The original's `round`, which doubles as the mark counter (app.js:5-18). */
  readonly moveCount: number
  readonly score: Score
  /** `null` while the round is in play; non-null once the overlay is up. */
  readonly outcome: RoundOutcome | null
}
