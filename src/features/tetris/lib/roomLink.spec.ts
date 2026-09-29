import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { clearCodeFragment, codeFromFragment, roomLink, writeCodeFragment } from './roomLink'

/**
 * The fragment, which is the whole invitation: the code the visitor arrived with,
 * the one the panel hands a friend, and the one that is dropped when the visitor
 * goes back to playing alone.
 *
 * The module reads a browser rather than owning one, so the page here is the
 * smallest browser those functions touch: the URL the visitor is on, and
 * `replaceState`, the one thing the module may do to it.
 */

const page = {
  origin: 'https://example.test',
  pathname: '/projects/tetris',
  search: '',
  hash: ''
}

/** What the module asked the browser to do to the address, in order. */
let rewrites: string[] = []

/** The browser's own reading of a URL it was handed: the fragment, and nothing else. */
const fragmentOf = (url: string): string => {
  const marker = url.indexOf('#')

  return marker === -1 ? '' : url.slice(marker)
}

const fakeWindow = {
  location: {
    protocol: 'https:',
    get origin() {
      return page.origin
    },
    get pathname() {
      return page.pathname
    },
    get search() {
      return page.search
    },
    get hash() {
      return page.hash
    }
  },
  history: {
    replaceState: (_data: unknown, _title: string, url: string): void => {
      rewrites.push(url)
      page.hash = fragmentOf(url)
    }
  }
}

beforeEach(() => {
  page.pathname = '/projects/tetris'
  page.search = ''
  page.hash = ''
  rewrites = []
  Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true })
})

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'window')
})

describe('codeFromFragment', () => {
  it('reads the room a code names', () => {
    page.hash = '#ABC234'

    expect(codeFromFragment()).toBe('ABC234')
  })

  it('reads no room out of a fragment that is not a code', () => {
    // A fragment is the browser's and the visitor's text, not the feature's:
    // highlight links, anchors and hand-typed addresses live there, and none of
    // them names a room. Sending one on as a code would earn a refusal that names
    // neither the cause nor a way out.
    for (const hash of [
      '',
      '#',
      '#section',
      '#:~:text=quoted',
      '#hello',
      '#ABCDE',
      '#ABCDEFG',
      '#AB-C23',
      '#ABC 23'
    ]) {
      page.hash = hash

      expect(codeFromFragment()).toBeNull()
    }
  })
})

describe('writeCodeFragment', () => {
  it('writes the code into the fragment, without a history entry', () => {
    // The room a player is given is not a page they navigated to: Back leaves the
    // feature rather than stepping through the rooms the tab passed through, so
    // the address is rewritten rather than pushed.
    writeCodeFragment('ABC234')

    expect(rewrites).toEqual(['/projects/tetris#ABC234'])
    expect(page.hash).toBe('#ABC234')
    expect(codeFromFragment()).toBe('ABC234')
  })

  it('keeps the query the page was on', () => {
    page.search = '?lang=fr'

    writeCodeFragment('ABC234')

    expect(rewrites).toEqual(['/projects/tetris?lang=fr#ABC234'])
  })
})

describe('clearCodeFragment', () => {
  it('drops the fragment and leaves the page it was on', () => {
    page.search = '?lang=fr'
    writeCodeFragment('ABC234')

    clearCodeFragment()

    expect(rewrites).toEqual(['/projects/tetris?lang=fr#ABC234', '/projects/tetris?lang=fr'])
    expect(codeFromFragment()).toBeNull()
  })
})

describe('roomLink', () => {
  it('hands a friend this feature’s own address, with the code in its fragment', () => {
    expect(roomLink('ABC234')).toBe('https://example.test/projects/tetris#ABC234')
  })
})
