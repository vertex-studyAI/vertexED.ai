import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/_handlers/user-content.js';
import { createMocks } from './helpers/mock-http.mjs';

test('direct saved-work lookup requires both verified owner and requested id', async t => {
  const previous = { ...process.env };
  const owner = 'f40db66b-1b55-4ab8-88d0-14a9ba476c16';
  const id = '25734997-775e-473f-b415-897751b08497';
  process.env.SUPABASE_URL = 'https://saved-work.example.test';
  process.env.SUPABASE_ANON_KEY = 'test-public-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.WAITLIST_RATE_LIMIT_SALT = 'test-only-salt-long-enough-for-lookup';
  const requests = [];
  t.mock.method(globalThis, 'fetch', async input => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.pathname === '/auth/v1/user') return Response.json({ id: owner, aud: 'authenticated' });
    if (url.pathname.includes('/rpc/')) return Response.json([{ allowed: true }]);
    assert.equal(url.pathname, '/rest/v1/user_study_artifacts');
    requests.push(url);
    // Simulate an item belonging to a different user: the conjunction returns no rows.
    return Response.json([], { headers: { 'content-range': '0-0/0' } });
  });
  try {
    const request = createMocks({ method: 'GET', headers: { authorization: 'Bearer test-token' } });
    request.req.query = { id };
    await handler(request.req, request.res);
    assert.equal(request.getStatus(), 200);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].searchParams.get('id'), `eq.${id}`);
    assert.equal(requests[0].searchParams.get('user_id'), `eq.${owner}`);
    const invalid = createMocks({ method: 'GET', headers: { authorization: 'Bearer test-token' } });
    invalid.req.query = { id: 'not-a-uuid' };
    await handler(invalid.req, invalid.res);
    assert.equal(invalid.getStatus(), 400);
    assert.equal(requests.length, 1, 'invalid lookup never queries the artefact table');
  } finally {
    for (const name of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'WAITLIST_RATE_LIMIT_SALT']) {
      if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name];
    }
  }
});
