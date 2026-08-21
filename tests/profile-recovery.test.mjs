import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  buildMissingProfileInsert,
  buildProfileUpdate,
  getProfileIdentityFields,
} from '../src/lib/profileRecovery.mjs';

const authSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
const NOW = '2026-08-21T13:00:00.000Z';

test('login recovery never blindly upserts nullable Auth metadata', () => {
  assert.match(authSource, /buildMissingProfileInsert/);
  assert.match(authSource, /\.update\(updatePayload\)[\s\S]*?\.eq\("id", u\.id\)/);
  assert.doesNotMatch(authSource, /\.upsert\(payload, \{ onConflict: "id" \}\)/);
});

test('empty Auth metadata preserves learner-edited fields on update', () => {
  const update = buildProfileUpdate(
    { id: 'user-1', email: 'student@example.com', user_metadata: {} },
    {},
    NOW,
  );
  assert.deepEqual(update, { email: 'student@example.com', updated_at: NOW });
  assert.equal('full_name' in update, false);
  assert.equal('avatar_url' in update, false);
});

test('missing profile insert supplies the required full_name fallback', () => {
  const insert = buildMissingProfileInsert(
    { id: 'user-2', email: 'student@example.com', user_metadata: {} },
    {},
    NOW,
  );
  assert.deepEqual(insert, {
    id: 'user-2',
    email: 'student@example.com',
    full_name: 'Learner',
    avatar_url: null,
    updated_at: NOW,
  });
});

test('explicit identity metadata wins and is trimmed', () => {
  const fields = getProfileIdentityFields({
    id: 'user-3',
    email: ' student@example.com ',
    user_metadata: { full_name: 'Old Name', avatar_url: 'https://old.example/avatar.png' },
  }, {
    full_name: '  New Name  ',
    avatar_url: '  https://example.com/avatar.png  ',
  });
  assert.deepEqual(fields, {
    email: 'student@example.com',
    fullName: 'New Name',
    avatarUrl: 'https://example.com/avatar.png',
  });
});

test('missing email never erases an existing profile email during update', () => {
  const update = buildProfileUpdate(
    { id: 'user-4', email: null, user_metadata: { name: '  Learner Name  ' } },
    undefined,
    NOW,
  );
  assert.equal('email' in update, false);
  assert.equal(update.full_name, 'Learner Name');
});
