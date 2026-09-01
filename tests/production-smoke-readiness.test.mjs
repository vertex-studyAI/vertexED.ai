import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const smokeSource = await readFile(new URL('../scripts/smoke-deploy.mjs', import.meta.url), 'utf8');

test('production smoke certifies readiness capabilities and immutable identity', () => {
  assert.match(smokeSource, /\/api\/health\?readiness=1/);
  assert.match(smokeSource, /authentication/);
  assert.match(smokeSource, /waitlist/);
  assert.match(smokeSource, /coreAi/);
  assert.match(smokeSource, /plannerAi/);
  assert.match(smokeSource, /x-vertexed-health/);
  assert.match(smokeSource, /assertExpectedRevision\(readiness/);
});

test('production smoke certifies HEAD health identity', () => {
  assert.match(smokeSource, /method: 'HEAD'/);
  assert.match(smokeSource, /HEAD \/api\/health/);
  assert.match(smokeSource, /x-vertexed-revision/);
  assert.match(smokeSource, /EXPECTED_REVISION/);
});
