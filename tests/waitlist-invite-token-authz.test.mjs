import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  assertWaitlistSignupAllowed,
  getWaitlistEntryByToken,
} from '../api/_lib/waitlistAccess.js';
import { hashInviteToken } from '../api/_lib/inviteToken.js';

const PLAINTEXT_TOKEN = 'legacy-plaintext-invite-token-32b';

function createTokenLookupMock({ hashed = null, legacy = null } = {}) {
  const calls = [];
  return {
    calls,
    from() {
      return {
        select() {
          const state = { eqs: {}, gt: null };
          const api = {
            eq(column, value) {
              state.eqs[column] = value;
              return api;
            },
            gt(column, value) {
              state.gt = { column, value };
              return api;
            },
            maybeSingle: async () => {
              calls.push({ eqs: { ...state.eqs }, gt: state.gt });
              if (Object.hasOwn(state.eqs, 'invite_token_hash')) {
                if (!state.gt || state.gt.column !== 'invite_expires_at') {
                  return { data: null, error: null };
                }
                return { data: hashed, error: null };
              }
              if (Object.hasOwn(state.eqs, 'invite_token')) {
                if (!state.gt || state.gt.column !== 'invite_expires_at') {
                  return { data: null, error: null };
                }
                return { data: legacy, error: null };
              }
              return { data: null, error: null };
            },
          };
          return api;
        },
      };
    },
  };
}

test('hashed invite lookup requires a future invite_expires_at filter', async () => {
  const token = 'fresh-hashed-invite-token-value';
  const digest = hashInviteToken(token);
  const supabase = createTokenLookupMock({
    hashed: { id: '1', email: 'student@school.edu', status: 'approved' },
  });

  const entry = await getWaitlistEntryByToken(supabase, token);
  assert.equal(entry?.id, '1');
  assert.equal(entry?.tokenStorage, 'hash');
  assert.equal(supabase.calls[0].eqs.invite_token_hash, digest);
  assert.equal(supabase.calls[0].gt.column, 'invite_expires_at');
});

test('legacy plaintext invite lookup requires an unexpired invite window', async () => {
  const previous = process.env.ALLOW_LEGACY_INVITE_TOKENS;
  process.env.ALLOW_LEGACY_INVITE_TOKENS = '1';
  try {
  const future = new Date(Date.now() + 60_000).toISOString();
  const supabase = createTokenLookupMock({
    legacy: {
      id: '2',
      email: 'legacy@school.edu',
      status: 'approved',
      invite_token: PLAINTEXT_TOKEN,
      invite_expires_at: future,
    },
  });

  const entry = await getWaitlistEntryByToken(supabase, PLAINTEXT_TOKEN);
  assert.equal(entry?.id, '2');
  assert.equal(entry?.tokenStorage, 'legacy');
  assert.equal(supabase.calls[1].eqs.invite_token, PLAINTEXT_TOKEN);
  assert.equal(supabase.calls[1].gt.column, 'invite_expires_at');
  } finally {
    if (previous === undefined) delete process.env.ALLOW_LEGACY_INVITE_TOKENS;
    else process.env.ALLOW_LEGACY_INVITE_TOKENS = previous;
  }
});

test('legacy plaintext invites without a future expiry are rejected', async () => {
  const previous = process.env.ALLOW_LEGACY_INVITE_TOKENS;
  process.env.ALLOW_LEGACY_INVITE_TOKENS = '1';
  try {
  const past = new Date(Date.now() - 60_000).toISOString();
  const supabase = createTokenLookupMock({
    legacy: {
      id: '3',
      email: 'stale@school.edu',
      status: 'approved',
      invite_token: PLAINTEXT_TOKEN,
      invite_expires_at: past,
    },
  });

  const entry = await getWaitlistEntryByToken(supabase, PLAINTEXT_TOKEN);
  assert.equal(entry, null);
  assert.equal(supabase.calls[1].gt.column, 'invite_expires_at');
  } finally {
    if (previous === undefined) delete process.env.ALLOW_LEGACY_INVITE_TOKENS;
    else process.env.ALLOW_LEGACY_INVITE_TOKENS = previous;
  }
});

