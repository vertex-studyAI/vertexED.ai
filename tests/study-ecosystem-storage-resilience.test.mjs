import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { parseStoredArray } from '../src/lib/browserStorage.mjs';

const source = fs.readFileSync('src/lib/studyEcosystem.ts', 'utf8');

test('ecosystem storage reads fail closed for malformed roots', () => {
  assert.deepEqual(parseStoredArray(null), []);
  assert.deepEqual(parseStoredArray('{"task":"not-an-array"}'), []);
  assert.deepEqual(parseStoredArray('null'), []);
  assert.deepEqual(parseStoredArray('not-json'), []);
  assert.deepEqual(parseStoredArray('[{"id":"ok"}]'), [{ id: 'ok' }]);
});

test('ecosystem consumers use the shared safe storage boundary', () => {
  assert.match(source, /parseStoredArray/);
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /readStoredArray\(plannerStorageKeys\(\)\.tasks\)/);
  assert.match(source, /readStoredArray\(activity\)/);
  assert.doesNotMatch(source, /window\.localStorage\.getItem/);
});

test('ecosystem filters malformed planner and activity records before use', () => {
  assert.match(source, /\.filter\(isRecord\)/);
  assert.match(source, /typeof task\.id === 'string'/);
  assert.match(source, /\.filter\(isActivityEntry\)/);
  assert.match(source, /typeof value\.message === 'string'/);
  assert.match(source, /Number\.isFinite\(Date\.parse\(value\.createdAt\)\)/);
});
