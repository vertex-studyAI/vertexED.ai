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
