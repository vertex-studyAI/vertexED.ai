import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readVercelConfig() {
  return JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
}

test('Vercel stamps immutable revision before serverless function tracing', async () => {
  const config = await readVercelConfig();
  assert.match(
    config.installCommand,
    /VERTEXED_REQUIRE_BUILD_REVISION=1 node scripts\/generate-build-revision\.mjs/,
  );
});

test('catch-all function retains schema-valid includeFiles configuration', async () => {
  const config = await readVercelConfig();
  const fn = config.functions?.['api/[[...path]].js'];
  assert.ok(fn);
  assert.equal(typeof fn.includeFiles, 'string');
  assert.equal(fn.includeFiles, 'public/study-guides/myp/**');
});

test('health handler directly imports generated revision for function tracing', async () => {
  const source = await readFile(new URL('../api/_handlers/health.js', import.meta.url), 'utf8');
  assert.match(source, /import\s*\{\s*BUILD_REVISION\s*\}\s*from\s*['"]\.\.\/_generated\/build-revision\.js['"]/);
});
