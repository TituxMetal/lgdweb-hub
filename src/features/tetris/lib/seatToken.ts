/**
 * The proof that this tab holds the seat it is sitting in.
 *
 * The endpoint mints a token for each seat and tells only its holder, so a room
 * member who knows the other player's identifier — the room tells everybody every
 * seat's identifier — still cannot take their place. The token is kept per room
 * code, in `sessionStorage` for the same reason the tab's identifier is: a
 * refresh sends it back and returns to the seat rather than arriving as a
 * stranger, and another tab is another player.
 */

/**
 * The key a token is kept under: the room, however its code reached the tab.
 *
 * The code is normalized the way the endpoint normalizes it for a lookup, so a
 * fragment written in lower case — or pasted with a space around it — still finds
 * the token stored under the code the endpoint answered with. A seat's proof and
 * the seat itself are then keyed by the same room.
 */
const tokenKey = (code: string): string => `tetris-seat-token:${code.trim().toUpperCase()}`

export const readSeatToken = (code: string): string | null => {
  try {
    const token = window.sessionStorage.getItem(tokenKey(code))

    return token === null || token.length === 0 ? null : token
  } catch {
    // Storage can be refused; the seat is then reclaimable only by reloading
    // before the grace passes, which is the honest cost of a refused storage.
    return null
  }
}

export const writeSeatToken = (code: string, token: string): void => {
  try {
    window.sessionStorage.setItem(tokenKey(code), token)
  } catch {
    // As above: the game goes on, the seat is simply not remembered.
  }
}
