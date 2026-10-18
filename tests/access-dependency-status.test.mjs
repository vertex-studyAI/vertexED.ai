import assert from 'node:assert/strict';
import test from 'node:test';
import signup from '../api/_handlers/signup-invite.js';
import waitlist from '../api/_handlers/waitlist.js';
import { verifyAuthUser } from '../api/_lib/auth.js';
import { createMocks } from './helpers/mock-http.mjs';

function environment(t, overrides = {}) {
  const env = { NODE_ENV: 'production', VERCEL_ENV: 'production', SUPABASE_URL: 'https://access-dependency.supabase.co',
    VITE_SUPABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: '', SUPABASE_ANON_KEY: 'test-public-key',
    VITE_SUPABASE_PUBLISHABLE_KEY: '', VITE_SUPABASE_ANON_KEY: '', SUPABASE_SECRET_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: 'test-server-key', WAITLIST_RATE_LIMIT_SALT: 'test-salt', ...overrides };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
}

test('signup distinguishes unavailable durable limiter from a real rate limit', async t => {
  for (const outage of [true, false]) await t.test(outage ? 'outage' : 'cooldown', async st => {
    environment(st);
    const calls = [];
    st.mock.method(globalThis, 'fetch', async input => {
      const url = new URL(String(input)); calls.push(url.pathname);
      assert.ok(url.pathname.endsWith('/rpc/consume_waitlist_rate_limit'));
      return outage ? Response.json({ message: 'Fixture unavailable' }, { status: 503 })
        : Response.json({ allowed: false, retry_after_sec: 75 });
    });
    const request = createMocks({ method: 'POST', body: { action: 'validateInvite', waitlistInviteToken: 'fixture-token' } });
    await signup(request.req, request.res);
    assert.equal(request.getStatus(), outage ? 503 : 429);
    assert.equal(request.getHeaders()['Retry-After'], outage ? '30' : '75');
    assert.equal(request.getJson().retryAfter, outage ? 30 : 75);
    assert.equal(calls.length, 1, 'no identity or invite work after limiter denial');
  });
});

test('missing waitlist backend is temporary unavailability', async t => {
  environment(t, { SUPABASE_SERVICE_ROLE_KEY: '' });
  t.mock.method(globalThis, 'fetch', async () => assert.fail('unconfigured backend must not be called'));
  const request = createMocks({ method: 'POST', body: { email: 'fixture@example.test' } });
  await waitlist(request.req, request.res);
  assert.equal(request.getStatus(), 503);
});

test('malformed Auth configuration is temporary unavailability, not an invalid session', async t => {
  environment(t, { SUPABASE_URL: 'not-a-url' });
  const request = createMocks({ headers: { authorization: 'Bearer fixture' } });
  assert.equal(await verifyAuthUser(request.req, request.res), null);
  assert.equal(request.getStatus(), 503);
  assert.equal(request.getJson().code, 'AUTH_UNAVAILABLE');
});
