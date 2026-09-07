import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyTestFiles } from '../scripts/run-test-scope.mjs';

test('root test files are reported as canonical VertexED or quarantined cross-project evidence', () => {
  const groups = classifyTestFiles();
  assert.equal(groups.all.length, groups.app.length + groups.quarantine.length);
  assert.ok(groups.app.length > groups.quarantine.length);
  assert.ok(groups.app.includes('auth.test.mjs'));
  assert.ok(groups.app.includes('exam-prep-core.test.mjs'));
  assert.ok(groups.quarantine.includes('neurocadAlpha.test.mjs'));
  assert.ok(groups.quarantine.includes('project2424CanonicalIdentity.test.mjs'));
  assert.ok(groups.quarantine.includes('percyRuntime.test.mjs'));
});

test('quarantine classification is stable and does not absorb new VertexED tests by default', () => {
  const groups = classifyTestFiles();
  assert.ok(groups.quarantine.every((file) => !/^(auth|exam-prep|learner-state|waitlist)/i.test(file)));
});
