import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  WAITLIST_INVITE_TTL_MS,
  buildInviteSignupUrl,
  generateInviteToken,
  getInviteExpiry,
  hashInviteToken,
} from '../api/_lib/inviteToken.js';

test('generateInviteToken returns url-safe string', () => {
  const token = generateInviteToken();
  assert.ok(token.length >= 16);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
});

test('buildInviteSignupUrl encodes token', () => {
  const url = buildInviteSignupUrl('https://www.vertexed.app', 'abc/def');
  assert.equal(url, 'https://www.vertexed.app/signup?invite=abc%2Fdef');
});

test('invite tokens have stable one-way digests and a bounded lifetime', () => {
  const token = 'single-use-token-with-enough-entropy';
  assert.match(hashInviteToken(token), /^[0-9a-f]{64}$/);
  assert.equal(hashInviteToken(token), hashInviteToken(token));
  assert.notEqual(hashInviteToken(token), hashInviteToken(`${token}-other`));
  assert.equal(hashInviteToken('short'), null);

  const issuedAt = new Date('2026-09-09T00:00:00.000Z');
  assert.equal(
    Date.parse(getInviteExpiry(issuedAt)) - issuedAt.getTime(),
    WAITLIST_INVITE_TTL_MS,
  );
});
