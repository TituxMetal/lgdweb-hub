import { projectPath } from '~/data/projects'
import { ROOM_CODE_LENGTH } from '~/shared/tetris-protocol'

/**
 * The room code lives in the page's fragment and nowhere else.
 *
 * It never reaches the server: fragments stay in the browser, so a code is not in
 * a request line, not in an access log, and not in the referrer a shared link
 * leaks. The mini-router matches paths, so the fragment rides beside its model —
 * this feature reads and writes it, the router never learns it exists.
 */

/**
 * The shape the endpoint mints a code in: six alphanumerics, and only that.
 *
 * A fragment is the browser's and the visitor's text, not the feature's: a
 * `#:~:text=` highlight link, a section anchor, a hand-typed address all live
 * there and none of them names a room. Anything that is not a code reads as "no
 * room" — the visitor plays alone — instead of travelling to the endpoint as a
 * code it would refuse with a message that names neither the cause nor a way out.
 */
const CODE_SHAPE = new RegExp(`^[A-Za-z0-9]{${ROOM_CODE_LENGTH}}$`)

/** The code the visitor arrived with, or `null` when they are here to play alone. */
export const codeFromFragment = (): string | null => {
  const code = window.location.hash.replace(/^#/, '').trim()

  return CODE_SHAPE.test(code) ? code : null
}

/**
 * The code into the fragment without a history entry: the room a player is given
 * is not a page they navigated to, so Back should leave the feature rather than
 * step through the codes of the rooms they passed through.
 */
export const writeCodeFragment = (code: string): void => {
  window.history.replaceState(null, '', `${path()}#${code}`)
}

/** Drops the fragment when the visitor returns to playing alone. */
export const clearCodeFragment = (): void => {
  window.history.replaceState(null, '', path())
}

/** The link a player hands a friend: this feature's own URL, with the code in the fragment. */
export const roomLink = (code: string): string =>
  `${window.location.origin}${projectPath('tetris')}#${code}`

/** The current page without its fragment, so a rewrite keeps the query and the trailing slash it found. */
const path = (): string => `${window.location.pathname}${window.location.search}`
