import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/_handlers/waitlist.js';
import { createMocks } from './helpers/mock-http.mjs';

test('waitlist stores a normalized private profile without creating an auth account', async () => {
  const keys = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'WAITLIST_RATE_LIMIT_SALT'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const previousFetch = global.fetch;
  process.env.SUPABASE_URL = 'https://profile-storage.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-service-key';
  process.env.WAITLIST_RATE_LIMIT_SALT = 'test-only-salt';
  let stored;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push(path);
    let result;
    if (path.endsWith('/rpc/consume_waitlist_rate_limit')) result = { allowed: true };
    else if (path.endsWith('/rpc/auth_email_exists')) result = false;
    else if (path === '/rest/v1/schools') result = options.method === 'POST' ? null : { id: 'test-school-id' };
    else if (path === '/rest/v1/waitlist' && options.method === 'POST') { stored = JSON.parse(options.body); result = null; }
    else if (path === '/rest/v1/waitlist') result = null;
    else throw new Error(`Unexpected request ${path}`);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const { req, res, getStatus } = createMocks({ method: 'POST', body: { email: 'student@example.test', profile: { school: ' Example School ', country: 'India', curriculum: 'IB MYP', grade: 'MYP 5', age: 15, consent: true, extra: 'discard' } } });
    await handler(req, res);
    assert.equal(getStatus(), 200);
    assert.equal(stored.application_profile.school, 'Example School');
    assert.equal(stored.application_profile.extra, undefined);
    assert.equal(stored.auth_user_id, null);
    assert.equal(stored.school_id, 'test-school-id');
    assert.equal(stored.status, 'pending');
    assert.ok(Number.isFinite(Date.parse(stored.profile_collected_at)));
    assert.ok(calls.every(path => !path.startsWith('/auth/')));
  } finally {
    global.fetch = previousFetch;
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});
