import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts/check-public-boundary.mjs');

test('public-boundary probe prints Gate 1 diagnostics for app host', () => {
  const result = spawnSync(process.execPath, [script, '--base', 'https://vertex-ed-ai.vercel.app'], {
    encoding: 'utf8',
    timeout: 45000,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /host: vertex-ed-ai\.vercel\.app/);
  assert.match(result.stdout, /shallow_health:/);
  assert.match(result.stdout, /deep_readiness:/);
  assert.match(result.stdout, /next:/);
});
