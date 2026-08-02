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

function withoutSignupBackend(fn) {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (previousUrl) process.env.SUPABASE_URL = previousUrl;
      else delete process.env.SUPABASE_URL;
      if (previousKey) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
      else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    });
}

test('signup-invite rejects weak passwords before backend initialization', async () => {
  await withoutSignupBackend(async () => {
    const { req, res, getStatus, getJson } = signupMocks({
      password: 'weak',
      username: 'student',
      waitlistInviteToken: 'token-from-email-link',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 400);
    assert.match(getJson().error, /password/i);
  });
});

test('signup-invite returns 503 when account-creation backend is unavailable', async () => {
  await withoutSignupBackend(async () => {
    const { req, res, getStatus, getJson } = signupMocks({
      password: 'StrongPass1',
      username: 'student',
      waitlistInviteToken: 'token-from-email-link',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 503);
    assert.match(getJson().error, /temporarily unavailable/i);
  });
});

test('signup-invite honeypot returns success without backend access', async () => {
  await withoutSignupBackend(async () => {
    const { req, res, getStatus, getJson } = signupMocks({
      password: 'StrongPass1',
      username: 'student',
      waitlistInviteToken: 'token-from-email-link',
      website: 'https://spam.test',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 200);
    assert.equal(getJson().ok, true);
  });
});

test('signup-invite validation path returns 503 when backend is unavailable', async () => {
  await withoutSignupBackend(async () => {
    const { req, res, getStatus, getJson } = signupMocks({
      action: 'validateInvite',
      waitlistInviteToken: 'token-from-email-link',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 503);
    assert.match(getJson().error, /temporarily unavailable/i);
  });
});
