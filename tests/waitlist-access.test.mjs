import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertWaitlistSignupAllowed } from '../api/_lib/waitlistAccess.js';

function mockSupabase(entry) {
  return {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: entry, error: null }),
              };
            },
          };
        },
      };
    },
  };
}

test('waitlist access allows approved emails', async () => {
  const result = await assertWaitlistSignupAllowed(
    mockSupabase({ id: '1', status: 'approved' }),
    'student@school.edu',
  );
  assert.equal(result.allowed, true);
});

test('waitlist access rejects pending emails', async () => {
  const result = await assertWaitlistSignupAllowed(
    mockSupabase({ id: '1', status: 'pending' }),
    'student@school.edu',
  );
  assert.equal(result.allowed, false);
  assert.match(result.error, /pending/i);
});

test('waitlist access rejects unknown emails without invite', async () => {
  const result = await assertWaitlistSignupAllowed(mockSupabase(null), 'student@school.edu');
  assert.equal(result.allowed, false);
  assert.match(result.error, /waitlist/i);
});

test('waitlist access rejects rejected emails', async () => {
  const result = await assertWaitlistSignupAllowed(
    mockSupabase({ id: '1', status: 'rejected' }),
    'student@school.edu',
  );
  assert.equal(result.allowed, false);
  assert.match(result.error, /not approved/i);
});
