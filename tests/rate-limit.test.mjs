import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../api/_lib/rateLimit.js';

test('checkRateLimit allows requests under the limit', async () => {
  const key = `test-${Date.now()}-allow`;
  const first = await checkRateLimit(key, 3, 60_000);
  const second = await checkRateLimit(key, 3, 60_000);
  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
});

test('checkRateLimit blocks requests over the limit', async () => {
  const key = `test-${Date.now()}-block`;
  await checkRateLimit(key, 2, 60_000);
  await checkRateLimit(key, 2, 60_000);
  const third = await checkRateLimit(key, 2, 60_000);
  assert.equal(third.allowed, false);
  assert.ok(third.retryAfterSec > 0);
});

test('checkRateLimit isolates keys', async () => {
  const keyA = `test-${Date.now()}-a`;
  const keyB = `test-${Date.now()}-b`;
  await checkRateLimit(keyA, 1, 60_000);
  const blockedA = await checkRateLimit(keyA, 1, 60_000);
  const allowedB = await checkRateLimit(keyB, 1, 60_000);
  assert.equal(blockedA.allowed, false);
  assert.equal(allowedB.allowed, true);
});
