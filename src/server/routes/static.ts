import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

/** A slug is a path segment of its own: anything else never reaches the disk. */
const SLUG_PATTERN = /^[a-z0-9-]+$/

/**
 * Static asset routes for the SPA. Order is the invariant: the built bundles,
 * then the per-project screenshot directory, then one built document per project
 * — a directory serves its own `index.html` — then the deep project paths, and
 * finally the catch-all that falls back to `dist/index.html` so the mini-router
 * can resolve any other client-side path, including an unknown project, on hard
 * reload.
 */
export const staticRoute = new Hono()
  .use('/assets/*', serveStatic({ root: './dist' }))
  .use('/thumbnails/*', serveStatic({ root: './dist' }))
  .use('/projects/*', serveStatic({ root: './dist' }))
  // A feature's own sub-route — a Chess chapter, for one — has no file of its
  // own, yet its document must still be the project's: a link shared there
  // unfurls as the project instead of as the apex page. A path whose project
  // emitted no document falls through to the shell and the client's not-found.
  .get('/projects/:slug/*', async (context, next) => {
    const slug = context.req.param('slug')

    if (!SLUG_PATTERN.test(slug)) return next()

    const document = Bun.file(`./dist/projects/${slug}/index.html`)

    if (!(await document.exists())) return next()

    return new Response(document, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  })
  .get('*', serveStatic({ path: './dist/index.html' }))
