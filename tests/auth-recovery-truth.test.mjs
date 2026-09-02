import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('auth callback removes credentials and provider errors from browser history', async () => {
  const source = await readSource('src/pages/AuthCallback.tsx');

  assert.match(source, /const safeCallbackPath = recoveryHint/);
  assert.match(source, /window\.history\.replaceState\(\{\}, document\.title, safeCallbackPath\)/);
  assert.match(source, /if \(recoveryHint && inviteHint\)/);
  assert.match(source, /conflicting account actions/);

  const sanitizeIndex = source.indexOf('window.history.replaceState({}, document.title, safeCallbackPath)');
  const exchangeIndex = source.indexOf('supabase.auth.exchangeCodeForSession(code)');
  assert.ok(sanitizeIndex > -1 && sanitizeIndex < exchangeIndex, 'callback URL must be sanitized before code exchange');

  assert.doesNotMatch(source, /Authentication could not be completed: \$\{authError\}/);
  assert.doesNotMatch(source, /setError\(exchangeError\.message\)/);
  assert.doesNotMatch(source, /setError\(sessionError\.message\)/);
  assert.match(source, /The authentication link could not be verified/);
  assert.match(source, /Your authenticated session could not be verified/);
});

test('protected routes distinguish pending, rejected, and unavailable access truth', async () => {
  const source = await readSource('src/components/ProtectedRoute.tsx');

  assert.match(source, /"pending" \| "rejected" \| "unavailable"/);
  assert.match(source, /\.catch\(\(\) => active && setAccess\("unavailable"\)\)/);
  assert.match(source, /if \(access === "unavailable"\) return <WaitlistUnavailable/);
  assert.match(source, /if \(access === "rejected"\) return <WaitlistRejected/);
  assert.match(source, /if \(access === "pending"\) return <WaitlistPending/);
  assert.match(source, /Your access status was not changed/);
  assert.match(source, /setRetryAttempt\(\(attempt\) => attempt \+ 1\)/);
  assert.match(source, /role="alert"/);
  assert.match(source, /location\.pathname === "\/connect-google" \|\| location\.pathname === "\/onboarding"/);
  assert.match(source, /!isOnboardingComplete\(user\) && !isPreOnboardingRoute/);
  assert.doesNotMatch(source, /\.catch\(\(\) => active && setAccess\("pending"\)\)/);
});

test('resolved auth state cancels delayed loading fallback', async () => {
  const source = await readSource('src/contexts/AuthContext.tsx');

  assert.match(source, /const clearLoadingSafetyTimer = \(\) =>/);
  assert.match(source, /window\.clearTimeout\(loadingSafetyTimer\)/);

  const sessionResolution = source.indexOf('const { data, error } = await supabase.auth.getSession()');
  const firstClearAfterSession = source.indexOf('clearLoadingSafetyTimer()', sessionResolution);
  const authEvent = source.indexOf('supabase.auth.onAuthStateChange');
  const firstClearAfterEvent = source.indexOf('clearLoadingSafetyTimer()', authEvent);

  assert.ok(firstClearAfterSession > sessionResolution && firstClearAfterSession < authEvent);
  assert.ok(firstClearAfterEvent > authEvent);
  assert.match(source, /return \(\) => \{[\s\S]*clearLoadingSafetyTimer\(\);[\s\S]*sub\.subscription\.unsubscribe\(\)/);
});
