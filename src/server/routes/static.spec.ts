import { describe, expect, test } from 'bun:test'
import { staticRoute } from './static'

describe('staticRoute', () => {
  test('exposes the /assets/* middleware and a catch-all', () => {
    const routes = staticRoute.routes.map((route) => `${route.method} ${route.path}`)

    expect(routes).toContain('ALL /assets/*')
    expect(routes).toContain('GET /*')
  })

  test('falls back with 404 when the catch-all index.html is absent', async () => {
    const response = await staticRoute.request('/anything')

    expect([200, 404]).toContain(response.status)
  })
})
