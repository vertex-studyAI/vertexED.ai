import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildMissingProfileInsert,
  buildProfileUpdate,
  getProfileIdentityFields,
} from '../src/lib/profileRecovery.mjs';

const NOW = '2026-08-21T13:00:00.000Z';

test('profile recovery preserves learner-edited fields when Auth metadata is empty', () => {
  const user = { id: 'user-1', email: 'student@example.com', user_metadata: {} };
  const update = buildProfileUpdate(user, {}, NOW);

  assert.deepEqual(update, {
    email: 'student@example.com',
    updated_at: NOW,
  });
  assert.equal('full_name' in update, false);
  assert.equal('avatar_url' in update, false);
});

test('missing profile recovery supplies the database-required full_name fallback', () => {
  const user = { id: 'user-2', email: 'student@example.com', user_metadata: {} };
  const insert = buildMissingProfileInsert(user, {}, NOW);

  assert.deepEqual(insert, {
    id: 'user-2',
    email: 'student@example.com',
    full_name: 'Learner',
    avatar_url: null,
    updated_at: NOW,
  });
});

test('successful authentication does not wait for best-effort profile recovery', async () => {
  const source = await readFile(new URL('../src/contexts/AuthContext.tsx', import.meta.url), 'utf8');

  assert.match(source, /void postAuthUpsertProfile\(data\.user\)\.catch/);
  assert.doesNotMatch(source, /if \(data\.user\) await postAuthUpsertProfile\(data\.user\)/);
});

test('explicit profile metadata wins and is trimmed before persistence', () => {
  const user = {
    id: 'user-3',
    email: ' student@example.com ',
    user_metadata: { full_name: 'Old Name', avatar_url: 'https://old.example/avatar.png' },
  };
  const metadata = { full_name: '  New Name  ', avatar_url: '  https://example.com/avatar.png  ' };

  assert.deepEqual(getProfileIdentityFields(user, metadata), {
    email: 'student@example.com',
    fullName: 'New Name',
    avatarUrl: 'https://example.com/avatar.png',
  });
});

test('Auth metadata is used when no explicit profile metadata is provided', () => {
  const user = {
    id: 'user-4',
    email: null,
    user_metadata: { name: '  Learner Name  ', avatar_url: '' },
  };

  const insert = buildMissingProfileInsert(user, undefined, NOW);
  assert.equal(insert.full_name, 'Learner Name');
  assert.equal(insert.email, null);
  assert.equal(insert.avatar_url, null);
});
