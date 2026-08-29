import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, rateLimitUserEndpoint } from '../api/_lib/rateLimit.js';

function withEnv(overrides, fn) {
  const original = {};
  for (const [key, value] of Object.entries(overrides)) {
    original[key] = process.env[key];
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(original)) {
        if (value == null) delete process.env[key];
        else process.env[key] = value;
      }
    });
}

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

test('production fails closed when durable rate-limit storage is not configured', async () => {
  await withEnv(
    {
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      SUPABASE_URL: null,
      SUPABASE_SERVICE_ROLE_KEY: null,
    },
    async () => {
      const result = await checkRateLimit(`prod-${Date.now()}`, 60, 60_000);
      assert.equal(result.allowed, false);
      assert.equal(result.configurationError, true);
      assert.equal(result.retryAfterSec, 60);
    },
  );
});

test('production endpoint returns 503 instead of silently using process-local buckets', async () => {
  await withEnv(
    {
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      SUPABASE_URL: null,
      SUPABASE_SERVICE_ROLE_KEY: null,
    },
    async () => {
      const response = {
        statusCode: null,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(body) {
          this.body = body;
          return this;
        },
      };

      const allowed = await rateLimitUserEndpoint('user-1', '/api/test', response);
      assert.equal(allowed, false);
      assert.equal(response.statusCode, 503);
      assert.deepEqual(response.body, {
        error: 'Rate limiting is temporarily unavailable. Try again later.',
      });
    },
  );
});
