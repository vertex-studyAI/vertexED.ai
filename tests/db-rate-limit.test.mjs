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

test('checkDbRateLimit falls back in-memory when rate-limit salt is missing in production', async () => {
  const previousSalt = process.env.WAITLIST_RATE_LIMIT_SALT;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'production';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  delete process.env.WAITLIST_RATE_LIMIT_SALT;

  try {
    const key = `saltless-${Date.now()}`;
    const result = await checkDbRateLimit('test-scope', key, 5, 60_000);
    assert.equal(result.allowed, true);
  } finally {
    if (previousSalt) process.env.WAITLIST_RATE_LIMIT_SALT = previousSalt;
    else delete process.env.WAITLIST_RATE_LIMIT_SALT;
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    else delete process.env.SUPABASE_URL;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (previousEnv) process.env.VERCEL_ENV = previousEnv;
    else delete process.env.VERCEL_ENV;
  }
});
