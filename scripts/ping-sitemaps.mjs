// Pings sitemap URLs to search engines (Google and Bing)
// Usage: node scripts/ping-sitemaps.mjs https://www.vertexed.app/sitemap.xml [more...]

import https from 'https'
import { URL } from 'url'

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : require('http')
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
      console.log(`[PING] ${engineUrl} -> ${code}`)
    } catch (e) {
      console.warn(`[PING] Failed ${engineUrl}:`, e.message)
    }
  }
}

async function main() {
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
