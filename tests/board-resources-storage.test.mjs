import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/boardResources.ts', 'utf8');

test('board-guide cache routes browser persistence through fail-closed helpers', () => {
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /safeStorageSet/);
  assert.doesNotMatch(source, /localStorage\.getItem/);
  assert.doesNotMatch(source, /localStorage\.setItem/);
});

test('guide generation remains successful even when optional cache persistence fails', () => {
  assert.match(source, /function writeCache\([^)]*\): boolean \{[\s\S]*safeStorageSet/);
  assert.match(source, /writeCache\([\s\S]*\);\s*return guide;/);
});
