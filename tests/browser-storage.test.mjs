import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '../src/lib/browserStorage.mjs';

test('browser storage helpers fail closed when storage access or operations throw', () => {
  const blockedOwner = {};
  Object.defineProperty(blockedOwner, 'localStorage', {
    get() { throw new Error('blocked'); },
  });
  assert.equal(resolveLocalStorage(blockedOwner), null);

  const throwingStorage = {
    getItem() { throw new Error('blocked read'); },
    setItem() { throw new Error('quota'); },
  };
  assert.equal(safeStorageGet(throwingStorage, 'k'), null);
  assert.equal(safeStorageSet(throwingStorage, 'k', 'v'), false);
  assert.equal(safeStorageSet(null, 'k', 'v'), false);
});

test('browser storage helpers preserve normal read/write behavior', () => {
  const values = new Map();
  const storage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  assert.equal(resolveLocalStorage({ localStorage: storage }), storage);
  assert.equal(safeStorageSet(storage, 'k', 'v'), true);
  assert.equal(safeStorageGet(storage, 'k'), 'v');
});

test('study stats routes browser storage through fail-closed helpers', () => {
  const source = fs.readFileSync(
    fileURLToPath(new URL('../src/lib/studyStats.ts', import.meta.url)),
    'utf8',
  );
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /safeStorageSet/);
  assert.doesNotMatch(source, /window\.localStorage\.(?:getItem|setItem)/);
});
