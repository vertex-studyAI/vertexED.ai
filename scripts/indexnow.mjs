// Minimal IndexNow submission script for Bing
// Docs: https://www.indexnow.org/ and https://learn.microsoft.com/bing/webmaster/indexnow
// Usage: node scripts/indexnow.mjs --host=https://www.vertexed.app --key=YOUR_KEY --keyLocation=https://www.vertexed.app/YOUR_KEY.txt --urls=https://www.vertexed.app/
// Optionally: --fromSitemap=public/sitemap.xml to submit all URLs listed in sitemap

import fs from 'fs'
import path from 'path'
import https from 'https'

function parseArgs() {
  const args = {}
  for (const part of process.argv.slice(2)) {
    const [k, v] = part.split('=')
    args[k.replace(/^--/, '')] = v ?? true
  }
  return args
}

function ensureKeyFile(publicDir, key, keyLocationUrl) {
  const keyFile = path.join(publicDir, `${key}.txt`)
  if (!fs.existsSync(keyFile)) {
    fs.writeFileSync(keyFile, key, 'utf8')
    console.log(`[IndexNow] Created key file: ${keyFile}`)
  }
  console.log(`[IndexNow] Key location: ${keyLocationUrl}`)
}

function readUrlsFromSitemap(filePath) {
  try {
    const xml = fs.readFileSync(filePath, 'utf8')
    const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    return matches.map((m) => m[1])
  } catch (e) {
    console.warn(`[IndexNow] Could not read sitemap at ${filePath}: ${e.message}`)
    return []
  }
}

function submitIndexNow(host, key, keyLocation, urls) {
  const payload = JSON.stringify({ host, key, keyLocation, urlList: urls })

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.indexnow.org',
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          console.log(`[IndexNow] ${res.statusCode} ${res.statusMessage}`)
          if (data) console.log(`[IndexNow] Response: ${data}`)
          resolve(res.statusCode)
        })
      }
    )
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

async function main() {
  const args = parseArgs()
  const root = process.cwd()
  const publicDir = path.join(root, 'public')

  const host = args.host || 'https://www.vertexed.app'
  const key = args.key || process.env.INDEXNOW_KEY || 'REPLACE_WITH_INDEXNOW_KEY'
  const keyLocation = args.keyLocation || `${host}/${key}.txt`

  if (!key || key === 'REPLACE_WITH_INDEXNOW_KEY') {
    console.warn('[IndexNow] No key provided via --key or env INDEXNOW_KEY.')
    if (args.ensureKeyOnly) {
      // In ensureKeyOnly mode, just exit silently if key isn't available yet
      process.exit(0)
    }
    console.warn('[IndexNow] Skipping submission due to missing key.')
    process.exit(0)
  }

  ensureKeyFile(publicDir, key, keyLocation)

  let urls = []
  if (args.urls) {
    urls = args.urls.split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (args.fromSitemap) {
    const sitemapPath = path.isAbsolute(args.fromSitemap)
      ? args.fromSitemap
      : path.join(root, args.fromSitemap)
    urls = urls.concat(readUrlsFromSitemap(sitemapPath))
  }

  // Fallback: at least submit the homepage
  if (urls.length === 0) urls = [`${host}/`]

  const uniqueUrls = Array.from(new Set(urls))
  await submitIndexNow(host.replace(/https?:\/\//, '').replace(/\/$/, ''), key, keyLocation, uniqueUrls)
}

main().catch((e) => {
  console.error('[IndexNow] Error:', e)
  process.exit(1)
})
