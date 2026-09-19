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
  assert.match(packageJson.scripts.prebuild, /node scripts\/generate-build-revision\.mjs/);
});

test('Vercel publishes the directory produced by Vite', () => {
  assert.equal(vercelConfig.outputDirectory, 'dist');
});

test('host canonicalization redirects never swallow /api health or route traffic', () => {
  const redirects = vercelConfig.redirects ?? [];
  assert.ok(Array.isArray(redirects) && redirects.length >= 1);

  for (const rule of redirects) {
    const hosts = (rule.has ?? [])
      .filter((entry) => entry.type === 'host')
      .map((entry) => entry.value);
    if (hosts.length === 0) continue;

    // Preview and apex host redirects must keep API reachable on the origin host
    // when the custom-domain TLS path is unhealthy (see issue #44).
    assert.match(
      String(rule.source),
      /\(\?!api/,
      `redirect for host(s) ${hosts.join(', ')} must exclude /api paths; got source=${rule.source}`,
    );
    assert.doesNotMatch(
      String(rule.source),
      /^\/:path\*$/,
      `catch-all /:path* host redirect would force /api onto www.vertexed.app`,
    );
  }
});
