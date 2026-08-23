import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { createApprovedWaitlistUser } from '../api/_lib/waitlistSignup.js';

function fakeSupabase({ createError = null, finalizeError = null, finalized = { id: 'wait-1' }, rollbackError = null } = {}) {
  const calls = [];
  const chain = {
    eq(field, value) { calls.push(['eq', field, value]); return chain; },
    select(fields) { calls.push(['select', fields]); return chain; },
    async maybeSingle() { calls.push(['maybeSingle']); return { data: finalized, error: finalizeError }; },
  };

  return {
    calls,
    client: {
      auth: {
        admin: {
          async createUser(input) {
            calls.push(['createUser', input]);
            return createError
              ? { data: null, error: createError }
              : { data: { user: { id: 'auth-user-1', email: input.email } }, error: null };
          },
          async deleteUser(id) {
            calls.push(['deleteUser', id]);
            return { error: rollbackError };
          },
        },
      },
      from(table) {
        calls.push(['from', table]);
        return {
          update(values) {
            calls.push(['update', values]);
            return chain;
          },
        };
      },
    },
  };
}

const signupInput = {
  inviteEntry: { id: 'wait-1', email: 'student@example.com', status: 'approved' },
  inviteToken: 'single-use-token',
  password: 'StrongPass1',
  username: 'student',
  updatedAt: '2026-08-23T15:30:00.000Z',
};

test('approved waitlist signup consumes the exact invite before reporting success', async () => {
  const { client, calls } = fakeSupabase();
  const result = await createApprovedWaitlistUser(client, signupInput);

  assert.equal(result.error, null);
  assert.equal(result.stage, 'complete');
  assert.equal(calls.filter(([name]) => name === 'createUser').length, 1);
  assert.equal(calls.filter(([name]) => name === 'deleteUser').length, 0);
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'id' && value === 'wait-1'));
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'invite_token' && value === 'single-use-token'));
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'status' && value === 'approved'));
  const update = calls.find(([name]) => name === 'update')?.[1];
  assert.equal(update.auth_user_id, 'auth-user-1');
  assert.equal(update.invite_token, null);
});

test('invite finalization failure rolls back the newly created auth user', async () => {
  const finalizeError = new Error('waitlist write unavailable');
  const { client, calls } = fakeSupabase({ finalizeError, finalized: null });
  const result = await createApprovedWaitlistUser(client, signupInput);

  assert.equal(result.error, finalizeError);
  assert.equal(result.stage, 'finalize');
  assert.deepEqual(calls.find(([name]) => name === 'deleteUser'), ['deleteUser', 'auth-user-1']);
});

test('lost invite ownership fails closed and rolls back even without a database error', async () => {
  const { client, calls } = fakeSupabase({ finalized: null });
  const result = await createApprovedWaitlistUser(client, signupInput);

  assert.equal(result.stage, 'finalize');
  assert.match(result.error.message, /lost ownership/i);
  assert.deepEqual(calls.find(([name]) => name === 'deleteUser'), ['deleteUser', 'auth-user-1']);
});

test('account-provider failure never mutates the waitlist or attempts rollback', async () => {
  const createError = new Error('provider unavailable');
  const { client, calls } = fakeSupabase({ createError });
  const result = await createApprovedWaitlistUser(client, signupInput);

  assert.equal(result.error, createError);
  assert.equal(result.stage, 'create');
  assert.equal(calls.some(([name]) => name === 'from'), false);
  assert.equal(calls.some(([name]) => name === 'deleteUser'), false);
});

test('signup handler delegates waitlist account creation to fail-closed finalization helper', () => {
  const source = fs.readFileSync('api/_handlers/signup-invite.js', 'utf8');
  assert.match(source, /await createApprovedWaitlistUser\(supabase,/);
  assert.doesNotMatch(source, /await supabase[\s\S]*?\.from\('waitlist'\)[\s\S]*?invite_token:\s*null/);
});
