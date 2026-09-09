import test from 'node:test';
import assert from 'node:assert/strict';
import { authCallbackLocation, consumeGoogleLinkReturn, createRecoveryEventLatch } from '../src/lib/authReturn.mjs';

test('provider returns to Site URL reach the callback without creating a new URL target', () => {
  for (const suffix of ['#access_token=fixture&refresh_token=fixture', '?error=access_denied', '#error_code=expired', '?code=fixture']) {
    assert.equal(authCallbackLocation(new URL(`https://example.test/${suffix}`)), `/auth/callback${suffix}`);
  }
  for (const path of ['/#tools', '/?campaign=study', '/resources?code=biology', '/about#error=example']) {
    assert.equal(authCallbackLocation(new URL(`https://example.test${path}`)), null);
  }
});

test('recovery events survive lazy route loading but stay account-bound, short-lived and one-time', () => {
  let now = 0;
  const latch = createRecoveryEventLatch(() => now);
  const session = { user: { id: 'account-a' } };
  latch.observe('SIGNED_IN', session);
  assert.equal(latch.consume('account-a'), false);
  latch.observe('PASSWORD_RECOVERY', session);
  latch.observe('INITIAL_SESSION', session);
  assert.equal(latch.consume('account-a'), true);
  assert.equal(latch.consume('account-a'), false);
  latch.observe('PASSWORD_RECOVERY', session);
  assert.equal(latch.consume('account-b'), false);
  latch.observe('PASSWORD_RECOVERY', session);
  latch.observe('SIGNED_OUT', null);
  assert.equal(latch.consume('account-a'), false);
  latch.observe('PASSWORD_RECOVERY', session);
  latch.observe('SIGNED_IN', { user: { id: 'account-b' } });
  assert.equal(latch.consume('account-a'), false);
  latch.observe('PASSWORD_RECOVERY', session);
  now = 60_001;
  assert.equal(latch.consume('account-a'), false);
});

test('Google-link returns are consumed once, fail closed and tolerate blocked storage', () => {
  for (const value of ['/user-settings', '//evil.test', 'https://evil.test', '/\\evil.test', '/main', null]) {
    let stored = value;
    const storage = { getItem: () => stored, removeItem: () => { stored = null; } };
    assert.equal(consumeGoogleLinkReturn(storage), value === '/user-settings' ? value : null);
    assert.equal(stored, null);
    assert.equal(consumeGoogleLinkReturn(storage), null);
  }
  assert.equal(consumeGoogleLinkReturn({ getItem() { throw new Error('Blocked'); } }), null);
});
