import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const analyticsSource = readFileSync(new URL('../src/lib/activationAnalytics.ts', import.meta.url), 'utf8');
const signupSource = readFileSync(new URL('../src/pages/Signup.tsx', import.meta.url), 'utf8');

function activationPayloads(source) {
  return [...source.matchAll(/trackActivationEvent\(([\s\S]*?)\);/g)].map((match) => match[1]);
}

test('activation analytics is non-blocking', () => {
  assert.match(analyticsSource, /void import\("@vercel\/analytics"\)/);
  assert.match(analyticsSource, /\.catch\(\(\) => \{/);
});

test('signup tracks only successful activation milestones', () => {
  assert.match(signupSource, /name: "Waitlist joined"/);
  assert.match(signupSource, /name: "Account created"/);
  assert.match(signupSource, /properties: \{ method: "email" \}/);
  assert.match(signupSource, /useTeamInvite \? "team_invite" : "waitlist_approval"/);
});

test('activation payloads exclude credentials and user-provided identifiers', () => {
  const payloads = activationPayloads(signupSource);
  assert.equal(payloads.length, 2);

  for (const payload of payloads) {
    assert.doesNotMatch(payload, /normalizedEmail|username|inviteCode|password|waitlistInviteToken|honeypot/);
  }
});
