const STORAGE_KEY = 'lgdweb-hub:snake:high-scores'

export const MAX_HIGH_SCORES = 5

// Defends against a hand-edited `localStorage` value: drops anything that
// isn't a non-negative finite number, sorts descending, caps to MAX_HIGH_SCORES.
const sanitize = (values: unknown[]): number[] =>
  values
    .filter(
      (entry): entry is number => typeof entry === 'number' && Number.isFinite(entry) && entry >= 0
    )
    .map((entry) => Math.floor(entry))
    .sort((a, b) => b - a)
    .slice(0, MAX_HIGH_SCORES)

export const loadHighScores = (storage: Storage): number[] => {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return sanitize(parsed)
  } catch {
    return []
  }
}

export const recordScore = (storage: Storage, score: number): number[] => {
  const previous = loadHighScores(storage)
  if (!Number.isFinite(score) || score <= 0) return previous

  const next = sanitize([...previous, Math.floor(score)])
  const unchanged =
    next.length === previous.length && next.every((value, index) => value === previous[index])

  if (unchanged) return previous

  storage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
