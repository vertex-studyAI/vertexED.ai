import assert from 'node:assert/strict';
import test from 'node:test';
import { authUiError, safeAuthReturnPath } from '../src/lib/authUi.mjs';

test('login return paths stay same-origin and avoid auth loops', () => {
  assert.equal(safeAuthReturnPath('/planner?week=2#today'), '/planner?week=2#today');
  assert.equal(safeAuthReturnPath('https://evil.example'), '/main');
  assert.equal(safeAuthReturnPath('//evil.example'), '/main');
  assert.equal(safeAuthReturnPath('/login'), '/main');
  assert.equal(safeAuthReturnPath('/signup'), '/main');
  assert.equal(safeAuthReturnPath('/auth/callback'), '/main');
  assert.equal(safeAuthReturnPath('\\evil'), '/main');
  assert.equal(safeAuthReturnPath(''), '/main');
  assert.equal(safeAuthReturnPath(/** @type {any} */ (null)), '/main');
});

test('login errors give a safe, actionable recovery path', () => {
  assert.match(authUiError(new Error('Invalid login credentials')), /Google sign-in/);
  assert.match(authUiError(new Error('Failed to fetch')), /connection/);
  assert.doesNotMatch(authUiError(new Error('secret backend detail')), /secret backend detail/);
  assert.match(authUiError(new Error('token exchange failed'), 'signup'), /account was created/i);
  assert.doesNotMatch(authUiError(new Error('token exchange failed'), 'signup'), /token exchange failed/);
  assert.match(authUiError(new Error('AuthApiError: weak password policy detail'), 'password-update'), /reset link/i);
  assert.doesNotMatch(authUiError(new Error('AuthApiError: weak password policy detail'), 'password-update'), /weak password policy detail/);
  assert.match(authUiError(new Error('AuthApiError: weak password policy detail'), 'initial-password'), /fresh invite/i);
  assert.doesNotMatch(authUiError(new Error('AuthApiError: weak password policy detail'), 'initial-password'), /weak password policy detail/);
  assert.match(authUiError(new Error('AuthApiError: identity already linked'), 'link-google'), /connect Google/i);
  assert.doesNotMatch(authUiError(new Error('AuthApiError: identity already linked'), 'link-google'), /identity already linked/);
});

test('Signup wires authUiError only on post-create login failures', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const signupSource = await readFile(join(root, 'src/pages/Signup.tsx'), 'utf8');
  assert.match(signupSource, /import \{ authUiError \} from "@\/lib\/authUi\.mjs"/);
  assert.match(signupSource, /authUiError\(loginErr, "signup"\)/);
  assert.doesNotMatch(signupSource, /authUiError\([^)]*,\s*"waitlist"/);
});

test('ResetPassword wires authUiError for password update failures only', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const resetSource = await readFile(join(root, 'src/pages/ResetPassword.tsx'), 'utf8');
  assert.match(resetSource, /import \{ authUiError \} from "@\/lib\/authUi\.mjs"/);
  assert.match(resetSource, /authUiError\(err, "password-update"\)/);
  assert.match(resetSource, /if \(signOutError\)[\s\S]*?throw new Error[\s\S]*?setSuccess\(true\)/);
  assert.match(resetSource, /Password updated, but/);
  assert.doesNotMatch(resetSource, /setError\(err instanceof Error \? err\.message/);
});

test('SetInitialPassword wires authUiError for password attach failures only', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/SetInitialPassword.tsx'), 'utf8');
  assert.match(source, /import \{ authUiError \} from "@\/lib\/authUi\.mjs"/);
  assert.match(source, /authUiError\(err, "initial-password"\)/);
  assert.doesNotMatch(source, /setError\(err instanceof Error \? err\.message/);
  assert.doesNotMatch(source, /authUiError\([^)]*,\s*"password-update"/);
});

test('ConnectGoogle toasts authUiError for linkIdentity failures', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/ConnectGoogle.tsx'), 'utf8');
  assert.match(source, /import \{ authUiError \} from "@\/lib\/authUi\.mjs"/);
  assert.match(source, /authUiError\(error, ["']link-google["']\)/);
  assert.doesNotMatch(source, /description:\s*error\.message/);
});

test('account settings toasts sanitize logout, Google link, delete, and export failures', async () => {
  assert.match(authUiError(new Error('AuthApiError: session revoke failed'), 'logout'), /signing out/i);
  assert.doesNotMatch(authUiError(new Error('AuthApiError: session revoke failed'), 'logout'), /session revoke failed/);
  assert.match(authUiError(new Error('postgres detail leak'), 'delete-account'), /delete the cloud account/i);
  assert.doesNotMatch(authUiError(new Error('postgres detail leak'), 'delete-account'), /postgres detail leak/);
  assert.match(authUiError(new Error('storage QuotaExceededError'), 'export-device'), /device backup/i);
  assert.doesNotMatch(authUiError(new Error('storage QuotaExceededError'), 'export-device'), /QuotaExceededError/);

  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/UserSettings.tsx'), 'utf8');
  assert.match(source, /import \{ authUiError \} from "@\/lib\/authUi\.mjs"/);
  assert.match(source, /authUiError\(error, ["']logout["']\)/);
  assert.match(source, /authUiError\(err, ["']link-google["']\)/);
  assert.match(source, /authUiError\(err, cloudDeleted \? ["']delete-account-cleanup["'] : ["']delete-account["']\)/);
  assert.match(source, /authUiError\(error, ["']export-account["']\)/);
  assert.match(source, /authUiError\(error, ['"]export-device['"]\)/);
  assert.doesNotMatch(source, /description:\s*(?:error|err) instanceof Error \? (?:error|err)\.message/);
});
