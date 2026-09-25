import assert from 'node:assert/strict';
import test from 'node:test';
import { readSearchHistory, rememberSearch, searchHistoryKey } from '../src/lib/searchHistory.mjs';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';

function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key), key: index => [...data.keys()][index], get length() { return data.size; } };
}

test('history survives reread, deduplicates and never leaks between accounts or guest mode', () => {
  const db = storage();
  rememberSearch(db, 'a', 'Physics');
  rememberSearch(db, 'a', 'physics');
  assert.deepEqual(readSearchHistory(db, 'a'), ['physics']);
  assert.deepEqual(readSearchHistory(db, 'b'), []);
  assert.deepEqual(readSearchHistory(db, null), []);
  for (let i = 0; i < 12; i++) rememberSearch(db, 'a', `topic ${i}`);
  assert.equal(readSearchHistory(db, 'a').length, 8);
});

test('malformed and unavailable storage cannot break search', () => {
  const db = storage();
  db.setItem(searchHistoryKey('a'), '{damaged');
  assert.deepEqual(readSearchHistory(db, 'a'), []);
  assert.equal(rememberSearch(null, 'a', 'forces').saved, false);
  assert.deepEqual(readSearchHistory({ getItem() { throw Error('blocked'); } }, 'a'), []);
});

test('account export and deletion include search history and preserve another account', () => {
  const db = storage();
  rememberSearch(db, 'a', 'my notes');
  rememberSearch(db, 'b', 'other notes');
  assert.deepEqual(collectAccountStorage(db, 'a')[searchHistoryKey('a')], ['my notes']);
  clearAccountStorage(db, 'a');
  assert.deepEqual(readSearchHistory(db, 'a'), []);
  assert.deepEqual(readSearchHistory(db, 'b'), ['other notes']);
});
