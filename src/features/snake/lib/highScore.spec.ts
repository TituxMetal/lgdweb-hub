import { describe, expect, it } from 'bun:test'
import { loadHighScores, MAX_HIGH_SCORES, recordScore } from './highScore'

const STORAGE_KEY = 'lgdweb-hub:snake:high-scores'

const createMockStorage = (): Storage => {
  const map = new Map<string, string>()

  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
    clear: () => {
      map.clear()
    },
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size
    }
  }
}

describe('loadHighScores', () => {
  it('returns an empty array on empty storage', () => {
    expect(loadHighScores(createMockStorage())).toEqual([])
  })

  it('returns an empty array on invalid JSON', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, 'not-json')

    expect(loadHighScores(storage)).toEqual([])
  })

  it('returns an empty array when the stored value is not an array', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ score: 42 }))

    expect(loadHighScores(storage)).toEqual([])
  })

  it('filters out non-numeric and negative entries', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([12, 'banana', -3, 8, null, 5]))

    expect(loadHighScores(storage)).toEqual([12, 8, 5])
  })

  it('caps the list at MAX_HIGH_SCORES and sorts descending', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([3, 9, 1, 7, 11, 5, 8]))

    expect(loadHighScores(storage)).toEqual([11, 9, 8, 7, 5])
    expect(loadHighScores(storage).length).toBe(MAX_HIGH_SCORES)
  })
})

describe('recordScore', () => {
  it('inserts the score and persists when the list is empty', () => {
    const storage = createMockStorage()

    expect(recordScore(storage, 12)).toEqual([12])
    expect(loadHighScores(storage)).toEqual([12])
  })

  it('inserts the score in the correct rank when the list is not full', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([15, 5]))

    expect(recordScore(storage, 10)).toEqual([15, 10, 5])
  })

  it('replaces the lowest score when the new score qualifies for a full list', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([20, 15, 10, 8, 5]))

    expect(recordScore(storage, 12)).toEqual([20, 15, 12, 10, 8])
  })

  it('returns the previous list unchanged when the new score does not qualify', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([20, 15, 10, 8, 5]))

    expect(recordScore(storage, 3)).toEqual([20, 15, 10, 8, 5])
    expect(loadHighScores(storage)).toEqual([20, 15, 10, 8, 5])
  })

  it('ignores scores of 0 or below', () => {
    const storage = createMockStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([10]))

    expect(recordScore(storage, 0)).toEqual([10])
    expect(recordScore(storage, -5)).toEqual([10])
  })
})
