import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('learner-state GET only echoes curated TypeError copy', () => {
  const source = fs.readFileSync('api/_handlers/learner-state.js', 'utf8');
  assert.match(source, /Invalid learner-state cursor/);
  assert.match(source, /Invalid learner-state request\./);
  assert.doesNotMatch(
    source,
    /catch \(error\) \{ if \(error instanceof TypeError\) return res\.status\(400\)\.json\(\{ error: error\.message \}\); throw error; \}/,
  );
});
