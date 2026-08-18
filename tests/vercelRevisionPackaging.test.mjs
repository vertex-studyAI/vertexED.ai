import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readVercelConfig() {
  const raw = await readFile(new URL('../vercel.json', import.meta.url), 'utf8');
  return JSON.parse(raw);
}

test('Vercel stamps immutable revision before serverless function packaging', async () => {
  const config = await readVercelConfig();
  assert.match(
    config.installCommand,
    /VERTEXED_REQUIRE_BUILD_REVISION=1 node scripts\/generate-build-revision\.mjs/,
  );
});

test('Vercel catch-all function keeps schema-valid includeFiles configuration', async () => {
  const config = await readVercelConfig();
  const fn = config.functions?.['api/[[...path]].js'];
  assert.ok(fn, 'catch-all Vercel function config must exist');
  assert.equal(typeof fn.includeFiles, 'string');
  assert.equal(fn.includeFiles, 'public/study-guides/myp/**');
});
