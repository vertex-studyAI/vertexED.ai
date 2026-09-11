import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/portalFeatures.ts', 'utf8');

test('portal state uses the fail-closed browser storage boundary', () => {
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /safeStorageSet/);
  assert.match(source, /parseStoredArray/);
  assert.doesNotMatch(source, /localStorage\.getItem/);
  assert.doesNotMatch(source, /localStorage\.setItem/);
});

test('portal activity and exam-night state discard malformed persisted rows', () => {
  assert.match(source, /typeof \(entry as \{ createdAt\?: unknown \}\)\.createdAt === 'string'/);
  assert.match(source, /parsed\.filter\(\(item\): item is string => typeof item === 'string'\)/);
});

test('confidence state rejects malformed roots and invalid ratings', () => {
  assert.match(source, /typeof parsed !== 'object' \|\| parsed === null \|\| Array\.isArray\(parsed\)/);
  assert.match(source, /candidate\.subject === subject/);
  assert.match(source, /Number\.isInteger\(candidate\.rating\)/);
  assert.match(source, /candidate\.rating \?\? 0/);
});
