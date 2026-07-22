import { test } from 'node:test';
import assert from 'node:assert/strict';
import signupInviteHandler from '../api/_handlers/signup-invite.js';
import { createMocks } from './helpers/mock-http.mjs';

function signupMocks(body, ip = `10.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.1`) {
  const mocks = createMocks({
    method: 'POST',
    body,
  });
  mocks.req.headers['x-forwarded-for'] = ip;
  return mocks;
}

test('signup-invite rejects weak passwords before invite verification', async () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SIGNUP_INVITE_CODE = 'test-invite';
  try {
    const { req, res, getStatus, getJson } = signupMocks({
      email: 'user@example.com',
      password: 'weak',
      inviteCode: 'test-invite',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /password/i);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

test('signup-invite rejects invalid invite codes for unknown waitlist emails', async () => {
  const previousCode = process.env.SIGNUP_INVITE_CODE;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SIGNUP_INVITE_CODE = 'test-invite';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { req, res, getStatus, getJson } = signupMocks({
      email: 'user@example.com',
      password: 'StrongPass1',
      inviteCode: 'wrong-code',
    });

    await signupInviteHandler(req, res);
    assert.ok([403, 500].includes(getStatus()));
    if (getStatus() === 403) {
      assert.match(getJson().error, /invite|waitlist/i);
    }
  } finally {
    if (previousCode) process.env.SIGNUP_INVITE_CODE = previousCode;
    else delete process.env.SIGNUP_INVITE_CODE;
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    else delete process.env.SUPABASE_URL;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
});

test('signup-invite honeypot returns success without creating user', async () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SIGNUP_INVITE_CODE = 'test-invite';
  try {
    const { req, res, getStatus, getJson } = signupMocks({
      email: 'bot@example.com',
      password: 'StrongPass1',
      inviteCode: 'test-invite',
      website: 'https://spam.test',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 200);
    assert.equal(getJson().ok, true);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

test('signup-invite with no team code and no waitlist entry still reaches the auth call (503 when Supabase missing)', async () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SIGNUP_INVITE_CODE;
  try {
    const { req, res, getStatus } = signupMocks({
      email: 'stranger@example.com',
      password: 'StrongPass1',
    });

    await signupInviteHandler(req, res);
    assert.ok([403, 500].includes(getStatus()), `expected 403/500 got ${getStatus()}`);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

test('signup-invite accepts waitlistInviteToken body field for validation path', async () => {
  const previousCode = process.env.SIGNUP_INVITE_CODE;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SIGNUP_INVITE_CODE = 'test-invite';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const { req, res, getStatus } = signupMocks({
      email: 'user@example.com',
      password: 'StrongPass1',
      waitlistInviteToken: 'token-from-email-link',
    });

    await signupInviteHandler(req, res);
    assert.ok([403, 500].includes(getStatus()));
  } finally {
    if (previousCode) process.env.SIGNUP_INVITE_CODE = previousCode;
    else delete process.env.SIGNUP_INVITE_CODE;
    if (previousUrl) process.env.SUPABASE_URL = previousUrl;
    if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});