test('assertWaitlistSignupAllowed does not treat expired legacy tokens as active invite credentials', async () => {
  const previous = process.env.ALLOW_LEGACY_INVITE_TOKENS;
  process.env.ALLOW_LEGACY_INVITE_TOKENS = '1';
  try {
    const past = new Date(Date.now() - 60_000).toISOString();
    const result = await assertWaitlistSignupAllowed(
      {
        from() {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({
                      data: {
                        id: '4',
                        status: 'pending',
                        invite_token: PLAINTEXT_TOKEN,
                        invite_expires_at: past,
                      },
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        },
      },
      'stale@school.edu',
      { inviteToken: PLAINTEXT_TOKEN },
    );

    assert.equal(result.allowed, false);
    assert.match(result.error, /expired|invalid/i);
  } finally {
    if (previous === undefined) delete process.env.ALLOW_LEGACY_INVITE_TOKENS;
    else process.env.ALLOW_LEGACY_INVITE_TOKENS = previous;
  }
});

test('assertWaitlistSignupAllowed accepts unexpired legacy invite tokens', async () => {
  const previous = process.env.ALLOW_LEGACY_INVITE_TOKENS;
  process.env.ALLOW_LEGACY_INVITE_TOKENS = '1';
  try {
    const future = new Date(Date.now() + 60_000).toISOString();
    const result = await assertWaitlistSignupAllowed(
      {
        from() {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({
                      data: {
                        id: '5',
                        status: 'approved',
                        invite_token: PLAINTEXT_TOKEN,
                        invite_expires_at: future,
                      },
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        },
      },
      'fresh@school.edu',
      { inviteToken: PLAINTEXT_TOKEN },
    );

    assert.equal(result.allowed, true);
  } finally {
    if (previous === undefined) delete process.env.ALLOW_LEGACY_INVITE_TOKENS;
    else process.env.ALLOW_LEGACY_INVITE_TOKENS = previous;
  }
});

test('legacy plaintext invite lookups stay disabled when ALLOW_LEGACY_INVITE_TOKENS=0', async () => {
  const previous = process.env.ALLOW_LEGACY_INVITE_TOKENS;
  process.env.ALLOW_LEGACY_INVITE_TOKENS = '0';
  try {
    const future = new Date(Date.now() + 60_000).toISOString();
    const supabase = createTokenLookupMock({
      legacy: {
        id: '6',
        email: 'blocked@school.edu',
        status: 'approved',
        invite_token: PLAINTEXT_TOKEN,
        invite_expires_at: future,
      },
    });
    const entry = await getWaitlistEntryByToken(supabase, PLAINTEXT_TOKEN);
    assert.equal(entry, null);
    assert.equal(supabase.calls.length, 1);
    assert.ok(Object.hasOwn(supabase.calls[0].eqs, 'invite_token_hash'));
  } finally {
    if (previous === undefined) delete process.env.ALLOW_LEGACY_INVITE_TOKENS;
    else process.env.ALLOW_LEGACY_INVITE_TOKENS = previous;
  }
});
test('signup-invite rate-limits before validateInvite token probing', () => {
  const source = readFileSync(new URL('../api/_handlers/signup-invite.js', import.meta.url), 'utf8');
  const rateIndex = source.indexOf("checkDbRateLimit('signup-invite'");
  const validateIndex = source.indexOf("action === 'validateInvite'");
  assert.ok(rateIndex >= 0, 'signup-invite must rate-limit');
  assert.ok(validateIndex >= 0, 'signup-invite must expose validateInvite');
  assert.ok(rateIndex < validateIndex, 'rate limiting must precede validateInvite');
});
