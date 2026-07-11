import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDbRateLimit } from '../api/_lib/dbRateLimit.js';

test('checkDbRateLimit uses in-memory fallback when Supabase is not configured', async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousEnv = process.env.VERCEL_ENV;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.VERCEL_ENV;

  try {
    const key = `fallback-${Date.now()}`;
    const first = await checkDbRateLimit('test-scope', key, 2, 60_000);
    const second = await checkDbRateLimit('test-scope', key, 2, 60_000);
    const third = await checkDbRateLimit('test-scope', key, 2, 60_000);
    assert.equal(first.allowed, true);
    assert.equal(second.allowed, true);
    assert.equal(third.allowed, false);
  } finally {
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    else delete process.env.SUPABASE_URL;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (previousEnv) process.env.VERCEL_ENV = previousEnv;
    else delete process.env.VERCEL_ENV;
  }
});
