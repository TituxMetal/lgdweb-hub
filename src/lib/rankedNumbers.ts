/**
 * A capped, ordered list of integers persisted under one `Storage` key. Snake's
 * high scores and Memory's best runs are the same shape — read, sanitize, cap,
 * write — so the parse, the defence and the write live here once, and each
 * feature binds its own key, order and floor.
 *
 * The two features differ on exactly two axes: which end of the order is best
 * (`compare`) and the smallest value a hand-edited stored entry may hold
 * (`minStored`). A value offered for recording is always held to a positive
 * finite number, which both originals apply (`snake/lib/highScore.ts` and
 * `memory/lib/bestRuns.ts` before this module existed).
 */
export type RankedStoreOptions = {
  /** The `Storage` key the list lives under. */
  storageKey: string
  /** Most entries the list keeps; entries past it are dropped. */
  limit: number
  /** Orders the list best-first. */
  compare: (a: number, b: number) => number
  /** Smallest value a hand-edited stored entry may hold, inclusive. */
  minStored: number
}

export type RankedStore = {
  limit: number
  load: (storage: Storage) => number[]
  record: (storage: Storage, value: number) => number[]
}

export const createRankedStore = ({
  storageKey,
  limit,
  compare,
  minStored
}: RankedStoreOptions): RankedStore => {
  // Defends against a hand-edited `localStorage` value: drops anything that
  // isn't a finite number at or above the floor, floors it to an integer,
  // orders it and caps it to the limit.
  const sanitize = (values: unknown[]): number[] =>
    values
      .filter(
        (entry): entry is number =>
          typeof entry === 'number' && Number.isFinite(entry) && entry >= minStored
      )
      .map((entry) => Math.floor(entry))
      .sort(compare)
      .slice(0, limit)

  const load = (storage: Storage): number[] => {
    const raw = storage.getItem(storageKey)
    if (raw === null) return []

    try {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return sanitize(parsed)
    } catch {
      return []
    }
  }

  const record = (storage: Storage, value: number): number[] => {
    const previous = load(storage)
    if (!Number.isFinite(value) || value <= 0) return previous

    const next = sanitize([...previous, Math.floor(value)])
    const unchanged =
      next.length === previous.length && next.every((entry, index) => entry === previous[index])

    if (unchanged) return previous

    storage.setItem(storageKey, JSON.stringify(next))
    return next
  }

  return { limit, load, record }
}
