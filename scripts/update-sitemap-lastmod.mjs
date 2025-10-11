// Updates all <lastmod> tags in a sitemap.xml to today's date (YYYY-MM-DD)
// Usage: node scripts/update-sitemap-lastmod.mjs public/sitemap.xml

import fs from 'fs'
import path from 'path'

function today() {
  const d = new Date()
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function updateLastmod(xml, dateStr) {
  // Replace content inside <lastmod>...</lastmod>
  return xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${dateStr}<\/lastmod>`)
}

async function main() {
  const target = process.argv[2] || 'public/sitemap.xml'
  const root = process.cwd()
  const abs = path.isAbsolute(target) ? target : path.join(root, target)
  const candidates = [abs]
  const distCopy = path.join(root, 'dist', 'sitemap.xml')
  if (fs.existsSync(distCopy)) candidates.push(distCopy)

  let changedAny = false
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue
    try {
      const xml = fs.readFileSync(file, 'utf8')
      const updated = updateLastmod(xml, today())
      if (updated !== xml) {
        fs.writeFileSync(file, updated, 'utf8')
        console.log(`[sitemap] Updated <lastmod> in ${file}`)
        changedAny = true
      }
    } catch (e) {
      console.warn(`[sitemap] Failed to update ${file}:`, e.message)
    }
  }
  if (!changedAny) console.log('[sitemap] No changes applied')
}

main()
