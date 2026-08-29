import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const loginSource = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const callbackSource = fs.readFileSync('src/pages/AuthCallback.tsx', 'utf8');
const resetSource = fs.readFileSync('src/pages/ResetPassword.tsx', 'utf8');
const markerSource = fs.readFileSync('src/lib/passwordRecovery.ts', 'utf8');

test('forgot-password email returns to the established auth callback with recovery intent', () => {
  assert.match(loginSource, /resetPasswordForEmail\(normalizedEmail/);
  assert.match(loginSource, /redirectTo: `\$\{window\.location\.origin\}\/auth\/callback\?recovery=1`/);
  assert.match(loginSource, /If an account exists for that email/);
});

test('auth callback requires the genuine Supabase PASSWORD_RECOVERY event', () => {
  assert.match(callbackSource, /if \(recoveryHint && event !== "PASSWORD_RECOVERY"\) return/);
  assert.match(callbackSource, /if \(event === "PASSWORD_RECOVERY"\)/);
  assert.doesNotMatch(callbackSource, /event === "PASSWORD_RECOVERY" \|\| recoveryHint/);
  assert.match(callbackSource, /markPasswordRecoveryVerified\(session\.user\.id\)/);
  assert.match(callbackSource, /setRecoveryReady\(true\)/);
  assert.match(callbackSource, /if \(recoveryReady\) return <ResetPassword \/>/);
  assert.match(callbackSource, /exchangeCodeForSession\(code\)/);
});

test('recovery URL hints fail closed while waiting for a verified recovery event', () => {
  assert.match(callbackSource, /if \(data\.session && !recoveryHint\)/);
  assert.match(callbackSource, /if \(recoveryHint\) \{[\s\S]*?armCallbackTimeout/);
  assert.match(callbackSource, /did not establish a verified recovery session/);
});

test('password recovery route binds the verified marker to the live account', () => {
  assert.match(resetSource, /supabase\.auth\.getSession\(\)/);
  assert.match(resetSource, /hasVerifiedPasswordRecovery\(data\.session\.user\.id\)/);
  assert.match(resetSource, /Open the password reset link from your email to continue/);
  assert.match(resetSource, /This password reset session has expired/);
});

test('password update validates confirmation, updates Supabase, clears recovery marker, and verifies signout before success', () => {
  assert.match(resetSource, /password\.length < 8/);
  assert.match(resetSource, /password !== confirmPassword/);
  assert.match(resetSource, /supabase\.auth\.updateUser\(\{ password \}\)/);
  assert.match(resetSource, /clearPasswordRecoveryMarker\(\)/);
  assert.match(resetSource, /const \{ error: signOutError \} = await supabase\.auth\.signOut\(\)/);
  assert.match(resetSource, /if \(signOutError\)/);
  assert.match(resetSource, /could not verify that this recovery session was signed out/);
  assert.match(resetSource, /if \(signOutError\)[\s\S]*?throw new Error[\s\S]*?setSuccess\(true\)/);
  assert.doesNotMatch(resetSource, /await supabase\.auth\.signOut\(\);\s*setSuccess\(true\)/);
  assert.match(resetSource, /Sign in with your new password to continue/);
});

test('recovery authorization marker is session-only and account-bound', () => {
  assert.match(markerSource, /sessionStorage\.setItem\(PASSWORD_RECOVERY_MARKER, normalizedUserId\)/);
  assert.match(markerSource, /sessionStorage\.getItem\(PASSWORD_RECOVERY_MARKER\) === normalizedUserId/);
  assert.match(markerSource, /sessionStorage\.removeItem\(PASSWORD_RECOVERY_MARKER\)/);
  assert.doesNotMatch(markerSource, /setItem\(PASSWORD_RECOVERY_MARKER, '1'\)/);
  assert.doesNotMatch(markerSource, /localStorage/);
});
