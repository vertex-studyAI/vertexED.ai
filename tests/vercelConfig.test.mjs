import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const vercelConfig = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
);

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

test('Vercel install phase only installs dependencies', () => {
  assert.equal(vercelConfig.installCommand, 'npm ci');
  assert.doesNotMatch(vercelConfig.installCommand, /generate-build-revision/);
  assert.doesNotMatch(vercelConfig.installCommand, /VERTEXED_REQUIRE_BUILD_REVISION/);
});

test('Vercel build remains fail-closed on immutable revision identity', () => {
  assert.match(vercelConfig.buildCommand, /VERTEXED_REQUIRE_BUILD_REVISION=1/);
  assert.match(vercelConfig.buildCommand, /npm run build/);
  assert.match(packageJson.scripts.prebuild, /generate-build-revision\.mjs/);
});
