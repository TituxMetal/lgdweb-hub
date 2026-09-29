import { describe, expect, it } from 'bun:test'
import { staticRoute } from './static'

describe('staticRoute', () => {
  it('serves the built assets, screenshots and project documents before the SPA fallback', () => {
    const routes = staticRoute.routes.map((route) => `${route.method} ${route.path}`)

    expect(routes).toEqual([
      'ALL /assets/*',
      'ALL /thumbnails/*',
      'ALL /projects/*',
      'GET /projects/:slug/*',
      'GET /*'
    ])
  })
})
