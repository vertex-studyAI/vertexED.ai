import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authCallbackLocation,
  clearGoogleLinkReturn,
  clearGoogleLoginReturn,
  consumeGoogleLinkReturn,
  consumeGoogleLoginReturn,
  createRecoveryEventLatch,
  prepareGoogleLinkReturn,
  prepareGoogleLoginReturn,
} from '../src/lib/authReturn.mjs';

function loginReturnStorage() {
  const values = new Map();
  return {
    values,
    sessionStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    },
  };
}

test('Google sign-in restores a complete local destination once within ten minutes', () => {
  const owner = loginReturnStorage();
  const path = '/learn?tab=knowledge#courses';
  assert.equal(prepareGoogleLoginReturn(owner, path, 1_000), true);
  assert.equal(consumeGoogleLoginReturn(owner, 600_999), path);
  assert.equal(consumeGoogleLoginReturn(owner, 600_999), null);
  assert.equal(owner.values.size, 0);
});

test('Google sign-in destinations reject expired, future and malformed records', () => {
  const owner = loginReturnStorage();
  for (const now of [999, 601_000, Number.NaN]) {
    assert.equal(prepareGoogleLoginReturn(owner, '/main', 1_000), true);
    assert.equal(consumeGoogleLoginReturn(owner, now), null);
    assert.equal(owner.values.size, 0);
  }
  for (const raw of ['not json', 'null', '[]', '{}', JSON.stringify({ version: 2, createdAt: 1_000, path: '/main' }), JSON.stringify({ version: 1, createdAt: '1000', path: '/main' })]) {
    owner.values.set('vertex_google_login_return', raw);
    assert.equal(consumeGoogleLoginReturn(owner, 1_001), null);
    assert.equal(owner.values.size, 0);
  }
});

test('Google sign-in never accepts external or looping destinations at either boundary', () => {
  const owner = loginReturnStorage();
  for (const path of ['//evil.test', 'https://evil.test', '/\\evil.test', '/login?next=1', '/signup', '/auth/callback', null]) {
    assert.equal(prepareGoogleLoginReturn(owner, '/main', 1_000), true);
    assert.equal(prepareGoogleLoginReturn(owner, path, 1_001), false);
    assert.equal(owner.values.size, 0);
    owner.values.set('vertex_google_login_return', JSON.stringify({ version: 1, createdAt: 1_000, path }));
    assert.equal(consumeGoogleLoginReturn(owner, 1_001), null);
    assert.equal(owner.values.size, 0);
  }
});

test('Google sign-in markers stay separate from account linking and can be cancelled', () => {
  const owner = loginReturnStorage();
  assert.equal(prepareGoogleLinkReturn(owner), true);
  assert.equal(prepareGoogleLoginReturn(owner, '/learn?tab=mistakes', 1_000), true);
  assert.equal(clearGoogleLoginReturn(owner), true);
  assert.equal(consumeGoogleLoginReturn(owner, 1_001), null);
  assert.equal(consumeGoogleLinkReturn(owner), '/user-settings');
});

test('Google sign-in return fails safely when storage access, writes or cleanup are blocked', () => {
  const blockedOwner = {};
  Object.defineProperty(blockedOwner, 'sessionStorage', { get() { throw new Error('Blocked'); } });
  assert.equal(prepareGoogleLoginReturn(blockedOwner, '/main'), false);
  assert.equal(clearGoogleLoginReturn(blockedOwner), false);
  assert.equal(consumeGoogleLoginReturn(blockedOwner), null);
  const owner = loginReturnStorage();
  owner.sessionStorage.setItem = () => { throw new Error('Blocked'); };
  assert.equal(prepareGoogleLoginReturn(owner, '/main'), false);
  owner.values.set('vertex_google_login_return', JSON.stringify({ version: 1, path: '/main', createdAt: 1_000 }));
  owner.sessionStorage.removeItem = () => { throw new Error('Blocked'); };
  assert.equal(consumeGoogleLoginReturn(owner, 1_001), null);
});

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
