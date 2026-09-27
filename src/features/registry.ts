import { type ComponentType, type LazyExoticComponent, lazy } from 'react'

/**
 * Every project the showroom can render, by slug — the single place a feature is
 * wired to a manifest entry. The routes stay central (`src/App.tsx`); this map
 * is the line the author adds when a project lands, and the seam the manifest's
 * membership invariant reads: a slug here that the manifest does not list is a
 * disagreement the showroom must never ship. The manifest's other direction — a
 * listed project whose feature has not landed — is the placeholder, by design.
 *
 * Each feature is loaded lazily from its own entry point, so the initial load
 * carries the shell and the list only.
 */
const PROJECT_FEATURES: Readonly<Record<string, LazyExoticComponent<ComponentType>>> = {
  snake: lazy(() => import('~/features/snake').then((module) => ({ default: module.Snake }))),
  'tic-tac-toe': lazy(() =>
    import('~/features/tic-tac-toe').then((module) => ({ default: module.TicTacToe }))
  ),
  memory: lazy(() => import('~/features/memory').then((module) => ({ default: module.Memory }))),
  portfolio: lazy(() =>
    import('~/features/portfolio').then((module) => ({ default: module.Portfolio }))
  ),
  pomodoro: lazy(() =>
    import('~/features/pomodoro').then((module) => ({ default: module.Pomodoro }))
  ),
  'game-of-life': lazy(() =>
    import('~/features/game-of-life').then((module) => ({ default: module.GameOfLife }))
  )
}

/** The slugs the showroom renders itself, for the manifest's membership invariant. */
export const PROJECT_FEATURE_SLUGS: readonly string[] = Object.keys(PROJECT_FEATURES)

/**
 * The feature for a slug, or `undefined` when the showroom has none. The lookup
 * owns its key space: a bare `PROJECT_FEATURES[slug]` answers with
 * `Object.prototype`'s members for a slug like `constructor` or `toString`, and
 * the caller would mount a non-component — a blank page, since nothing in the
 * shell catches a render error.
 */
export const projectFeature = (slug: string): LazyExoticComponent<ComponentType> | undefined =>
  Object.hasOwn(PROJECT_FEATURES, slug) ? PROJECT_FEATURES[slug] : undefined
