/**
 * Mini-router on top of the History API. One pattern, one render — no nesting.
 * Patterns use `:name` segments to capture params.
 *
 * A route may be declared as a *branch* (`prefix: true`): it then matches the
 * leading segments of a deeper path and the feature it mounts reads the rest of
 * the pathname itself, so a feature's internal URLs stay addressable while the
 * central map learns nothing about what the feature contains.
 *
 * Public API: `navigate`, `<Link>`, `useCurrentPath`, `useRouteParams`,
 * `isPlainLeftClick`, `<RouterView>`. `matchRoute`, `matchRoutePrefix`,
 * `findRoute` and `createRouter` are exported for tests and non-browser callers.
 */
import { type MouseEvent, type ReactNode, useSyncExternalStore } from 'react'

export type Params = Record<string, string>

type Listener = () => void

const pathSegments = (path: string): string[] => path.split('/').filter(Boolean)

/** Returns the extracted params if `path` matches `pattern`, or `null`. */
export const matchRoute = (path: string, pattern: string): Params | null => {
  const pathParts = pathSegments(path)
  const patternParts = pathSegments(pattern)

  if (pathParts.length !== patternParts.length) return null
  if (patternParts.length === 0) return {}

  return matchRoutePrefix(path, pattern)
}

/**
 * Returns the params `pattern` captures at the start of `path` — whatever the
 * path carries past them belongs to the feature the route mounts — or `null`
 * when `path` does not start with the pattern. A pattern with no segments is
 * never a branch: a branch owns paths deeper than itself.
 */
export const matchRoutePrefix = (path: string, pattern: string): Params | null => {
  const pathParts = pathSegments(path)
  const patternParts = pathSegments(pattern)

  if (patternParts.length === 0) return null
  if (pathParts.length < patternParts.length) return null

  const params: Params = {}

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    if (patternPart === undefined || pathPart === undefined) return null

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart
      continue
    }

    if (patternPart !== pathPart) return null
  }

  return params
}

type RouterAdapters = {
  pushState: (url: string) => void
  getPath: () => string
}

export type Router = {
  navigate: (to: string) => void
  subscribe: (listener: Listener) => () => void
  getPath: () => string
}

/** Builds a router around injectable adapters (browser by default, test-friendly). */
export const createRouter = (adapters: RouterAdapters): Router => {
  const subscribers = new Set<Listener>()

  const navigate = (to: string): void => {
    if (to === adapters.getPath()) return
    adapters.pushState(to)
    for (const subscriber of subscribers) subscriber()
  }

  const subscribe = (listener: Listener): (() => void) => {
    subscribers.add(listener)
    return () => {
      subscribers.delete(listener)
    }
  }

  return { navigate, subscribe, getPath: adapters.getPath }
}

const browserRouter = createRouter({
  pushState: (url) => {
    // A pushed route keeps the offset of the page the visitor was on, and the browser
    // then clamps it to the end of a shorter page — enough for a link followed from
    // 2000px down to open the next project at its bottom. The offset is reset only
    // when the path changes: a hash-only push (`navigate('#projects')`) must leave the
    // viewport where the feature's own `scrollIntoView` put it.
    const pathChanged = new URL(url, window.location.href).pathname !== window.location.pathname

    window.history.pushState(null, '', url)
    if (pathChanged) window.scrollTo(0, 0)
  },
  getPath: () => window.location.pathname
})

const subscribeBrowser = (callback: Listener): (() => void) => {
  const unsubscribe = browserRouter.subscribe(callback)
  window.addEventListener('popstate', callback)

  return () => {
    unsubscribe()
    window.removeEventListener('popstate', callback)
  }
}

/** Pushes a new path into history and notifies subscribers. No-op if already there. */
export const navigate = browserRouter.navigate

/** Reactive subscription to the current pathname. Re-renders on push/popstate. */
export const useCurrentPath = (): string =>
  useSyncExternalStore(
    subscribeBrowser,
    () => browserRouter.getPath(),
    () => '/'
  )

/** Matches the current path against `pattern` and returns its params, or `null`. */
export const useRouteParams = <P extends Params = Params>(pattern: string): P | null => {
  const path = useCurrentPath()
  return matchRoute(path, pattern) as P | null
}

type LinkProps = {
  to: string
  children: ReactNode
  className?: string
  title?: string
  /** The control's spoken name, when its visible text is not enough on its own. */
  'aria-label'?: string
}

/**
 * True for the click a router may intercept: a plain left-click the page has
 * not already handled. Modifier keys, non-left buttons and prevented events
 * fall through to the native anchor, so the browser can open a new tab, copy
 * the URL, etc.
 */
export const isPlainLeftClick = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey

/** Anchor that intercepts plain left-clicks to call `navigate(to)` instead of a
 * full reload. */
export const Link = ({ to, children, className, title, 'aria-label': ariaLabel }: LinkProps) => {
  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!isPlainLeftClick(event)) return

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={onClick} className={className} title={title} aria-label={ariaLabel}>
      {children}
    </a>
  )
}

export type RouteDefinition = {
  pattern: string
  render: (params: Params) => ReactNode
  /**
   * A branch: the route owns every path past its own pattern, and the feature it
   * mounts reads the rest of the pathname itself. The central map still carries
   * no knowledge of what the feature contains.
   */
  prefix?: boolean
}

type RouterViewProps = {
  routes: RouteDefinition[]
  fallback?: () => ReactNode
}

/**
 * The first route that answers for `path`, with the params it captured, or `null`.
 * A route declared as a branch (`prefix: true`) matches the leading segments of a
 * deeper path and owns whatever follows; every other route must match the whole
 * path. `RouterView` renders through this, so the predicate the shell applies is
 * the one its callers can test.
 */
export const findRoute = <P extends Params = Params>(
  path: string,
  routes: RouteDefinition[]
): { route: RouteDefinition; params: P } | null => {
  for (const route of routes) {
    const params =
      route.prefix === true
        ? matchRoutePrefix(path, route.pattern)
        : matchRoute(path, route.pattern)

    if (params) return { route, params: params as P }
  }

  return null
}

/** Renders the first route whose pattern matches the current path, else `fallback`. */
export const RouterView = ({ routes, fallback }: RouterViewProps) => {
  const path = useCurrentPath()
  const match = findRoute(path, routes)

  if (match !== null) return <>{match.route.render(match.params)}</>

  return <>{fallback?.() ?? null}</>
}
