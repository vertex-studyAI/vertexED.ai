import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const generator = fs.readFileSync('scripts/generate-study-guide-sitemap.mjs', 'utf8');
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const provenance = JSON.parse(fs.readFileSync('public/study-guides/myp/provenance-ledger.json', 'utf8'));

test('sitemap does not manufacture per-build content modification dates', () => {
  assert.equal(packageJson.scripts.postbuild, undefined);
  assert.doesNotMatch(generator, /new Date\(\)|<lastmod>/);
  assert.doesNotMatch(sitemap, /<lastmod>/);
});

test('unverified detailed guide claims are not promoted in the public sitemap', () => {
  assert.match(generator, /entry\.editorialStatus === "approved"/);
  assert.match(generator, /entry\.publicationStatus === "published"/);
  assert.equal(provenance.summary.approved, 0);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.vertexed\.app\/study-guides\/myp\//);
  assert.match(sitemap, /<loc>https:\/\/www\.vertexed\.app\/study-guides<\/loc>/);
});
