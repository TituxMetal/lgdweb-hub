import { describe, expect, mock, test } from 'bun:test'
import { createRouter, matchRoute } from '~/lib/router'

describe('matchRoute', () => {
  test('matches the root path against itself', () => {
    expect(matchRoute('/', '/')).toEqual({})
  })

  test('matches an identical static segment', () => {
    expect(matchRoute('/projects', '/projects')).toEqual({})
  })

  test('returns null when segment counts differ', () => {
    expect(matchRoute('/projects', '/projects/snake')).toBeNull()
    expect(matchRoute('/projects/snake', '/projects')).toBeNull()
  })

  test('returns null on a mismatched literal segment', () => {
    expect(matchRoute('/about', '/projects')).toBeNull()
  })

  test('extracts a named param', () => {
    expect(matchRoute('/projects/snake', '/projects/:slug')).toEqual({ slug: 'snake' })
  })

  test('extracts several named params', () => {
    expect(matchRoute('/users/42/posts/abc', '/users/:userId/posts/:postId')).toEqual({
      userId: '42',
      postId: 'abc'
    })
  })

  test('treats trailing slashes as equivalent', () => {
    expect(matchRoute('/projects/', '/projects')).toEqual({})
  })
})

describe('createRouter', () => {
  test('navigate calls pushState with the target url', () => {
    const pushState = mock((_url: string) => {})
    const router = createRouter({ pushState, getPath: () => '/old' })

    router.navigate('/new')

    expect(pushState).toHaveBeenCalledTimes(1)
    expect(pushState).toHaveBeenCalledWith('/new')
  })

  test('navigate notifies all subscribers', () => {
    const subA = mock(() => {})
    const subB = mock(() => {})
    const router = createRouter({ pushState: () => {}, getPath: () => '/old' })

    router.subscribe(subA)
    router.subscribe(subB)
    router.navigate('/new')

    expect(subA).toHaveBeenCalledTimes(1)
    expect(subB).toHaveBeenCalledTimes(1)
  })

  test('navigate to the current path is a no-op', () => {
    const pushState = mock((_url: string) => {})
    const subscriber = mock(() => {})
    const router = createRouter({ pushState, getPath: () => '/same' })

    router.subscribe(subscriber)
    router.navigate('/same')

    expect(pushState).not.toHaveBeenCalled()
    expect(subscriber).not.toHaveBeenCalled()
  })

  test('subscribe returns an unsubscribe function', () => {
    const subscriber = mock(() => {})
    const router = createRouter({ pushState: () => {}, getPath: () => '/old' })

    const unsubscribe = router.subscribe(subscriber)
    unsubscribe()
    router.navigate('/new')

    expect(subscriber).not.toHaveBeenCalled()
  })
})
