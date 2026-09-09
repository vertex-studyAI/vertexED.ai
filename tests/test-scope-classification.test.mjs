import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';

import { classifyTestFiles } from '../scripts/run-test-scope.mjs';

test('unrelated research and generated public apps stay outside VertexED', () => {
  for (const path of ['portfolio/research/space-jepa', 'public/neurocad', 'tools/percy-runtime', '.github/workflows/space-jepa-ci.yml']) {
    assert.equal(existsSync(path), false, `${path} must remain outside this product`);
  }
});

test('root test files are reported as canonical VertexED or quarantined cross-project evidence', () => {
  const groups = classifyTestFiles();
  assert.equal(groups.all.length, groups.app.length + groups.quarantine.length);
  assert.ok(groups.app.length > groups.quarantine.length);
  assert.ok(groups.app.includes('auth.test.mjs'));
  assert.ok(groups.app.includes('exam-prep-core.test.mjs'));
  assert.ok(!groups.all.includes('neurocadAlpha.test.mjs'));
  assert.equal(groups.quarantine.length, 0, 'unrelated project tests must not return to the app repository');
  assert.ok(!groups.all.includes('percyRuntime.test.mjs'));
});

test('quarantine classification is stable and does not absorb new VertexED tests by default', () => {
  const groups = classifyTestFiles();
  assert.ok(groups.quarantine.every((file) => !/^(auth|exam-prep|learner-state|waitlist)/i.test(file)));
});
