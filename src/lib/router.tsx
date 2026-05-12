/**
 * Mini-router on top of the History API. No nesting, no wildcards: one pattern,
 * one render. Patterns use `:name` segments to capture params.
 *
 * Public API: `navigate`, `<Link>`, `useCurrentPath`, `useRouteParams`,
 * `<RouterView>`. `matchRoute` and `createRouter` are exported for tests and
 * non-browser callers.
 */
import { type MouseEvent, type ReactNode, useSyncExternalStore } from 'react'

export type Params = Record<string, string>

type Listener = () => void

/** Returns the extracted params if `path` matches `pattern`, or `null`. */
export const matchRoute = (path: string, pattern: string): Params | null => {
  const pathSegments = path.split('/').filter(Boolean)
  const patternSegments = pattern.split('/').filter(Boolean)

  if (pathSegments.length !== patternSegments.length) return null
  if (pathSegments.length === 0) return {}

  const params: Params = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i]
    const pathSeg = pathSegments[i]

    if (patternSeg === undefined || pathSeg === undefined) return null

    if (patternSeg.startsWith(':')) {
      params[patternSeg.slice(1)] = pathSeg
      continue
    }

    if (patternSeg !== pathSeg) return null
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
  pushState: (url) => window.history.pushState(null, '', url),
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
}

/**
 * Anchor that intercepts plain left-clicks to call `navigate(to)` instead of a
 * full reload. Modifier keys (Cmd/Ctrl/Shift/Alt), non-left mouse buttons and
 * already-prevented events fall through to the native anchor so the browser can
 * open a new tab, copy the URL, etc.
 */
export const Link = ({ to, children, className }: LinkProps) => {
  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (event.defaultPrevented) return
    if (event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={onClick} className={className}>
      {children}
    </a>
  )
}

export type RouteDefinition = {
  pattern: string
  render: (params: Params) => ReactNode
}

type RouterViewProps = {
  routes: RouteDefinition[]
  fallback?: () => ReactNode
}

/** Renders the first route whose pattern matches the current path, else `fallback`. */
export const RouterView = ({ routes, fallback }: RouterViewProps) => {
  const path = useCurrentPath()

  for (const route of routes) {
    const params = matchRoute(path, route.pattern)
    if (params) return <>{route.render(params)}</>
  }

  return <>{fallback?.() ?? null}</>
}
