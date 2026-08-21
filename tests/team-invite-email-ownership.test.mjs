import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import signupInviteHandler from '../api/_handlers/signup-invite.js';
import {
  isVerifiedInviteSession,
  validateInitialPassword,
} from '../src/lib/inviteAcceptance.mjs';
import { createMocks } from './helpers/mock-http.mjs';

const handlerSource = fs.readFileSync('api/_handlers/signup-invite.js', 'utf8');
const signupSource = fs.readFileSync('src/pages/Signup.tsx', 'utf8');
const callbackSource = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');
const passwordPageSource = fs.readFileSync('src/pages/SetInitialPassword.tsx', 'utf8');

function teamSignupMocks(body, ip = `10.201.${Math.floor(Math.random() * 200)}.1`) {
  const mocks = createMocks({ method: 'POST', body });
  mocks.req.headers['x-forwarded-for'] = ip;
  return mocks;
}

async function withTeamInviteEnv(fn) {
  const previous = {
    code: process.env.SIGNUP_INVITE_CODE,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  process.env.SIGNUP_INVITE_CODE = 'valid-team-code';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    return await fn();
  } finally {
    if (previous.code === undefined) delete process.env.SIGNUP_INVITE_CODE;
    else process.env.SIGNUP_INVITE_CODE = previous.code;
    if (previous.url === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.key;
  }
}

test('shared team invite never creates an auto-confirmed password account', () => {
  const teamStart = handlerSource.indexOf('if (!inviteToken) {');
  const waitlistStart = handlerSource.indexOf('// Waitlist approval links', teamStart);
  assert.ok(teamStart >= 0 && waitlistStart > teamStart, 'team and waitlist branches must remain distinguishable');

  const teamBranch = handlerSource.slice(teamStart, waitlistStart);
  assert.match(teamBranch, /auth\.admin\.inviteUserByEmail\(normalizedEmail/);
  assert.match(teamBranch, /requiresEmailVerification:\s*true/);
  assert.doesNotMatch(teamBranch, /auth\.admin\.createUser/);
  assert.doesNotMatch(teamBranch, /email_confirm\s*:\s*true/);
  assert.doesNotMatch(teamBranch, /password\s*:\s*pwd/);
});

test('waitlist bearer-token flow retains its separate password creation path', () => {
  const waitlistStart = handlerSource.indexOf('// Waitlist approval links');
  const waitlistBranch = handlerSource.slice(waitlistStart);
  assert.match(waitlistBranch, /validatePassword\(pwd\)/);
  assert.match(waitlistBranch, /auth\.admin\.createUser\(\{/);
  assert.match(waitlistBranch, /email_confirm:\s*true/);
  assert.match(waitlistBranch, /requiresEmailVerification:\s*false/);
});

test('valid team invite reaches backend availability check without accepting a caller password', async () => {
  await withTeamInviteEnv(async () => {
    const { req, res, getStatus, getJson } = teamSignupMocks({
      email: 'student@example.com',
      username: 'student',
      inviteCode: 'valid-team-code',
    });

    await signupInviteHandler(req, res);
    assert.equal(getStatus(), 503);
    assert.match(getJson().error, /temporarily unavailable/i);
  });
});

test('verified invite session requires both invitation provenance and confirmed mailbox', () => {
  assert.equal(isVerifiedInviteSession(null), false);
  assert.equal(isVerifiedInviteSession({ id: 'u1', email_confirmed_at: '2026-08-21T00:00:00Z' }), false);
  assert.equal(isVerifiedInviteSession({ id: 'u1', invited_at: '2026-08-21T00:00:00Z' }), false);
  assert.equal(
    isVerifiedInviteSession({
      id: 'u1',
      invited_at: '2026-08-21T00:00:00Z',
      email_confirmed_at: '2026-08-21T00:01:00Z',
    }),
    true,
  );
});

test('initial invite password policy matches the hardened signup minimum', () => {
  assert.equal(validateInitialPassword('short').ok, false);
  assert.equal(validateInitialPassword('alllowercase123').ok, false);
  assert.equal(validateInitialPassword('ALLUPPERCASE123').ok, false);
  assert.equal(validateInitialPassword('NoNumbersHere').ok, false);
  assert.equal(validateInitialPassword('StrongPass1').ok, true);
  assert.equal(validateInitialPassword(`A1${'x'.repeat(127)}`).ok, false);
});

test('client team-invite flow sends no password and fails closed without verification response', () => {
  assert.match(signupSource, /password:\s*hasWaitlistInvite\s*\?\s*password\s*:\s*undefined/);
  assert.match(signupSource, /if \(useTeamInvite\)[\s\S]*?requiresEmailVerification !== true[\s\S]*?setTeamInviteSent\(true\)/);
  assert.match(signupSource, /\{hasWaitlistInvite && \([\s\S]*?aria-label="Password"/);
});

test('invite callback does not trust the invite query parameter as authorization', () => {
  assert.match(callbackSource, /inviteHint[\s\S]*?isVerifiedInviteSession\(session\.user\)/);
  assert.match(callbackSource, /setInviteReady\(true\)/);
  assert.match(passwordPageSource, /isVerifiedInviteSession\(data\.session\.user\)/);
  assert.match(passwordPageSource, /auth\.updateUser\(\{ password \}\)/);
});
