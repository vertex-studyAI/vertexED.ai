import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readVercelConfig() {
  const raw = await readFile(new URL('../vercel.json', import.meta.url), 'utf8');
  return JSON.parse(raw);
}

async function readHealthHandler() {
  return readFile(new URL('../api/_handlers/health.js', import.meta.url), 'utf8');
}

async function readCheckedInBuildRevision() {
  return readFile(new URL('../api/_generated/build-revision.js', import.meta.url), 'utf8');
}

test('Vercel stamps immutable revision during the build before serverless function packaging', async () => {
  const config = await readVercelConfig();
  assert.match(
    config.buildCommand,
    /VERTEXED_REQUIRE_BUILD_REVISION=1 .*npm run build/,
  );
  assert.equal(config.installCommand, 'npm ci');
});

test('checked-in generated revision is neutral until a deploy-relevant build stamps it', async () => {
  const source = await readCheckedInBuildRevision();
  assert.match(source, /export const BUILD_REVISION = null;/);
  assert.doesNotMatch(source, /export const BUILD_REVISION = ["'][0-9a-f]{7,40}["'];/i);
});

test('Vercel catch-all function keeps schema-valid includeFiles configuration', async () => {
  const config = await readVercelConfig();
  const fn = config.functions?.['api/[[...path]].js'];
  assert.ok(fn, 'catch-all Vercel function config must exist');
  assert.equal(typeof fn.includeFiles, 'string');
  assert.equal(fn.includeFiles, 'public/study-guides/myp/**');
});

test('health handler directly imports the generated revision module for function tracing', async () => {
  const source = await readHealthHandler();
  assert.match(
    source,
    /import\s*\{\s*BUILD_REVISION\s*\}\s*from\s*['"]\.\.\/_generated\/build-revision\.js['"]/,
  );
});
