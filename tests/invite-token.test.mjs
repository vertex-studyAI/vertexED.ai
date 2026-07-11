import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildInviteSignupUrl, generateInviteToken } from '../api/_lib/inviteToken.js';

test('generateInviteToken returns url-safe string', () => {
  const token = generateInviteToken();
  assert.ok(token.length >= 16);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
});

test('buildInviteSignupUrl encodes token', () => {
  const url = buildInviteSignupUrl('https://www.vertexed.app', 'abc/def');
  assert.equal(url, 'https://www.vertexed.app/signup?invite=abc%2Fdef');
});
