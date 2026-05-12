import { Hono } from 'hono'
import { loadConfig } from './lib/config'
import { healthRoute } from './routes/health'
import { staticRoute } from './routes/static'

const config = loadConfig()

const app = new Hono().route('/api', healthRoute).route('/', staticRoute)

export default {
  port: config.port,
  hostname: config.host,
  fetch: app.fetch
}
