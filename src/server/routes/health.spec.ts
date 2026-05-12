import { describe, expect, test } from 'bun:test'
import { healthRoute } from './health'

describe('healthRoute', () => {
  test('GET /health returns { status: ok }', async () => {
    const response = await healthRoute.request('/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })
})
