import { Hono } from 'hono'
import { websocket } from 'hono/bun'
import { MAX_MESSAGE_LENGTH } from '../shared/tetris-protocol'
import { tetrisRoute } from './games/tetris/route'
import { loadConfig } from './lib/config'
import { healthRoute } from './routes/health'
import { staticRoute } from './routes/static'

const config = loadConfig()

// The Tetris group is mounted before the static group: the static catch-all
// answers every GET the SPA fallback does not claim, so a group registered after
// it would never see its own path.
const app = new Hono().route('/api', healthRoute).route('/', tetrisRoute).route('/', staticRoute)

export default {
  port: config.port,
  hostname: config.host,
  fetch: app.fetch,
  // `websocket` belongs to the Bun adapter, not to the Hono application: the
  // upgrade a route declares is carried by the server the config starts.
  //
  // The frame ceiling is set here because this is where the runtime reads it: it
  // has the transport refuse an oversized frame instead of buffering it, and the
  // endpoint's own check in the message handler stays as the second line.
  websocket: { ...websocket, maxPayloadLength: MAX_MESSAGE_LENGTH }
}
