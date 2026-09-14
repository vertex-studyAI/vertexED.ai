import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const loginSource = fs.readFileSync('src/pages/Login.tsx', 'utf8');

test('login serializes sign-in and password-reset operations', () => {
  assert.match(loginSource, /const authBusy = loading \|\| resetLoading;/);
  assert.match(
    loginSource,
    /const handleSubmit = async[\s\S]*?e\.preventDefault\(\);\s*if \(authBusy\) return;/,
  );
  assert.match(
    loginSource,
    /const handleResetPassword = async \(\) => \{\s*if \(authBusy\) return;/,
  );
  assert.match(
    loginSource,
    /onClick=\{async \(\) => \{\s*if \(authBusy\) return;/,
  );

  const guardedControls = loginSource.match(/disabled=\{authBusy\}/g) ?? [];
  assert.ok(
    guardedControls.length >= 3,
    'Google sign-in, password reset, and email sign-in should share the same busy gate',
  );
});
