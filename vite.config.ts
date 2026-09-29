import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { projects } from './src/data/projects'
import { renderProjectDocument, renderSiteDocument } from './src/lib/siteMetadata'

/**
 * Where `bun run dev:server` listens: the composed Hono application, which owns
 * the API and the Tetris WebSocket. The dev server serves the interface alone, so
 * the two things it does not answer are forwarded there rather than 404ing or
 * hanging — without this, the multiplayer cannot be reached from `bun run dev`
 * at all, since the client dials its own origin.
 */
const API_SERVER = '127.0.0.1:3001'

const DEFAULT_SITE_URL = 'https://lgdweb.fr'

/**
 * One HTML document per old project, emitted after the bundle is written: the
 * build's own `index.html` is the template, so every project's document is the
 * same SPA shell with a head that unfurls as that project. The apex document is
 * rewritten in place with the site-level tags. The server still falls back to the
 * shell for anything else, so an unknown project path keeps reaching the client's
 * not-found state and never 404s.
 */
const projectDocuments: Plugin = {
  name: 'project-documents',
  apply: 'build',
  async writeBundle(options) {
    const outDir = options.dir ?? 'dist'
    const templatePath = join(outDir, 'index.html')
    const template = await readFile(templatePath, 'utf8')
    const siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL

    await writeFile(templatePath, renderSiteDocument(template, siteUrl))

    for (const project of projects) {
      if (project.kind !== 'old') continue

      const documentDir = join(outDir, 'projects', project.slug)

      await mkdir(documentDir, { recursive: true })
      await writeFile(
        join(documentDir, 'index.html'),
        renderProjectDocument(template, project, siteUrl)
      )
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), projectDocuments],
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
