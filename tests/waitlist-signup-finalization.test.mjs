import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { createApprovedWaitlistUser, createTeamInvitedUser } from '../api/_lib/waitlistSignup.js';

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
  assert.equal(update.invite_token_hash, null);
  assert.equal(update.invite_expires_at, null);
});

test('approved waitlist signup atomically consumes a hashed invite', async () => {
  const { client, calls } = fakeSupabase();
  const result = await createApprovedWaitlistUser(client, {
    ...signupInput,
    inviteEntry: {
      ...signupInput.inviteEntry,
      tokenStorage: 'hash',
      inviteTokenHash: 'a'.repeat(64),
    },
  });

  assert.equal(result.stage, 'complete');
  assert.ok(calls.some(([name, field, value]) => name === 'eq'
    && field === 'invite_token_hash'
    && value === 'a'.repeat(64)));
  assert.equal(calls.some(([name, field]) => name === 'eq' && field === 'invite_token'), false);
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

function fakeTeamInviteSupabase({ existingId = null, lookupError = null, writeError = null } = {}) {
  const calls = [];
  const writeChain = {
    eq(field, value) { calls.push(['eq', field, value]); return writeChain; },
    select(fields) { calls.push(['write-select', fields]); return writeChain; },
    async maybeSingle() {
      calls.push(['write-maybeSingle']);
      return { data: writeError ? null : { id: existingId || 'wait-new' }, error: writeError };
    },
  };

  return {
    calls,
    client: {
      auth: {
        admin: {
          async inviteUserByEmail(email, options) {
            calls.push(['inviteUserByEmail', email, options]);
            return { data: { user: { id: 'invited-user-1', email } }, error: null };
          },
          async deleteUser(id) {
            calls.push(['deleteUser', id]);
            return { error: null };
          },
        },
      },
      from(table) {
        calls.push(['from', table]);
        return {
          select(fields) {
            calls.push(['lookup-select', fields]);
            return {
              ilike(field, value) {
                calls.push(['ilike', field, value]);
                return {
                  async maybeSingle() {
                    calls.push(['lookup-maybeSingle']);
                    return { data: existingId ? { id: existingId } : null, error: lookupError };
                  },
                };
              },
            };
          },
          update(values) { calls.push(['team-update', values]); return writeChain; },
          insert(values) { calls.push(['team-insert', values]); return writeChain; },
        };
      },
    },
  };
}

test('team invitation persists explicit access tied to the invited auth identity', async () => {
  const { client, calls } = fakeTeamInviteSupabase();
  const result = await createTeamInvitedUser(client, {
    email: 'student@example.com',
    username: 'student',
    redirectTo: 'https://www.vertexed.app/auth/callback?invite=1',
    updatedAt: signupInput.updatedAt,
  });

  assert.equal(result.stage, 'complete');
  const inserted = calls.find(([name]) => name === 'team-insert')?.[1];
  assert.equal(inserted.auth_user_id, 'invited-user-1');
  assert.equal(inserted.status, 'approved');
  assert.equal(inserted.email, 'student@example.com');
  assert.equal(calls.some(([name]) => name === 'deleteUser'), false);
});

test('team invitation removes the incomplete Auth identity when access persistence fails', async () => {
  const writeError = new Error('database unavailable');
  const { client, calls } = fakeTeamInviteSupabase({ writeError });
  const result = await createTeamInvitedUser(client, {
    email: 'student@example.com',
    username: 'student',
    redirectTo: 'https://www.vertexed.app/auth/callback?invite=1',
  });

  assert.equal(result.stage, 'finalize');
  assert.equal(result.error, writeError);
  assert.deepEqual(calls.find(([name]) => name === 'deleteUser'), ['deleteUser', 'invited-user-1']);
});

test('missing waitlist membership is never treated as approved authorization', () => {
  const statusSource = fs.readFileSync('api/_handlers/waitlist-status.js', 'utf8');
  assert.match(statusSource, /entry\?\.status \?\? 'unregistered'/);
  assert.doesNotMatch(statusSource, /entry\?\.status \?\? 'approved'/);
});

test('migration preserves only historical or provider-invited orphan identities', () => {
  const migration = fs.readFileSync('supabase/migrations/20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql', 'utf8');
  assert.match(migration, /auth_user\.created_at < timestamptz '2026-07-25 00:00:00\+00'/);
  assert.match(migration, /auth_user\.invited_at is not null/);
  assert.doesNotMatch(migration, /from auth\.users as auth_user\s+where auth_user\.email is not null\s+and not exists/i);
});
