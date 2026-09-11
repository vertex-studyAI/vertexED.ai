import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/transientSessionIsolation.ts', 'utf8');

test('legacy shared session cleanup uses fail-closed storage helpers', () => {
  assert.match(source, /resolveSessionStorage\(window\)/);
  assert.match(source, /safeStorageRemove\(storage, key\)/);
  assert.doesNotMatch(source, /window\.sessionStorage\.removeItem/);

  for (const key of [
    'vertex_apex_prefill',
    'vertex_mock_review_handoff',
    'vertex_exam_answers',
  ]) {
    assert.match(source, new RegExp(`['"]${key}['"]`));
  }

  assert.match(source, /activeUserId !== undefined && activeUserId !== nextUserId/);
  assert.match(source, /clearLegacySharedSessionHandoffs\(\)/);
});
