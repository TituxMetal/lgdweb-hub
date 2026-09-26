/**
 * In-memory `Storage` double for the specs that exercise the `localStorage`
 * backed stores. Only spec files import it, so it never reaches the bundle.
 */
export const createMemoryStorage = (): Storage => {
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
