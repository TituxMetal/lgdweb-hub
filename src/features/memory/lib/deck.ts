import type { Card, SymbolId } from '../types'

/** The deck the 2018 markup deals, in its own order (index.html:12-59). */
export const SYMBOLS: ReadonlyArray<SymbolId> = [
  'ansible',
  'docker',
  'git',
  'html',
  'javascript',
  'sass'
]

export const CARDS_PER_SYMBOL = 2

/** Twelve cards, four columns by three rows (index.html:12-59, `_board.scss:22-27`). */
export const DECK_SIZE = SYMBOLS.length * CARDS_PER_SYMBOL

export const createDeck = (rng: () => number = Math.random): Card[] => {
  const cards: Card[] = []

  SYMBOLS.forEach((symbol, symbolIndex) => {
    for (let copy = 0; copy < CARDS_PER_SYMBOL; copy++) {
      cards.push({ id: symbolIndex * CARDS_PER_SYMBOL + copy, symbol, status: 'down' })
    }
  })

  // The original gave each card `order = floor(random() * 12)` (index.js:52-58),
  // which repeats values — a partly shuffled layout, not a permutation.
  // Fisher–Yates keeps the intent (a new order for every run) and makes it real.
  for (let index = cards.length - 1; index > 0; index--) {
    const swapWith = Math.floor(rng() * (index + 1))
    const current = cards[index]
    const target = cards[swapWith]

    if (current === undefined || target === undefined) continue

    cards[index] = target
    cards[swapWith] = current
  }

  return cards
}
