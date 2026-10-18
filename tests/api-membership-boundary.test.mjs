import assert from 'node:assert/strict';
import test from 'node:test';
import { dispatchRoute, ROUTES } from '../api/_lib/routes.js';
import { createMocks } from './helpers/mock-http.mjs';

const PUBLIC_ROUTES = ['health', 'signup-invite', 'telemetry', 'waitlist'];
const ACCOUNT_ROUTES = ['account', 'account-export', 'ai-usage', 'admin-status', 'waitlist-status'];
const MEMBER_ROUTES = Object.keys(ROUTES).filter(key => !PUBLIC_ROUTES.includes(key) && !ACCOUNT_ROUTES.includes(key));
const VERIFIED_AT = '2026-10-16T00:00:00.000Z';

function fixture(t, { status = 'approved', identity = '11111111-1111-4111-8111-111111111111', verified = true, authFailure, membershipFailure = false, admin = false } = {}) {
  for (const [key, value] of Object.entries({
    SUPABASE_URL: 'https://membership-boundary.supabase.co',
    SUPABASE_ANON_KEY: 'test-public-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-server-key',
    ADMIN_EMAILS: admin ? `${identity}@example.test` : '',
  })) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (input, options = {}) => {
    const url = new URL(String(input));
    calls.push({ path: url.pathname, query: url.searchParams, method: options.method ?? 'GET' });
    if (url.pathname === '/auth/v1/user') {
      if (authFailure) return Response.json({ message: 'Fixture auth failure' }, { status: authFailure });
      return Response.json({ id: identity, email: `${identity}@example.test`, email_confirmed_at: verified ? VERIFIED_AT : null,
        user_metadata: { approved: true, admin: true, vertexed_access: true } });
    }
    if (url.pathname === '/rest/v1/waitlist') {
      assert.equal(options.method ?? 'GET', 'GET', 'denied identities must not mutate membership');
      if (membershipFailure) return Response.json({ message: 'Fixture dependency unavailable', code: '42P01' }, { status: 503 });
      const currentStatus = typeof status === 'function' ? status() : status;
      const data = currentStatus === 'unregistered' ? [] : [{ id: 'wait-1', auth_user_id: identity, status: currentStatus, signup_method: 'email' }];
      return Response.json(data);
    }
    assert.fail(`Unexpected protected store or provider request: ${url.pathname}`);
  });
  return calls;
}

test('every registered endpoint declares an explicit access policy', () => {
  for (const [key, route] of Object.entries(ROUTES)) {
    const expected = PUBLIC_ROUTES.includes(key) ? 'public' : ACCOUNT_ROUTES.includes(key) ? 'account' : key === 'waitlist-admin' ? 'admin' : 'member';
    assert.equal(route.access, expected, key);
  }
});

test('pending identity cannot load any product handler or reach its providers/stores', async t => {
  const calls = fixture(t, { status: 'pending' });
  for (const key of MEMBER_ROUTES) {
    let loaded = false;
    const original = ROUTES[key].loader;
    ROUTES[key].loader = async () => { loaded = true; return { default: (_req, res) => res.status(200).json({ forbidden: true }) }; };
    try {
      const { req, res, getStatus, getJson } = createMocks({ method: ROUTES[key].methods[0], headers: { 'idempotency-key': 'membership-fixture-operation', authorization: 'Bearer pending' } });
      await dispatchRoute(key, req, res);
      assert.equal(getStatus(), 403, key);
      assert.equal(getJson().status, 'pending', key);
      assert.equal(loaded, false, `${key} loaded before membership denial`);
    } finally { ROUTES[key].loader = original; }
  }
  assert.ok(calls.every(call => ['/auth/v1/user', '/rest/v1/waitlist'].includes(call.path)));
});

test('all product endpoints fail closed for the direct-access identity and dependency matrix', async t => {
  const cases = [
    { name: 'anonymous', token: false, expected: 401 },
    { name: 'invalid token', authFailure: 401, expected: 401 },
    { name: 'unverified email', verified: false, expected: 403, accessStatus: 'verification_required' },
    { name: 'revoked', status: 'revoked', expected: 403, accessStatus: 'revoked' },
    { name: 'rejected', status: 'rejected', expected: 403, accessStatus: 'rejected' },
    { name: 'FinanceMeta-only identity', identity: 'financemeta-only', status: 'unregistered', expected: 403, accessStatus: 'unregistered' },
    { name: 'auth outage', authFailure: 503, expected: 503 },
    { name: 'membership outage', membershipFailure: true, expected: 503, accessStatus: 'unavailable' },
    { name: 'server admin without membership', admin: true, status: 'unregistered', expected: 403, accessStatus: 'unregistered' },
  ];
  for (const scenario of cases) {
    await t.test(scenario.name, async st => {
      const calls = fixture(st, scenario);
      for (const key of MEMBER_ROUTES) {
        st.mock.method(ROUTES[key], 'loader', async () => { assert.fail(`${key} handler loaded for ${scenario.name}`); });
        const { req, res, getStatus, getJson, getHeaders } = createMocks({ method: ROUTES[key].methods[0],
          headers: scenario.token === false ? {} : { authorization: `Bearer ${scenario.name}` } });
        await dispatchRoute(key, req, res);
        assert.equal(getStatus(), scenario.expected, key);
        if (scenario.accessStatus) assert.equal(getJson().status, scenario.accessStatus, key);
        assert.equal(getHeaders()['Cache-Control'], 'private, no-store', key);
      }
      if (scenario.token === false) assert.equal(calls.length, 0);
      if (scenario.verified === false || scenario.authFailure) assert.ok(calls.every(call => call.path === '/auth/v1/user'));
    });
  }
});

