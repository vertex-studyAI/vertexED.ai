import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// This contract intentionally rides the PR merge ref so auth lifecycle changes
// are revalidated against the current main branch before release.
const loginSource = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const callbackSource = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');
const resetSource = fs.readFileSync('src/pages/ResetPassword.tsx', 'utf8');
const markerSource = fs.readFileSync('src/lib/passwordRecovery.ts', 'utf8');

test('forgot-password email returns to the established auth callback with recovery intent', () => {
  assert.match(loginSource, /resetPasswordForEmail\(normalizedEmail/);
  assert.match(loginSource, /redirectTo: `\$\{window\.location\.origin\}\/auth\/callback\?recovery=1`/);
  assert.match(loginSource, /If an account exists for that email/);
});

test('auth callback distinguishes PASSWORD_RECOVERY from normal sign-in', () => {
  assert.match(callbackSource, /event === "PASSWORD_RECOVERY" \|\| recoveryHint/);
  assert.match(callbackSource, /markPasswordRecoveryVerified\(\)/);
  assert.match(callbackSource, /setRecoveryReady\(true\)/);
  assert.match(callbackSource, /if \(recoveryReady\) return <ResetPassword \/>/);
  assert.match(callbackSource, /exchangeCodeForSession\(code\)/);
});

test('password recovery route requires a verified recovery marker and live session', () => {
  assert.match(resetSource, /hasVerifiedPasswordRecovery\(\)/);
  assert.match(resetSource, /supabase\.auth\.getSession\(\)/);
  assert.match(resetSource, /Open the password reset link from your email to continue/);
  assert.match(resetSource, /This password reset session has expired/);
});

test('password update validates confirmation, updates Supabase, clears recovery marker, and signs out', () => {
  assert.match(resetSource, /password\.length < 8/);
  assert.match(resetSource, /password !== confirmPassword/);
  assert.match(resetSource, /supabase\.auth\.updateUser\(\{ password \}\)/);
  assert.match(resetSource, /clearPasswordRecoveryMarker\(\)/);
  assert.match(resetSource, /await supabase\.auth\.signOut\(\)/);
  assert.match(resetSource, /Sign in with your new password to continue/);
});

test('recovery authorization marker is session-only', () => {
  assert.match(markerSource, /sessionStorage\.setItem\(PASSWORD_RECOVERY_MARKER, '1'\)/);
  assert.match(markerSource, /sessionStorage\.getItem\(PASSWORD_RECOVERY_MARKER\) === '1'/);
  assert.match(markerSource, /sessionStorage\.removeItem\(PASSWORD_RECOVERY_MARKER\)/);
  assert.doesNotMatch(markerSource, /localStorage/);
});
