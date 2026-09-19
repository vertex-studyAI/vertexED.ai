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
});
