import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../', import.meta.url);

function at(path) {
  return new URL(path, root);
}

test('production output contains loadable JavaScript and CSS assets', async () => {
  const html = await readFile(at('dist/index.html'), 'utf8');

  assert.doesNotMatch(html, /\/src\/main\.tsx/);
  assert.match(html, /<div[^>]+id=["']root["']/);

  const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)]
    .map((match) => match[1])
    .filter((path) => !/^https?:\/\//.test(path));

  assert.ok(assetPaths.some((path) => path.endsWith('.js')), 'built HTML must reference JavaScript');
  assert.ok(assetPaths.some((path) => path.endsWith('.css')), 'built HTML must reference CSS');

  for (const assetPath of assetPaths) {
    const normalized = assetPath.replace(/^\//, '');
    await access(at(`dist/${normalized}`));
    const file = await stat(at(`dist/${normalized}`));
    assert.ok(file.size > 0, `${assetPath} must not be empty`);
  }
});

test('production HTML preserves core metadata', async () => {
  const html = await readFile(at('dist/index.html'), 'utf8');
  assert.match(html, /<title>[^<]*FinanceMeta[^<]*<\/title>/i);
  assert.match(html, /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i);
  assert.match(html, /<meta[^>]+name=["']viewport["']/i);
});
