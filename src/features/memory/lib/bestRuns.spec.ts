import { describe, expect, it } from 'bun:test'
import { createMemoryStorage } from '~/lib/testStorage'
import { loadBestRuns, MAX_BEST_RUNS, recordRun } from './bestRuns'

const STORAGE_KEY = 'lgdweb-hub:memory:best-runs'

describe('loadBestRuns', () => {
  it('returns an empty list on empty storage', () => {
    expect(loadBestRuns(createMemoryStorage())).toEqual([])
  })

  it('returns an empty list on invalid JSON', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, '{not json')

    expect(loadBestRuns(storage)).toEqual([])
  })

  it('returns an empty list when the stored value is not an array', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ moves: 6 }))

    expect(loadBestRuns(storage)).toEqual([])
  })

  it('drops anything that is not a positive number', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([8, 'seven', -3, 0, null, 6.5]))

    expect(loadBestRuns(storage)).toEqual([6, 8])
  })

  it('keeps at most MAX_BEST_RUNS runs, fewest moves first', () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify([12, 6, 20, 9, 7, 30, 6]))

    expect(MAX_BEST_RUNS).toBe(5)
    expect(loadBestRuns(storage)).toEqual([6, 6, 7, 9, 12])
  })
})

describe('recordRun', () => {
  it('records a run into an empty list and persists it', () => {
    const storage = createMemoryStorage()

    expect(recordRun(storage, 9)).toEqual([9])
    expect(loadBestRuns(storage)).toEqual([9])
  })

  it('ranks a run by move count, fewest first', () => {
    const storage = createMemoryStorage()
    recordRun(storage, 11)

    expect(recordRun(storage, 7)).toEqual([7, 11])
  })

  it('drops the worst run once the list is full', () => {
    const storage = createMemoryStorage()
    for (const moves of [6, 7, 8, 9, 10]) recordRun(storage, moves)

    expect(recordRun(storage, 6)).toEqual([6, 6, 7, 8, 9])
  })

  it('returns the previous list unchanged when the run does not qualify', () => {
    const storage = createMemoryStorage()
    for (const moves of [6, 7, 8, 9, 10]) recordRun(storage, moves)

    expect(recordRun(storage, 12)).toEqual([6, 7, 8, 9, 10])
    expect(loadBestRuns(storage)).toEqual([6, 7, 8, 9, 10])
  })

  it('ignores a move count of zero or below', () => {
    const storage = createMemoryStorage()

    expect(recordRun(storage, 0)).toEqual([])
    expect(recordRun(storage, -4)).toEqual([])
    expect(loadBestRuns(storage)).toEqual([])
  })
})
