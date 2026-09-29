import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Where `bun run dev:server` listens: the composed Hono application, which owns
 * the API and the Tetris WebSocket. The dev server serves the interface alone, so
 * the two things it does not answer are forwarded there rather than 404ing or
 * hanging — without this, the multiplayer cannot be reached from `bun run dev`
 * at all, since the client dials its own origin.
 */
const API_SERVER = '127.0.0.1:3001'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': { target: `http://${API_SERVER}`, changeOrigin: true },
      '/ws': { target: `ws://${API_SERVER}`, ws: true }
    }
  },
  preview: {
    port: 3000,
    strictPort: true
  }
})
