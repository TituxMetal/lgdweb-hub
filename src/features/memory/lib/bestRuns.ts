import { createRankedStore } from '~/lib/rankedNumbers'

export const MAX_BEST_RUNS = 5

// A run's score is its move count, so fewest moves rank first, and only a
// positive count is a run.
const store = createRankedStore({
  storageKey: 'lgdweb-hub:memory:best-runs',
  limit: MAX_BEST_RUNS,
  minStored: 1,
  compare: (a, b) => a - b
})

export const loadBestRuns = (storage: Storage): number[] => store.load(storage)

export const recordRun = (storage: Storage, moves: number): number[] => store.record(storage, moves)
