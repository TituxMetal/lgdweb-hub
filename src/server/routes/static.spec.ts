import { describe, expect, test } from 'bun:test'
import { staticRoute } from './static'

describe('staticRoute', () => {
  test('exposes the /assets/* middleware and a catch-all', () => {
    const routes = staticRoute.routes.map((route) => `${route.method} ${route.path}`)

    expect(routes).toContain('ALL /assets/*')
    expect(routes).toContain('GET /*')
  })
})
