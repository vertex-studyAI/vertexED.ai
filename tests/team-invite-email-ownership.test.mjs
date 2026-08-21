import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  isVerifiedInviteSession,
  validateInitialPassword,
} from '../src/lib/inviteAcceptance.mjs';

const handlerSource = fs.readFileSync('api/_handlers/signup-invite.js', 'utf8');
const signupSource = fs.readFileSync('src/pages/Signup.tsx', 'utf8');
const callbackSource = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');
const passwordPageSource = fs.readFileSync('src/pages/SetInitialPassword.tsx', 'utf8');

test('shared team code proves eligibility, never mailbox ownership', () => {
  const teamStart = handlerSource.indexOf('if (!inviteToken) {');
  const waitlistStart = handlerSource.indexOf('// Waitlist approval links', teamStart);
  assert.ok(teamStart >= 0 && waitlistStart > teamStart, 'team and waitlist branches must remain separate');

  const teamBranch = handlerSource.slice(teamStart, waitlistStart);
  assert.match(teamBranch, /auth\.admin\.inviteUserByEmail\(normalizedEmail/);
  assert.match(teamBranch, /requiresEmailVerification:\s*true/);
  assert.doesNotMatch(teamBranch, /auth\.admin\.createUser/);
  assert.doesNotMatch(teamBranch, /email_confirm\s*:\s*true/);
  assert.doesNotMatch(teamBranch, /password\s*:\s*pwd/);
});

test('waitlist approval bearer token retains its separate password path', () => {
  const waitlistStart = handlerSource.indexOf('// Waitlist approval links');
  assert.ok(waitlistStart >= 0, 'waitlist branch must remain explicit');

  const waitlistBranch = handlerSource.slice(waitlistStart);
  assert.match(waitlistBranch, /validatePassword\(pwd\)/);
  assert.match(waitlistBranch, /auth\.admin\.createUser\(\{/);
  assert.match(waitlistBranch, /email_confirm:\s*true/);
  assert.match(waitlistBranch, /requiresEmailVerification:\s*false/);
});

test('team-invite client never sends a caller-selected password', () => {
  assert.match(signupSource, /password:\s*hasWaitlistInvite\s*\?\s*password\s*:\s*undefined/);
  assert.match(signupSource, /if \(useTeamInvite\)[\s\S]*?requiresEmailVerification !== true[\s\S]*?setTeamInviteSent\(true\)/);
  assert.match(signupSource, /\{hasWaitlistInvite && \([\s\S]*?aria-label="Password"/);
});

test('invite callback requires invitation provenance and confirmed mailbox', () => {
  assert.equal(isVerifiedInviteSession(null), false);
  assert.equal(isVerifiedInviteSession({ id: 'u1', email_confirmed_at: '2026-08-21T00:00:00Z' }), false);
  assert.equal(isVerifiedInviteSession({ id: 'u1', invited_at: '2026-08-21T00:00:00Z' }), false);
  assert.equal(isVerifiedInviteSession({
    id: 'u1',
    invited_at: '2026-08-21T00:00:00Z',
    email_confirmed_at: '2026-08-21T00:01:00Z',
  }), true);
  assert.match(callbackSource, /inviteHint[\s\S]*?isVerifiedInviteSession\(session\.user\)/);
  assert.match(passwordPageSource, /isVerifiedInviteSession\(data\.session\.user\)/);
});

test('initial invite password policy matches the hardened signup minimum', () => {
  assert.equal(validateInitialPassword('short').ok, false);
  assert.equal(validateInitialPassword('alllowercase123').ok, false);
  assert.equal(validateInitialPassword('ALLUPPERCASE123').ok, false);
  assert.equal(validateInitialPassword('NoNumbersHere').ok, false);
  assert.equal(validateInitialPassword('StrongPass1').ok, true);
  assert.equal(validateInitialPassword(`A1${'x'.repeat(127)}`).ok, false);
  assert.match(passwordPageSource, /auth\.updateUser\(\{ password \}\)/);
});
