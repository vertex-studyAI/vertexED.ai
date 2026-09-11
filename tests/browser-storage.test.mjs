import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  parseStoredArray,
  parseStoredObject,
  resolveLocalStorage,
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from '../src/lib/browserStorage.mjs';

test('browser storage helpers fail closed when storage access or operations throw', () => {
  const blockedOwner = {};
  Object.defineProperty(blockedOwner, 'localStorage', {
    get() { throw new Error('blocked'); },
  });
  Object.defineProperty(blockedOwner, 'sessionStorage', {
    get() { throw new Error('blocked'); },
  });
  assert.equal(resolveLocalStorage(blockedOwner), null);
  assert.equal(resolveSessionStorage(blockedOwner), null);

  const throwingStorage = {
    getItem() { throw new Error('blocked read'); },
    setItem() { throw new Error('quota'); },
    removeItem() { throw new Error('blocked remove'); },
  };
  assert.equal(safeStorageGet(throwingStorage, 'k'), null);
  assert.equal(safeStorageSet(throwingStorage, 'k', 'v'), false);
  assert.equal(safeStorageRemove(throwingStorage, 'k'), false);
  assert.equal(safeStorageSet(null, 'k', 'v'), false);
  assert.equal(safeStorageRemove(null, 'k'), false);
});

test('browser storage helpers preserve normal read/write/remove behavior', () => {
  const values = new Map();
  const storage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
  assert.equal(resolveLocalStorage({ localStorage: storage }), storage);
  assert.equal(resolveSessionStorage({ sessionStorage: storage }), storage);
  assert.equal(safeStorageSet(storage, 'k', 'v'), true);
  assert.equal(safeStorageGet(storage, 'k'), 'v');
  assert.equal(safeStorageRemove(storage, 'k'), true);
  assert.equal(safeStorageGet(storage, 'k'), null);
});

test('persisted stat arrays reject malformed or object-shaped payloads', () => {
  assert.deepEqual(parseStoredArray(null), []);
  assert.deepEqual(parseStoredArray('{broken'), []);
  assert.deepEqual(parseStoredArray('{}'), []);
  assert.deepEqual(parseStoredArray('"not-an-array"'), []);
  assert.deepEqual(parseStoredArray('[{"completed":true},null]'), [{ completed: true }, null]);
});

test('persisted objects reject malformed, primitive, and array-shaped payloads', () => {
  assert.equal(parseStoredObject(null), null);
  assert.equal(parseStoredObject('{broken'), null);
  assert.equal(parseStoredObject('null'), null);
  assert.equal(parseStoredObject('[]'), null);
  assert.equal(parseStoredObject('"not-an-object"'), null);
  assert.deepEqual(parseStoredObject('{"updatedAt":"2026-09-11T00:00:00.000Z"}'), {
    updatedAt: '2026-09-11T00:00:00.000Z',
  });
});

test('study stats routes browser storage through fail-closed helpers', () => {
  const source = fs.readFileSync(
    fileURLToPath(new URL('../src/lib/studyStats.ts', import.meta.url)),
    'utf8',
  );
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /safeStorageSet/);
  assert.match(source, /parseStoredArray/);
  assert.doesNotMatch(source, /window\.localStorage\.(?:getItem|setItem)/);
});

test('learner deck, weakness, and retry persistence use the fail-closed storage boundary', () => {
  for (const relativePath of [
    '../src/lib/srDeck.ts',
    '../src/lib/weaknessTracker.ts',
    '../src/lib/retryQueue.ts',
  ]) {
    const source = fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
    assert.match(source, /resolveLocalStorage/);
    assert.match(source, /safeStorageSet/);
    assert.doesNotMatch(source, /window\.localStorage\.(?:getItem|setItem)/);
  }

  const retrySource = fs.readFileSync(
    fileURLToPath(new URL('../src/lib/retryQueue.ts', import.meta.url)),
    'utf8',
  );
  assert.match(retrySource, /persist\(next\);[\s\S]*queueLearnerStateWrite\('retry'/);

  const weaknessSource = fs.readFileSync(
    fileURLToPath(new URL('../src/lib/weaknessTracker.ts', import.meta.url)),
    'utf8',
  );
  assert.match(weaknessSource, /writeEntries\(entries\);[\s\S]*scheduleRetry\(/);
  assert.match(weaknessSource, /queueLearnerStateWrite\('weakness'/);
});
