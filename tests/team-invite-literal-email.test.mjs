import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { createTeamInvitedUser } from '../api/_lib/waitlistSignup.js';

const options = {
  username: 'learner',
  redirectTo: 'https://vertexed.example/auth/callback?invite=1',
  updatedAt: '2026-10-11T00:00:00.000Z',
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A small HTTP fixture for the operators used by this query. The real locked
// Supabase SDK performs URL construction and response parsing. This is not a
// hosted PostgREST or production-database test.
function matchesEmail(value, expression) {
  const separator = expression.indexOf('.');
  const operator = expression.slice(0, separator);
  const pattern = expression.slice(separator + 1);
  if (operator === 'ilike') {
    let source = '';
    const sqlPattern = pattern.replaceAll('*', '%');
    for (let i = 0; i < sqlPattern.length; i += 1) {
      const character = sqlPattern[i];
      if (character === '\\') source += escapeRegex(sqlPattern[++i] ?? '');
      else if (character === '%') source += '[\\s\\S]*';
      else if (character === '_') source += '[\\s\\S]';
      else source += escapeRegex(character);
    }
    return new RegExp(`^(?:${source})$`, 'i').test(value);
  }
  if (operator === 'imatch') {
    const source = pattern.replace(/^\\A/, '^').replace(/\\Z$/, '$');
    const match = new RegExp(source, 'i').exec(value);
    return match?.[0] === value;
  }
  throw new Error(`Unexpected email operator: ${operator}`);
}

function fixture(initialRows, { lookupError = false, writeError = false } = {}) {
  const rows = structuredClone(initialRows);
  const calls = [];
  const client = createClient('https://invite-fixture.supabase.co', 'synthetic-service-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init = {}) => {
        const url = new URL(input instanceof Request ? input.url : input);
        const method = init.method ?? 'GET';
        const body = init.body ? JSON.parse(init.body) : null;
        calls.push({ method, path: url.pathname, query: new URLSearchParams(url.searchParams), body });
        const json = (data, status = 200) => new Response(JSON.stringify(data), {
          status, headers: { 'content-type': 'application/json' },
        });
        if (url.pathname === '/auth/v1/invite') {
          return json({ id: '11111111-1111-4111-8111-111111111111', email: body.email, aud: 'authenticated' });
        }
        if (url.pathname === '/auth/v1/admin/users/11111111-1111-4111-8111-111111111111' && method === 'DELETE') return json({});
        assert.equal(url.pathname, '/rest/v1/waitlist');
        if (method === 'GET') {
          if (lookupError) return json({ code: 'TEST_DB_ERROR', message: 'Lookup unavailable' }, 503);
          const matches = rows.filter((row) => matchesEmail(row.email, url.searchParams.get('email')));
          const fields = url.searchParams.get('select').split(',');
          return json(matches.map((row) => Object.fromEntries(fields.map((key) => [key, row[key]]))));
        }
        if (writeError) return json({ code: 'TEST_DB_ERROR', message: 'Write unavailable' }, 503);
        if (method === 'PATCH') {
          const id = url.searchParams.get('id')?.slice(3);
          const row = rows.find((candidate) => candidate.id === id);
          assert.ok(row, 'a selected waitlist row must exist');
          Object.assign(row, body);
          return json({ id });
        }
        assert.equal(method, 'POST');
        rows.push({ id: 'new-waitlist-row', ...body });
        return json({ id: 'new-waitlist-row' }, 201);
      },
    },
  });
  return { client, rows, calls };
}

for (const [email, other] of [
  ['learner_one@example.com', 'learnerXone@example.com'],
  ['learner%one@example.com', 'learner-any-one@example.com'],
  ['learner*one@example.com', 'learner-any-one@example.com'],
  ['learner\\_one@example.com', 'learner_one@example.com'],
]) {
  test(`team invitation does not attach ${email} to the pattern-matched account`, async () => {
    const original = { id: 'other-waitlist-row', email: other, status: 'pending', auth_user_id: 'other-auth-user' };
    const { client, rows, calls } = fixture([original]);
    const result = await createTeamInvitedUser(client, { ...options, email });
    assert.equal(result.stage, 'complete');
    assert.deepEqual(rows[0], original, 'the other account must remain untouched');
    assert.equal(rows.length, 2);
    assert.equal(rows[1].email, email);
    assert.equal(rows[1].auth_user_id, '11111111-1111-4111-8111-111111111111');
    assert.equal(calls.some((call) => call.method === 'PATCH'), false);
  });
}

for (const email of [
  'learner_one@example.com', 'learner%one@example.com', 'learner*one@example.com',
  'learner+tag@example.com', 'learner.name@example.com', 'learner?tag@example.com',
  'learner[one]@example.com', 'learner(one)@example.com', 'learner{one}@example.com',
  'learner^one$@example.com', 'learner|one@example.com', 'learner\\one@example.com',
]) {
  test(`team invitation finds the literal mixed-case row for ${email}`, async () => {
    const { client, rows, calls } = fixture([
      { id: 'intended-row', email: email.toUpperCase(), status: 'pending' },
      { id: 'unrelated-row', email: 'other@example.com', status: 'pending' },
    ]);
    const result = await createTeamInvitedUser(client, { ...options, email });
    assert.equal(result.stage, 'complete');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].auth_user_id, '11111111-1111-4111-8111-111111111111');
    assert.equal(rows[1].auth_user_id, undefined);
    assert.equal(calls.filter((call) => call.path === '/rest/v1/waitlist' && call.method === 'POST').length, 0);
  });
}

test('team invitation chooses its literal row when an underscore lookalike also exists', async () => {
  const { client, rows } = fixture([
    { id: 'intended-row', email: 'LEARNER_ONE@EXAMPLE.COM', status: 'pending' },
    { id: 'lookalike-row', email: 'learnerXone@example.com', status: 'pending' },
  ]);
  const result = await createTeamInvitedUser(client, { ...options, email: 'learner_one@example.com' });
  assert.equal(result.stage, 'complete');
  assert.equal(rows[0].auth_user_id, '11111111-1111-4111-8111-111111111111');
  assert.equal(rows[1].auth_user_id, undefined);
});

for (const failure of ['lookupError', 'writeError']) {
  test(`team invitation retains Auth rollback after ${failure}`, async () => {
    const { client, rows, calls } = fixture([], { [failure]: true });
    const result = await createTeamInvitedUser(client, { ...options, email: 'learner_one@example.com' });
    assert.equal(result.stage, 'finalize');
    assert.ok(result.error);
    assert.equal(rows.length, 0);
    assert.equal(calls.filter((call) => call.method === 'DELETE').length, 1);
  });
}
