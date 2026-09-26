import { describe, expect, it } from 'bun:test'
import { CARDS_PER_SYMBOL, createDeck, DECK_SIZE, SYMBOLS } from './deck'

// The deck exactly as the 2018 markup deals it, symbol by symbol
// (memoryGame/src/assets/index.html:12-59).
const ARCHIVE_ORDER = [
  'ansible',
  'ansible',
  'docker',
  'docker',
  'git',
  'git',
  'html',
  'html',
  'javascript',
  'javascript',
  'sass',
  'sass'
] as const

describe('createDeck', () => {
  it('deals twelve cards, two of each of the six symbols, all face down', () => {
    const deck = createDeck(() => 0.999)

    expect(CARDS_PER_SYMBOL).toBe(2)
    expect(SYMBOLS).toEqual(['ansible', 'docker', 'git', 'html', 'javascript', 'sass'])
    expect(deck).toHaveLength(DECK_SIZE)
    expect(deck.every((card) => card.status === 'down')).toBe(true)
    expect(deck.map((card) => card.symbol)).toEqual([...ARCHIVE_ORDER])
  })

  it('gives every card its own identity', () => {
    const ids = createDeck().map((card) => card.id)

    expect([...ids].sort((a, b) => a - b)).toEqual(
      Array.from({ length: DECK_SIZE }, (_, index) => index)
    )
  })

  it('reorders the same twelve cards, one new order per run', () => {
    const shuffled = createDeck(() => 0)

    expect(shuffled.map((card) => card.symbol)).not.toEqual([...ARCHIVE_ORDER])
    expect([...shuffled.map((card) => card.symbol)].sort()).toEqual([...ARCHIVE_ORDER].sort())
  })
})
