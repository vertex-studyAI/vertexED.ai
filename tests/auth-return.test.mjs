import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authCallbackLocation,
  clearGoogleLinkReturn,
  consumeGoogleLinkReturn,
  createRecoveryEventLatch,
  prepareGoogleLinkReturn,
} from '../src/lib/authReturn.mjs';

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

test('Google-link returns are written and consumed once through the fail-closed storage boundary', () => {
  let stored = null;
  const owner = {
    sessionStorage: {
      getItem: () => stored,
      setItem: (_key, value) => { stored = value; },
      removeItem: () => { stored = null; },
    },
  };

  assert.equal(prepareGoogleLinkReturn(owner), true);
  assert.equal(stored, '/user-settings');
  assert.equal(consumeGoogleLinkReturn(owner), '/user-settings');
  assert.equal(stored, null);
  assert.equal(consumeGoogleLinkReturn(owner), null);
});

test('Google-link return rejects untrusted destinations and cleanup failures', () => {
  for (const value of ['//evil.test', 'https://evil.test', '/\\evil.test', '/main']) {
    let stored = value;
    const owner = {
      sessionStorage: {
        getItem: () => stored,
        setItem: (_key, next) => { stored = next; },
        removeItem: () => { stored = null; },
      },
    };
    assert.equal(consumeGoogleLinkReturn(owner), null);
    assert.equal(stored, null);
  }

  const removeBlocked = {
    sessionStorage: {
      getItem: () => '/user-settings',
      setItem: () => {},
      removeItem() { throw new Error('Blocked'); },
    },
  };
  assert.equal(consumeGoogleLinkReturn(removeBlocked), null);
});

test('Google-link storage failures never start or restore a return flow', () => {
  const blockedOwner = {};
  Object.defineProperty(blockedOwner, 'sessionStorage', {
    get() { throw new Error('Blocked'); },
  });

  assert.equal(prepareGoogleLinkReturn(blockedOwner), false);
  assert.equal(consumeGoogleLinkReturn(blockedOwner), null);
  assert.equal(clearGoogleLinkReturn(blockedOwner), false);
});