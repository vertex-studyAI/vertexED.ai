import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const manifestPath = resolve(projectRoot, "public/study-guides/myp/manifest.json");
const sitemapPath = resolve(projectRoot, "public/sitemap.xml");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const lastmod = new Date().toISOString().slice(0, 10);

const pageUrl = (subject, page) => {
  const pathname = page.relativePath
    .replace(/\.md$/i, "")
    .split("/")
    .map((part) => encodeURIComponent(part.toLowerCase()))
    .join("/");
  return `https://www.vertexed.app/study-guides/myp/${subject.slug}/${pathname}`;
};

const urls = ["https://www.vertexed.app/study-guides", ...manifest.subjects.flatMap((subject) => subject.pages.map((page) => pageUrl(subject, page)))];
const block = [
  "  <!-- STUDY_GUIDES_START -->",
  ...urls.map((url) => ["  <url>", `    <loc>${url}</loc>`, `    <lastmod>${lastmod}</lastmod>`, "    <changefreq>monthly</changefreq>", "    <priority>0.7</priority>", "  </url>"].join("\n")),
  "  <!-- STUDY_GUIDES_END -->",
].join("\n");

const sitemap = await readFile(sitemapPath, "utf8");
const nextSitemap = /  <!-- STUDY_GUIDES_START -->[\s\S]*?  <!-- STUDY_GUIDES_END -->/.test(sitemap)
  ? sitemap.replace(/  <!-- STUDY_GUIDES_START -->[\s\S]*?  <!-- STUDY_GUIDES_END -->/, block)
  : sitemap.replace("</urlset>", `${block}\n</urlset>`);
await writeFile(sitemapPath, nextSitemap, "utf8");
console.log(`Added ${urls.length} Study Guide URLs to public/sitemap.xml.`);