import { Hono } from 'hono'

export const healthRoute = new Hono().get('/health', (context) => context.json({ status: 'ok' }))
