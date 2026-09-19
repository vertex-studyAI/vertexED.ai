import assert from 'node:assert/strict';
import test from 'node:test';

import { readMypPracticeProgress, saveMypPracticeProgress } from '../src/lib/mypPracticeProgress.mjs';
import { userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
  };
}

function host() {
  return { localStorage: memoryStorage(), sessionStorage: memoryStorage() };
}

test('practice review progress is account scoped and stores a deterministic retry date', () => {
  const browser = host();
  const result = saveMypPracticeProgress(browser, 'account-a', 'question-1', {
    confidence: 'developing',
    checkedCriteria: ['Evidence used', 'Conclusion answers the task'],
    retryDays: 3,
  }, new Date('2026-09-14T10:00:00.000Z'));

  assert.equal(result.saved, true);
  assert.equal(result.progress.retryAt, '2026-09-17T10:00:00.000Z');
  assert.deepEqual(readMypPracticeProgress(browser, 'account-a', 'question-1'), result.progress);
  assert.equal(readMypPracticeProgress(browser, 'account-b', 'question-1'), null);
  assert.equal(readMypPracticeProgress(browser, null, 'question-1'), null);
});

test('signed-out progress is session-only and invalid records fail closed', () => {
  const browser = host();
  assert.equal(saveMypPracticeProgress(browser, null, 'question-2', {
    confidence: 'secure', checkedCriteria: ['Method shown'], retryDays: 7,
  }, new Date('2026-09-14T00:00:00.000Z')).saved, true);
  assert.equal(readMypPracticeProgress(browser, null, 'question-2').confidence, 'secure');
  assert.equal(browser.localStorage.getItem(userContentStorageKeys(null).mypPracticeProgress), null);

  for (const invalid of [
    { confidence: 'perfect', checkedCriteria: [], retryDays: 3 },
    { confidence: 'developing', checkedCriteria: 'not-an-array', retryDays: 3 },
    { confidence: 'developing', checkedCriteria: [], retryDays: 365 },
  ]) assert.equal(saveMypPracticeProgress(browser, null, 'bad', invalid).saved, false);
});

test('corrupt storage is ignored and write failures are explicit', () => {
  const browser = host();
  browser.localStorage.setItem(userContentStorageKeys('account-a').mypPracticeProgress, '{broken');
  assert.equal(readMypPracticeProgress(browser, 'account-a', 'question-1'), null);
  browser.localStorage.setItem = () => { throw new Error('quota'); };
  assert.equal(saveMypPracticeProgress(browser, 'account-a', 'question-1', {
    confidence: 'not-yet', checkedCriteria: [], retryDays: 1,
  }).saved, false);
});
