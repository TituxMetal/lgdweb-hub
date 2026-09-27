import { describe, expect, it, mock } from 'bun:test'
import type { MouseEvent } from 'react'
import { createRouter, isPlainLeftClick, matchRoute, matchRoutePrefix } from '~/lib/router'

type ClickEvent = MouseEvent<HTMLAnchorElement>

/** An event as the predicate reads it; no DOM is involved. */
const click = (overrides: Partial<ClickEvent>): ClickEvent =>
  ({
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides
  }) as ClickEvent

describe('isPlainLeftClick', () => {
  it('accepts a plain left click', () => {
    expect(isPlainLeftClick(click({}))).toBe(true)
  })

  it('refuses an event the page has already handled', () => {
    expect(isPlainLeftClick(click({ defaultPrevented: true }))).toBe(false)
  })

  it('refuses the middle and right buttons', () => {
    expect(isPlainLeftClick(click({ button: 1 }))).toBe(false)
    expect(isPlainLeftClick(click({ button: 2 }))).toBe(false)
  })

  it('refuses every modifier, so the browser can open a new tab', () => {
    expect(isPlainLeftClick(click({ metaKey: true }))).toBe(false)
    expect(isPlainLeftClick(click({ ctrlKey: true }))).toBe(false)
    expect(isPlainLeftClick(click({ shiftKey: true }))).toBe(false)
    expect(isPlainLeftClick(click({ altKey: true }))).toBe(false)
  })
})

describe('matchRoute', () => {
  it('matches the root path against itself', () => {
    expect(matchRoute('/', '/')).toEqual({})
  })

  it('matches an identical static segment', () => {
    expect(matchRoute('/projects', '/projects')).toEqual({})
  })

  it('returns null when segment counts differ', () => {
    expect(matchRoute('/projects', '/projects/snake')).toBeNull()
    expect(matchRoute('/projects/snake', '/projects')).toBeNull()
  })

  it('returns null on a mismatched literal segment', () => {
    expect(matchRoute('/about', '/projects')).toBeNull()
  })

  it('extracts a named param', () => {
    expect(matchRoute('/projects/snake', '/projects/:slug')).toEqual({ slug: 'snake' })
  })

  it('extracts several named params', () => {
    expect(matchRoute('/users/42/posts/abc', '/users/:userId/posts/:postId')).toEqual({
      userId: '42',
      postId: 'abc'
    })
  })

  it('treats trailing slashes as equivalent', () => {
    expect(matchRoute('/projects/', '/projects')).toEqual({})
  })

  it('refuses a path longer than its pattern — that is a branch, not a match', () => {
    expect(
      matchRoute('/projects/chess/story/01-introduction/chapter/01-pawn', '/projects/:slug')
    ).toBeNull()
  })
})

/**
 * The project branch: a feature owns every path under its own prefix, so the
 * route that mounts it matches the leading segments of a deeper path and the
 * feature reads the rest for itself.
 */
describe('matchRoutePrefix', () => {
  it('matches a branch and extracts its params', () => {
    expect(matchRoutePrefix('/projects/chess', '/projects/:slug')).toEqual({ slug: 'chess' })
  })

  it('matches a branch on a deep path, capturing only its own segments', () => {
    expect(
      matchRoutePrefix(
        '/projects/chess/story/01-introduction/chapter/01-what-is-chess',
        '/projects/:slug'
      )
    ).toEqual({ slug: 'chess' })
  })

  it('treats a trailing slash as the branch itself', () => {
    expect(matchRoutePrefix('/projects/chess/', '/projects/:slug')).toEqual({ slug: 'chess' })
  })

  it('refuses a path that does not start with the pattern', () => {
    expect(matchRoutePrefix('/projects', '/projects/:slug')).toBeNull()
    expect(matchRoutePrefix('/about/chess', '/projects/:slug')).toBeNull()
    expect(matchRoutePrefix('/projects/chess', '/story/:storyId')).toBeNull()
  })

  it('refuses a literal segment that differs under the prefix', () => {
    expect(matchRoutePrefix('/project/chess', '/projects/:slug')).toBeNull()
  })

  it('refuses a pattern with no segments: a branch owns paths deeper than itself', () => {
    expect(matchRoutePrefix('/anything', '/')).toBeNull()
  })
})

describe('createRouter', () => {
  it('navigate calls pushState with the target url', () => {
    const pushState = mock((_url: string) => {})
    const router = createRouter({ pushState, getPath: () => '/old' })

    router.navigate('/new')

    expect(pushState).toHaveBeenCalledTimes(1)
    expect(pushState).toHaveBeenCalledWith('/new')
  })

  it('navigate notifies all subscribers', () => {
    const subA = mock(() => {})
    const subB = mock(() => {})
    const router = createRouter({ pushState: () => {}, getPath: () => '/old' })

    router.subscribe(subA)
    router.subscribe(subB)
    router.navigate('/new')

    expect(subA).toHaveBeenCalledTimes(1)
    expect(subB).toHaveBeenCalledTimes(1)
  })

  it('navigate to the current path is a no-op', () => {
    const pushState = mock((_url: string) => {})
    const subscriber = mock(() => {})
    const router = createRouter({ pushState, getPath: () => '/same' })

    router.subscribe(subscriber)
    router.navigate('/same')

    expect(pushState).not.toHaveBeenCalled()
    expect(subscriber).not.toHaveBeenCalled()
  })

  it('subscribe returns an unsubscribe function', () => {
    const subscriber = mock(() => {})
    const router = createRouter({ pushState: () => {}, getPath: () => '/old' })

    const unsubscribe = router.subscribe(subscriber)
    unsubscribe()
    router.navigate('/new')

    expect(subscriber).not.toHaveBeenCalled()
  })
})
