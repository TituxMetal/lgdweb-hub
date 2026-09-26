import { describe, expect, it } from 'bun:test'
import type { GameState, SymbolId } from '../types'
import { SYMBOLS } from './deck'
import { createGameState, flip, MISS_DELAY_MS, resolvePair } from './game'

/** The id of the `copy`-th card of a symbol; the deck always deals two of each. */
const idOf = (state: GameState, symbol: SymbolId, copy = 0): number => {
  const id = state.cards.filter((card) => card.symbol === symbol)[copy]?.id
  if (id === undefined) throw new Error(`No card ${copy} dealt for ${symbol}`)
  return id
}

/** Reveals both cards of one symbol: the two clicks a pair attempt takes. */
const attempt = (state: GameState, symbol: SymbolId): GameState =>
  flip(flip(state, idOf(state, symbol)), idOf(state, symbol, 1))

const statusOf = (state: GameState, symbol: SymbolId): string[] =>
  state.cards.filter((card) => card.symbol === symbol).map((card) => card.status)

describe('createGameState', () => {
  it('opens a playable board of twelve face-down cards and no move', () => {
    const state = createGameState()

    expect(state.cards).toHaveLength(12)
    expect(state.cards.every((card) => card.status === 'down')).toBe(true)
    expect(state.moves).toBe(0)
    expect(state.picks).toEqual([])
    expect(state.locked).toBe(false)
    expect(state.status).toBe('playing')
  })
})

describe('flip', () => {
  it('reveals a first card without scoring the attempt yet', () => {
    const state = createGameState()
    const next = flip(state, idOf(state, 'docker'))

    expect(next.cards.find((card) => card.symbol === 'docker')?.status).toBe('up')
    expect(next.picks).toEqual([idOf(state, 'docker')])
    expect(next.moves).toBe(0)
    expect(next.locked).toBe(false)
  })

  it('keeps a found pair revealed and scores one move', () => {
    const state = attempt(createGameState(), 'git')

    expect(statusOf(state, 'git')).toEqual(['matched', 'matched'])
    expect(state.picks).toEqual([])
    expect(state.moves).toBe(1)
    expect(state.locked).toBe(false)
    expect(state.status).toBe('playing')
  })

  it('locks the board on a miss, then turns both cards back after the delay', () => {
    const state = createGameState()
    const missed = flip(flip(state, idOf(state, 'ansible')), idOf(state, 'docker'))

    expect(missed.locked).toBe(true)
    expect(missed.moves).toBe(1)
    expect(missed.cards.filter((card) => card.status === 'up')).toHaveLength(2)
    expect(MISS_DELAY_MS).toBe(1000)

    const resolved = resolvePair(missed)

    expect(resolved.locked).toBe(false)
    expect(resolved.picks).toEqual([])
    expect(resolved.moves).toBe(1)
    expect(resolved.cards.every((card) => card.status === 'down')).toBe(true)
  })

  it('ignores a click while the board waits on a miss', () => {
    const state = createGameState()
    const locked = flip(flip(state, idOf(state, 'ansible')), idOf(state, 'docker'))

    expect(flip(locked, idOf(state, 'git'))).toBe(locked)
  })

  it('clears the pending first pick on a second click on the same card', () => {
    const state = createGameState()
    const first = flip(state, idOf(state, 'ansible'))
    const repeated = flip(first, idOf(state, 'ansible'))

    expect(repeated.picks).toEqual([])
    expect(repeated.moves).toBe(0)
    expect(repeated.locked).toBe(false)
    expect(repeated.cards.find((card) => card.symbol === 'ansible')?.status).toBe('up')
  })

  it('starts a fresh attempt after that repeat click revealed nothing else', () => {
    const state = createGameState()
    const repeated = flip(flip(state, idOf(state, 'ansible')), idOf(state, 'ansible'))
    const next = flip(repeated, idOf(state, 'docker'))

    expect(next.picks).toEqual([idOf(state, 'docker')])
    expect(next.moves).toBe(0)
    expect(next.locked).toBe(false)
  })

  it('ignores a click on an already matched card', () => {
    const paired = attempt(createGameState(), 'sass')

    expect(flip(paired, idOf(paired, 'sass'))).toBe(paired)
  })

  it('shows the win state once the grid is cleared', () => {
    const won = SYMBOLS.reduce(attempt, createGameState())

    expect(won.status).toBe('won')
    expect(won.moves).toBe(6)
    expect(won.cards.every((card) => card.status === 'matched')).toBe(true)
    expect(flip(won, idOf(won, 'ansible'))).toBe(won)
  })
})

describe('resolvePair', () => {
  it('leaves a matched pair alone', () => {
    const paired = attempt(createGameState(), 'html')

    expect(resolvePair(paired)).toBe(paired)
  })

  it('leaves a board with nothing pending alone', () => {
    const fresh = createGameState()

    expect(resolvePair(fresh)).toBe(fresh)
  })
})
