import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReviewDraft } from '../src/lib/reviewDraft.mjs';
import { userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

test('review drafts recover known text fields and reject malformed field values', () => {
  const defaults = { question: '', answer: '', additional: '', strictness: '5' };
  for (const value of [null, 9, 'invalid', []]) assert.deepEqual(normalizeReviewDraft(value, defaults), defaults);
  assert.deepEqual(normalizeReviewDraft({ question: 'Impulse?', answer: 'Working', additional: {}, strictness: 7, injected: true }, defaults), {
    question: 'Impulse?', answer: 'Working', additional: '', strictness: '5',
  });
});

test('review draft and evidence-source keys remain inside the account export and deletion prefix', () => {
  for (const key of ['answerReviewDraft', 'answerReviewSource']) {
    assert.notEqual(userContentStorageKeys('alice')[key], userContentStorageKeys('bob')[key]);
    assert.match(userContentStorageKeys('alice')[key], /^vertex_content:alice:/);
    assert.notEqual(userContentStorageKeys('alice')[key], userContentStorageKeys(null)[key]);
  }
});
