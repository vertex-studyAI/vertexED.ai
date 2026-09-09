import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDbRateLimit } from '../api/_lib/dbRateLimit.js';

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

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
    restoreEnv('SUPABASE_URL', previousUrl);
    restoreEnv('SUPABASE_SERVICE_ROLE_KEY', previousKey);
    restoreEnv('VERCEL_ENV', previousEnv);
  }
});

test('checkDbRateLimit fails closed in production when rate-limit salt is missing', async () => {
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
    const result = await checkDbRateLimit('test-scope', key, 1, 60_000);
    assert.equal(result.allowed, false);
    assert.equal(result.configurationError, true);
  } finally {
    restoreEnv('WAITLIST_RATE_LIMIT_SALT', previousSalt);
    restoreEnv('SUPABASE_URL', previousUrl);
    restoreEnv('SUPABASE_SERVICE_ROLE_KEY', previousKey);
    restoreEnv('VERCEL_ENV', previousEnv);
  }
});

test('checkDbRateLimit fails closed in production when the atomic database check fails', async () => {
  const previousSalt = process.env.WAITLIST_RATE_LIMIT_SALT;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'production';
  process.env.SUPABASE_URL = 'http://127.0.0.1:1';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.WAITLIST_RATE_LIMIT_SALT = 'test-rate-limit-salt';

  try {
    const key = `db-failure-${Date.now()}`;
    const result = await checkDbRateLimit('test-scope', key, 1, 60_000);
    assert.equal(result.allowed, false);
    assert.equal(result.configurationError, true);
  } finally {
    restoreEnv('WAITLIST_RATE_LIMIT_SALT', previousSalt);
    restoreEnv('SUPABASE_URL', previousUrl);
    restoreEnv('SUPABASE_SERVICE_ROLE_KEY', previousKey);
    restoreEnv('VERCEL_ENV', previousEnv);
  }
});

test('database migration makes the rate-limit decision atomic and singleton artifacts unique', async () => {
  const { readFile } = await import('node:fs/promises');
  const migration = await readFile(new URL('../supabase/migrations/20260906103806_atomic_rate_limits_and_singletons.sql', import.meta.url), 'utf8');
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /consume_waitlist_rate_limit/);
  assert.match(migration, /create unique index[\s\S]*user_study_artifacts_singleton_kind_idx/);
  assert.match(migration, /where kind in \('planner', 'notebook'\)/);
  assert.match(migration, /Duplicate planner\/notebook artifacts require manual reconciliation/);
  assert.doesNotMatch(migration, /delete from public\.user_study_artifacts/);
});
