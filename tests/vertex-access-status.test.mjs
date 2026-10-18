import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/_handlers/waitlist-status.js';
import { verifyAuthUser } from '../api/_lib/auth.js';
import { getVertexAccess } from '../api/_lib/vertexAccess.js';
import { createMocks } from './helpers/mock-http.mjs';

function setup(t, { status = 'approved', verified = true, outage = false, limiterOutage = false } = {}) {
  const env = { SUPABASE_URL: 'https://access-status.supabase.co', SUPABASE_ANON_KEY: 'test-public-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-server-key', WAITLIST_RATE_LIMIT_SALT: 'test-salt', ADMIN_EMAILS: 'member@example.test', NODE_ENV: 'production' };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (input, options = {}) => {
    const url = new URL(String(input));
    calls.push({ path: url.pathname, method: options.method ?? 'GET' });
    if (url.pathname === '/auth/v1/user') return Response.json({ id: 'user-a', email: 'member@example.test',
      email_confirmed_at: verified ? '2026-10-16T00:00:00.000Z' : null });
    if (url.pathname.endsWith('/rpc/consume_waitlist_rate_limit')) return limiterOutage
      ? Response.json({ message: 'Fixture unavailable' }, { status: 503 }) : Response.json({ allowed: true });
    if (url.pathname === '/rest/v1/waitlist') return outage
      ? Response.json({ message: 'Fixture unavailable' }, { status: 503 })
      : Response.json(status === 'unregistered' ? [] : [{ id: 'row-a', auth_user_id: 'user-a', status, signup_method: 'email' }]);
    assert.fail(`Unexpected request ${url.pathname}`);
  });
  return calls;
}

test('access status handler distinguishes membership, verification and dependency failures', async t => {
  for (const scenario of [
    { status: 'approved', expected: 200, access: true },
    { status: 'pending', expected: 200, access: false },
    { status: 'rejected', expected: 200, access: false },
    { status: 'revoked', expected: 200, access: false },
    { status: 'unregistered', expected: 200, access: false },
    { verified: false, expected: 200, access: false, status: 'verification_required' },
    { outage: true, expected: 503, access: false, status: 'unavailable' },
  ]) {
    await t.test(scenario.status, async st => {
      const calls = setup(st, scenario);
      const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: 'GET', headers: { authorization: 'Bearer test-token' } });
      await handler(req, res);
      assert.equal(getStatus(), scenario.expected);
      assert.equal(getJson().status, scenario.status);
      assert.equal(getJson().access, scenario.access);
      assert.equal(getHeaders()['Cache-Control'], 'private, no-store');
      if (scenario.verified === false) assert.equal(calls.some(call => call.path === '/rest/v1/waitlist'), false);
      if (scenario.outage) assert.equal(getHeaders()['Retry-After'], '30');
    });
  }
});

test('access status remains private when authentication or durable limiter fails', async t => {
  setup(t, { limiterOutage: true });
  const anonymous = createMocks({ method: 'GET' });
  await handler(anonymous.req, anonymous.res);
  assert.equal(anonymous.getStatus(), 401);
  assert.equal(anonymous.getHeaders()['Cache-Control'], 'private, no-store');
  const request = createMocks({ method: 'GET', headers: { authorization: 'Bearer test-token' } });
  await handler(request.req, request.res);
  assert.equal(request.getStatus(), 503);
  assert.equal(request.getHeaders()['Cache-Control'], 'private, no-store');
});

test('verified identity is shared only inside one request and is never trusted from request properties', async t => {
  const calls = setup(t);
  const request = createMocks({ headers: { authorization: 'Bearer one' } });
  request.req.user = { id: 'forged-user' };
  const first = await verifyAuthUser(request.req, request.res);
  const second = await verifyAuthUser(request.req, request.res);
  assert.equal(first.id, 'user-a');
  assert.equal(first, second);
  assert.equal(calls.length, 1);
  request.req.headers.authorization = 'Bearer two';
  await verifyAuthUser(request.req, request.res);
  assert.equal(calls.length, 2);
  const nextRequest = createMocks({ headers: { authorization: 'Bearer two' } });
  await verifyAuthUser(nextRequest.req, nextRequest.res);
  assert.equal(calls.length, 3);
});

test('unknown membership states and cross-owner rows are not approval', async () => {
  const user = { id: 'user-a', email: 'member@example.test', email_confirmed_at: '2026-10-16T00:00:00.000Z' };
  for (const entry of [{ auth_user_id: 'user-a', status: 'unexpected' }, { auth_user_id: 'user-b', status: 'approved' }]) {
    const client = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: entry }) }) }) }) };
    await assert.rejects(() => getVertexAccess(user, client), /Invalid VertexED membership/);
  }
});
