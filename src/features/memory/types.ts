/** The six symbols of the 2018 deck, in the order its markup declares them (index.html:12-59). */
export type SymbolId = 'ansible' | 'docker' | 'git' | 'html' | 'javascript' | 'sass'

export type CardStatus = 'down' | 'up' | 'matched'

export type Card = {
  /** Deal identity, assigned before the shuffle: a card keeps it when its slot changes. */
  readonly id: number
  readonly symbol: SymbolId
  readonly status: CardStatus
}

export type GameStatus = 'playing' | 'won'

export type GameState = {
  /** Grid order: index `n` is the `n`-th slot of the four-by-three board. */
  readonly cards: ReadonlyArray<Card>
  /** Completed pair attempts — a run's score. A perfect run is six. */
  readonly moves: number
  /** Face-up cards not yet resolved, in pick order. */
  readonly picks: ReadonlyArray<number>
  /** True while a miss holds both cards up; every click waits for the timer. */
  readonly locked: boolean
  readonly status: GameStatus
}
