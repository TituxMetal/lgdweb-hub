import { describe, expect, it } from 'bun:test'
import { routes } from '~/App'
import { PROJECT_ROUTE_PATTERN } from '~/data/projects'
import { CHESS_BRANCH, chapterPath, completionPath } from '~/features/chess/lib/routes'
import { findRoute, type RouteDefinition } from '~/lib/router'

/**
 * The declared table's prefix branch, asserted at the seam `RouterView` renders
 * through: `findRoute` is the production predicate, so these cases fail the moment
 * the project route loses its `prefix` flag — the dispatch no other spec covered.
 * The three URLs are the ones the feature's own links produce, which the ticket
 * requires to survive a direct reload.
 */
const DEEP_CHESS_URLS = [
  chapterPath('01-introduction', '01-what-is-chess'),
  completionPath('01-introduction')
]

const CHESS_INTERNAL_URLS = [CHESS_BRANCH, ...DEEP_CHESS_URLS]

describe('the declared route table', () => {
  it('mounts the project branch for each of the original’s internal URLs', () => {
    for (const url of CHESS_INTERNAL_URLS) {
      const found = findRoute(url, routes)

      expect(found?.route.pattern).toBe(PROJECT_ROUTE_PATTERN)
      expect(found?.params).toEqual({ slug: 'chess' })
    }
  })

  it('leaves the deep URLs unanswered once the project route is no longer a branch', () => {
    const exactOnly: RouteDefinition[] = routes.map((route) => ({ ...route, prefix: false }))

    for (const url of DEEP_CHESS_URLS) {
      expect(findRoute(url, exactOnly)).toBeNull()
    }
  })

  it('still sends the root and the projects root to their own handling', () => {
    const root = findRoute('/', routes)

    expect(root?.route.pattern).toBe('/')
    expect(root?.params).toEqual({})
    // The branch needs a slug, so the bare prefix is not swallowed by it: the
    // shell's not-found fallback answers instead.
    expect(findRoute('/projects', routes)).toBeNull()
  })
})
