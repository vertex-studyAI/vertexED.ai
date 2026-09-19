import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeRevisionStackScore,
  readRevisionStackHighScore,
  saveRevisionStackHighScore,
} from '../src/lib/revisionStackScore.mjs';

function storageOwner(entries = []) {
  const values = new Map(entries);
  return {
    values,
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  };
}

test('Revision Stack scores reject malformed and impossible persisted values', () => {
  assert.equal(normalizeRevisionStackScore('400'), 400);
  assert.equal(normalizeRevisionStackScore('401'), 0);
  assert.equal(normalizeRevisionStackScore(-100), 0);
  assert.equal(normalizeRevisionStackScore('not-a-score'), 0);
  assert.equal(normalizeRevisionStackScore(10_000_000), 0);
});

test('Revision Stack keeps independent account and signed-out best scores', () => {
  const owner = storageOwner();
  assert.deepEqual(saveRevisionStackHighScore(owner, 'learner-a', 300), { score: 300, saved: true });
  assert.deepEqual(saveRevisionStackHighScore(owner, 'learner-a', 100), { score: 300, saved: true });
  assert.deepEqual(saveRevisionStackHighScore(owner, 'learner-b', 500), { score: 500, saved: true });
  assert.deepEqual(saveRevisionStackHighScore(owner, null, 200), { score: 200, saved: true });
  assert.equal(readRevisionStackHighScore(owner, 'learner-a'), 300);
  assert.equal(readRevisionStackHighScore(owner, 'learner-b'), 500);
  assert.equal(readRevisionStackHighScore(owner, null), 200);
});

test('blocked storage returns a safe zero without claiming persistence', () => {
  const owner = { get localStorage() { throw new Error('blocked'); } };
  assert.equal(readRevisionStackHighScore(owner, 'learner-a'), 0);
  assert.deepEqual(saveRevisionStackHighScore(owner, 'learner-a', 100), { score: 0, saved: false });
});
