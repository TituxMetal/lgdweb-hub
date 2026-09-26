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
 * A click is ignored when the board is locked by a miss (index.js:16), when the
 * card is already face up or matched (the original removes the listener of a
 * matched card, index.js:30-34), and when it is the first card clicked again —
 * the original resets its first-card slot without turning anything back
 * (index.js:9).
 *
 * A pair attempt counts as one move when its second card is revealed, whether
 * it matches or not: that is what a run's score measures.
 */
export const flip = (state: GameState, id: number): GameState => {
  if (state.locked || state.status === 'won') return state

  const card = state.cards.find((entry) => entry.id === id)
  if (card === undefined) return state

  // The first card clicked again: the original clears its first-card slot and
  // leaves the card face up (index.js:9), so the next card starts a new attempt
  // instead of being scored as the second half of this one. Checked before the
  // down-status guard, which the pending card no longer satisfies.
  if (state.picks.length === 1 && state.picks[0] === id) return { ...state, picks: [] }

  if (card.status !== 'down') return state

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
