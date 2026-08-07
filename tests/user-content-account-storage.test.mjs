import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  normalizeUserContentStorageScope,
  setUserContentStorageScope,
  userContentStorageKeys,
} from '../src/lib/userContentStorageScope.mjs';

const userContentSource = fs.readFileSync('src/lib/userContent.ts', 'utf8');
const authSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const apexSource = fs.readFileSync('src/hooks/useApexChat.ts', 'utf8');

test('study artifact device storage is isolated by authenticated account', () => {
  const first = userContentStorageKeys('11111111-1111-4111-8111-111111111111');
  const second = userContentStorageKeys('22222222-2222-4222-8222-222222222222');

  for (const key of ['artifacts', 'restore', 'chatHandoff']) {
    assert.notEqual(first[key], second[key]);
    assert.match(first[key], /^vertex_content:/);
    assert.match(second[key], /^vertex_content:/);
  }
});

test('unresolved and signed-out states never reuse an authenticated artifact key', () => {
  assert.equal(normalizeUserContentStorageScope(undefined), 'unhydrated');
  assert.equal(normalizeUserContentStorageScope(null), 'signed-out');
  assert.equal(normalizeUserContentStorageScope('  '), 'signed-out');

  setUserContentStorageScope(undefined);
  const unresolved = userContentStorageKeys();
  setUserContentStorageScope(null);
  const signedOut = userContentStorageKeys();
  setUserContentStorageScope('11111111-1111-4111-8111-111111111111');
  const authenticated = userContentStorageKeys();

  assert.notEqual(unresolved.artifacts, signedOut.artifacts);
  assert.notEqual(unresolved.artifacts, authenticated.artifacts);
  assert.notEqual(signedOut.artifacts, authenticated.artifacts);
});

test('user-content no longer reads shared legacy study artifact or handoff keys', () => {
  assert.doesNotMatch(userContentSource, /vertex_local_artifacts/);
  assert.doesNotMatch(userContentSource, /vertex_restore_artifact/);
  assert.doesNotMatch(userContentSource, /vertex_chat_handoff/);
  assert.match(userContentSource, /userContentStorageKeys\(\)/);
});

test('auth lifecycle changes storage ownership before descendants use a new session', () => {
  assert.match(authSource, /setUserContentStorageScope\(undefined\)/);
  assert.match(authSource, /setUserContentStorageScope\(nextUser\?\.id \?\? null\)/);
  assert.match(authSource, /setUserContentStorageScope\(data\.user\?\.id \?\? null\)/);
  assert.match(authSource, /setUserContentStorageScope\(null\)/);
});

test('Apex session history is account-scoped and abandons unsafe legacy migration', () => {
  assert.match(apexSource, /const \{ user, loading: authLoading \} = useAuth\(\)/);
  assert.match(apexSource, /apexChatStorageKey\(context\.page, threadKey, accountScope\)/);
  assert.match(apexSource, /vertex_apex:\$\{account\}:/);
  assert.doesNotMatch(apexSource, /vertex_apex_messages_v1/);
  assert.match(apexSource, /if \(!question \|\| loading \|\| authLoading\) return false/);
  assert.match(apexSource, /requestRef\.current \+= 1/);
});
