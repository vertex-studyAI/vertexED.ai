import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

test('landing trust section describes product objects without unverified affiliation claims', () => {
  assert.match(home, /One connected revision trace/);
  assert.match(home, /what remains provisional/);
  assert.doesNotMatch(home, /institutional sponsorship|institutional endorsement|individual supporters/i);
  assert.doesNotMatch(home, /\b(?:Stanford|MIT|NVIDIA|UPenn|Duke|Meta|Google|Amazon)\b/);
});
