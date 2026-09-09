import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const vercelPath = new URL('../vercel.json', import.meta.url);

test('Vercel Git deployment policy only suppresses nondeploying research branches', async () => {
  const config = JSON.parse(await fs.readFile(vercelPath, 'utf8'));
  const policy = config.git?.deploymentEnabled;

  assert.equal(typeof policy, 'object');
  assert.equal(policy['research/**'], false);
  assert.equal(policy['paper/**'], false);
  assert.notEqual(policy.main, false);
  assert.notEqual(policy['*'], false);
  assert.notEqual(policy['**'], false);
});
