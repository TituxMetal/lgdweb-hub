/**
 * The identifier this tab plays under.
 *
 * It is minted in the browser and kept for the tab's lifetime: a refresh sends
 * the same identifier and reclaims the same seat, which is what keeps a reload
 * from looking like a third player. `sessionStorage` rather than `localStorage`,
 * because two tabs are two players — the storage's own scope already draws that
 * line, so nothing has to.
 *
 * Minted from the platform's cryptographic source, like the room code it will be
 * paired with: both are handed out to strangers, and a guessable identity is a
 * seat someone else can take.
 */

const CLIENT_ID_KEY = 'tetris-client-id'

const mintId = (): string =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
        byte.toString(16).padStart(2, '0')
      ).join('')

export const clientId = (): string => {
  try {
    const stored = window.sessionStorage.getItem(CLIENT_ID_KEY)
    if (stored !== null && stored.length > 0) return stored

    const minted = mintId()
    window.sessionStorage.setItem(CLIENT_ID_KEY, minted)

    return minted
  } catch {
    // Storage can be refused — a private window, blocked cookies. An identity
    // that lives for the visit keeps the game playable; only a refresh loses the
    // seat, and the room holds it for a while regardless.
    return mintId()
  }
}
