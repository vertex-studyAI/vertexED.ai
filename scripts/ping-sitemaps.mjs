// Legacy Google/Bing sitemap ping endpoints are deprecated (404/410).
 // IndexNow (npm run seo:indexnow) is the supported notification path.
 // This script is kept for manual/historical use and no-ops by default.

import https from 'https'
import http from 'http'
import { URL } from 'url'

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    const req = lib.get(u, (res) => {
      const { statusCode } = res
      res.resume()
      resolve(statusCode)
    })
    req.on('error', reject)
    req.end()
  })
}

async function ping(sitemapUrl) {
  const engines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
  ]
  for (const engineUrl of engines) {
    try {
      const code = await httpGet(engineUrl)
      const note = (code === 404 || code === 410)
        ? 'endpoint deprecated; this is expected'
        : ''
      console.log(`[PING] ${engineUrl} -> ${code} ${note}`)
    } catch (e) {
      console.warn(`[PING] Failed ${engineUrl}:`, e.message)
    }
  }
}

async function main() {
  if (process.env.FORCE_LEGACY_SEO_PING !== 'true') {
    console.log('[PING] Skipped: Google/Bing sitemap ping endpoints are deprecated. Use IndexNow instead.')
    return
  }

  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Provide at least one sitemap URL.')
    process.exit(1)
  }
  for (const sm of args) {
    await ping(sm)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
