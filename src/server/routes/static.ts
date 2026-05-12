import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

/**
 * Static asset routes for the SPA. Order is the invariant:
 * `/assets/*` serves built bundles first; the catch-all `*` falls back to
 * `index.html` so the mini-router can resolve client-side paths on hard reload.
 */
export const staticRoute = new Hono()
  .use('/assets/*', serveStatic({ root: './dist' }))
  .get('*', serveStatic({ path: './dist/index.html' }))
