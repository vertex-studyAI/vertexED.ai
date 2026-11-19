import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { logicalChunkName, measureRouteChunks } from '../scripts/check-route-bundle-deltas.mjs';

test('logical route chunk names discard only the final content hash', () => {
  assert.equal(logicalChunkName('StudyNotebook-D2mfANAt.js'), 'StudyNotebook');
  assert.equal(logicalChunkName('not-a-route.js'), null);
});

test('route bundle deltas fail for missing and oversized critical chunks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-route-budgets-'));
  const assets = join(root, 'assets');
  await mkdir(assets);
  await writeFile(join(assets, 'Main-abcdefgh.js'), 'export default 1;');
  const base = { version: 1, baselineSourceSha: 'abc', maxGrowthBytes: 0, routes: { Main: 1, Missing: 1 } };
  const result = await measureRouteChunks({ distDir: root, config: base });
  assert.equal(result.routes.find((route) => route.name === 'Missing').status, 'MISSING');
  assert.equal(result.routes.find((route) => route.name === 'Main').status, 'OVER_BUDGET');
  assert.equal(result.violations.length, 2);
});