test('approved A/B accounts reach product handlers under their verified identity; admin permission is additive', async t => {
  for (const identity of ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222']) {
    await t.test(identity, async st => {
      const calls = fixture(st, { identity });
      for (const key of MEMBER_ROUTES) {
        let loaded = false;
        st.mock.method(ROUTES[key], 'loader', async () => { loaded = true; return { default: (_req, res) => res.status(200).json({ ok: true }) }; });
        const { req, res, getStatus } = createMocks({ method: ROUTES[key].methods[0], headers: { 'idempotency-key': 'membership-fixture-operation', authorization: `Bearer ${identity}` } });
        await dispatchRoute(key, req, res);
        assert.equal(getStatus(), key === 'waitlist-admin' ? 403 : 200, key);
        assert.equal(loaded, key !== 'waitlist-admin', key);
      }
      const reads = calls.filter(call => call.path === '/rest/v1/waitlist');
      assert.equal(reads.length, MEMBER_ROUTES.length);
      assert.ok(reads.every(call => call.query.get('auth_user_id') === `eq.${identity}`));
    });
  }
  await t.test('approved administrator', async st => {
    fixture(st, { admin: true });
    st.mock.method(ROUTES['waitlist-admin'], 'loader', async () => ({ default: (_req, res) => res.status(200).json({ ok: true }) }));
    const { req, res, getStatus } = createMocks({ method: 'POST', headers: { 'idempotency-key': 'membership-fixture-operation', authorization: 'Bearer admin' } });
    await dispatchRoute('waitlist-admin', req, res);
    assert.equal(getStatus(), 200);
  });
});

test('account export, deletion and access status remain available without beta membership', async t => {
  const calls = fixture(t, { status: 'unregistered', verified: false });
  for (const key of ACCOUNT_ROUTES) {
    t.mock.method(ROUTES[key], 'loader', async () => ({ default: (_req, res) => res.status(200).json({ ok: true }) }));
    const { req, res, getStatus } = createMocks({ method: ROUTES[key].methods[0], headers: { 'idempotency-key': 'membership-fixture-operation', authorization: 'Bearer owner' } });
    await dispatchRoute(key, req, res);
    assert.equal(getStatus(), 200, key);
  }
  assert.equal(calls.length, ACCOUNT_ROUTES.length);
  assert.ok(calls.every(call => call.path === '/auth/v1/user'));
});

test('membership is rechecked when the same valid token is used after access is revoked', async t => {
  let status = 'approved';
  const calls = fixture(t, { status: () => status });
  let loaded = 0;
  t.mock.method(ROUTES.ask, 'loader', async () => {
    loaded += 1;
    return { default: (_req, res) => res.status(200).json({ ok: true }) };
  });
  const invoke = async () => {
    const http = createMocks({ method: 'POST', headers: { 'idempotency-key': 'membership-fixture-operation', authorization: 'Bearer same-valid-token' } });
    await dispatchRoute('ask', http.req, http.res);
    return http;
  };
  assert.equal((await invoke()).getStatus(), 200);
  status = 'revoked';
  const denied = await invoke();
  assert.equal(denied.getStatus(), 403);
  assert.equal(denied.getJson().status, 'revoked');
  assert.equal(loaded, 1, 'revocation must prevent the second provider handler from loading');
  assert.equal(calls.filter(call => call.path === '/rest/v1/waitlist').length, 2);
  assert.equal(calls.filter(call => call.path === '/auth/v1/user').length, 2);
});

test('unsupported methods on protected routes retain private cache headers before any lookup', async t => {
  const calls = fixture(t);
  for (const key of [...MEMBER_ROUTES, ...ACCOUNT_ROUTES]) {
    t.mock.method(ROUTES[key], 'loader', async () => { assert.fail(`${key} loaded for an unsupported method`); });
    const { req, res, getStatus, getHeaders } = createMocks({ method: 'OPTIONS' });
    await dispatchRoute(key, req, res);
    assert.equal(getStatus(), 405, key);
    assert.equal(getHeaders()['Cache-Control'], 'private, no-store', key);
    assert.equal(getHeaders().Allow, ROUTES[key].methods.join(', '), key);
  }
  assert.equal(calls.length, 0);
});

test('a newly registered endpoint without a policy cannot execute', async () => {
  ROUTES['missing-policy-fixture'] = { methods: ['GET'], loader: async () => { assert.fail('policy-less handler loaded'); } };
  try {
    const { req, res, getStatus } = createMocks({ method: 'GET' });
    await dispatchRoute('missing-policy-fixture', req, res);
    assert.equal(getStatus(), 503);
  } finally { delete ROUTES['missing-policy-fixture']; }
});
