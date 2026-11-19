import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const aboutSource = await readFile(new URL('../src/pages/About.tsx', import.meta.url), 'utf8');
const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const searchIndexSource = await readFile(new URL('../src/lib/globalSearchIndex.ts', import.meta.url), 'utf8');
const siteLayoutSource = await readFile(new URL('../src/components/layout/SiteLayout.tsx', import.meta.url), 'utf8');
const sitemapSource = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');

test('the public VertexED surface does not index or cite founder portfolio work', () => {
  for (const source of [aboutSource, searchIndexSource, siteLayoutSource, sitemapSource]) {
    assert.doesNotMatch(source, /thebu1ld\.com|founderPortfolio|\/projects/iu);
  }

  assert.ok(appSource.includes('<Route path="projects" element={<Navigate to="/about" replace />} />'));
  assert.doesNotMatch(appSource, /pages\/Projects/u);
});
