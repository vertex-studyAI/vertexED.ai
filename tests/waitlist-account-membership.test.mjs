import assert from 'node:assert/strict';
import test from 'node:test';

import { getAccountWaitlistEntry } from '../api/_lib/waitlistAccess.js';

function membershipClient({ byUser = null, byEmail = null, claimed = null, concurrent = null } = {}) {
  const calls = [];
  let selectCount = 0;
  const client = {
    from(table) {
      calls.push(['from', table]);
      return {
        select(fields) {
          selectCount += 1;
          calls.push(['select', fields]);
          const result = selectCount === 1 ? byUser : selectCount === 2 ? byEmail : concurrent;
          return {
            eq(field, value) {
              calls.push(['select-eq', field, value]);
              return { maybeSingle: async () => ({ data: result, error: null }) };
            },
          };
        },
        update(values) {
          calls.push(['update', values]);
          const chain = {
            eq(field, value) { calls.push(['update-eq', field, value]); return chain; },
            is(field, value) { calls.push(['is', field, value]); return chain; },
            select(fields) { calls.push(['update-select', fields]); return chain; },
            async maybeSingle() { return { data: claimed, error: null }; },
          };
          return chain;
        },
      };
    },
  };
  return { client, calls };
}

test('account membership resolves directly by Auth user id', async () => {
  const row = { id: 'wait-1', status: 'approved', auth_user_id: 'user-1' };
  const { client, calls } = membershipClient({ byUser: row });
  assert.equal(await getAccountWaitlistEntry(client, { id: 'user-1', email: 'student@example.com' }), row);
  assert.equal(calls.filter(([name]) => name === 'select').length, 1);
});

test('an unlinked normalized email row is atomically claimed by the authenticated user', async () => {
  const emailRow = { id: 'wait-1', status: 'approved', auth_user_id: null };
  const claimed = { ...emailRow, auth_user_id: 'user-1' };
  const { client, calls } = membershipClient({ byEmail: emailRow, claimed });
  const result = await getAccountWaitlistEntry(client, { id: 'user-1', email: ' Student@Example.com ' });

  assert.equal(result, claimed);
  assert.ok(calls.some(([name, field, value]) => name === 'select-eq' && field === 'email' && value === 'student@example.com'));
  assert.ok(calls.some(([name, field, value]) => name === 'is' && field === 'auth_user_id' && value === null));
});

test('an email row owned by another Auth identity is never accepted', async () => {
  const { client, calls } = membershipClient({
    byEmail: { id: 'wait-1', status: 'approved', auth_user_id: 'other-user' },
  });
  const result = await getAccountWaitlistEntry(client, { id: 'user-1', email: 'student@example.com' });

  assert.equal(result, null);
  assert.equal(calls.some(([name]) => name === 'update'), false);
});

test('a lost claim only succeeds when the concurrent winner linked the same user', async () => {
  const emailRow = { id: 'wait-1', status: 'approved', auth_user_id: null };
  const concurrent = { ...emailRow, auth_user_id: 'user-1' };
  const { client } = membershipClient({ byEmail: emailRow, claimed: null, concurrent });

  assert.equal(
    await getAccountWaitlistEntry(client, { id: 'user-1', email: 'student@example.com' }),
    concurrent,
  );
});
