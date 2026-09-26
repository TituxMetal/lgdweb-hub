import { createRankedStore } from '~/lib/rankedNumbers'

export const MAX_HIGH_SCORES = 5

// Snake's scores rank highest first. A stored `0` is kept — the floor is 0 —
// while a score of `0` is never worth recording; both rules are the original's
// and the spec pins them.
const store = createRankedStore({
  storageKey: 'lgdweb-hub:snake:high-scores',
  limit: MAX_HIGH_SCORES,
  minStored: 0,
  compare: (a, b) => b - a
})

export const loadHighScores = (storage: Storage): number[] => store.load(storage)

export const recordScore = (storage: Storage, score: number): number[] =>
  store.record(storage, score)
