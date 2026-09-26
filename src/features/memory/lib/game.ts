import type { GameState } from '../types'
import { createDeck } from './deck'

/**
 * The original locks the board on a miss and turns both cards back after
 * exactly one second (index.js:36-45). The timer itself belongs to the caller:
 * this module only describes the state it resolves.
 */
export const MISS_DELAY_MS = 1000

export const createGameState = (rng: () => number = Math.random): GameState => ({
  cards: createDeck(rng),
  moves: 0,
  picks: [],
  locked: false,
  status: 'playing'
})

/**
 * One click on one card.
 *
 * A click is ignored when the board is locked by a miss (index.js:16), and when
 * the card is already face up or matched — the latter because the original
 * removes a matched card's listener (index.js:30-34), the former because a
 * revealed card cannot be revealed twice.
 *
 * Clicking the pending first card again changes nothing either: the original
 * calls `resetBoard()` at `index.js:9`, then the lines right after it set
 * `firstCard = this` again (`index.js:14-18`), so the card stays the pending
 * pick and the next card clicked is still scored as its partner.
 *
 * A pair attempt counts as one move when its second card is revealed, whether
 * it matches or not: that is what a run's score measures.
 */
export const flip = (state: GameState, id: number): GameState => {
  if (state.locked || state.status === 'won') return state

  const card = state.cards.find((entry) => entry.id === id)
  // Also covers the pending first card clicked a second time: the original's
  // `resetBoard()` runs at `index.js:9`, but `firstCard = this` is set again
  // right after (`index.js:14-18`), so the pick stands (see the docblock).
  if (card === undefined || card.status !== 'down') return state

  const revealed = state.cards.map((entry) =>
    entry.id === id ? { ...entry, status: 'up' as const } : entry
  )
  const firstPick = state.picks[0]
  const first =
    firstPick === undefined ? undefined : state.cards.find((entry) => entry.id === firstPick)

  if (first === undefined) {
    return { ...state, cards: revealed, picks: [id] }
  }

  const moves = state.moves + 1

  if (first.symbol !== card.symbol) {
    return { ...state, cards: revealed, moves, picks: [first.id, id], locked: true }
  }

  const matched = revealed.map((entry) =>
    entry.symbol === card.symbol ? { ...entry, status: 'matched' as const } : entry
  )
  const won = matched.every((entry) => entry.status === 'matched')

  return { cards: matched, moves, picks: [], locked: false, status: won ? 'won' : 'playing' }
}

/** Turns a missed pair back over and unlocks the board. A matched pair is left alone. */
export const resolvePair = (state: GameState): GameState => {
  if (!state.locked) return state

  const [firstId, secondId] = state.picks
  const cards = state.cards.map((entry) =>
    entry.id === firstId || entry.id === secondId ? { ...entry, status: 'down' as const } : entry
  )

  return { ...state, cards, picks: [], locked: false }
}
