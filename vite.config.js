import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite plugin that handles /.netlify/functions/fetch-page during dev,
 * so the auto-migrator works without needing `netlify dev`.
 */
function fetchPageProxy() {
  return {
    name: 'fetch-page-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/.netlify/functions/fetch-page')) return next()

        const params = new URL(req.url, 'http://localhost').searchParams
        const targetUrl = params.get('url')

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        if (!targetUrl) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Missing ?url= parameter' }))
          return
        }

        let parsed
        try {
          parsed = new URL(targetUrl)
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid URL' }))
          return
        }

        if (!['http:', 'https:'].includes(parsed.protocol)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Only http/https URLs are allowed' }))
          return
        }

        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 15000)

          const upstream = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BlogMigrator/1.0)',
              'Accept': 'text/html,application/xhtml+xml,*/*',
            },
            redirect: 'follow',
          })

          clearTimeout(timeout)

          if (!upstream.ok) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: `Upstream returned ${upstream.status}` }))
            return
          }

          const html = await upstream.text()
          res.end(JSON.stringify({ html, finalUrl: upstream.url }))
        } catch (err) {
          res.statusCode = 502
          const message = err.name === 'AbortError' ? 'Request timed out (15s)' : err.message
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), fetchPageProxy()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
