import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const syncSource = fs.readFileSync('src/lib/learnerStateSync.ts', 'utf8');
const authSource = fs.readFileSync('src/lib/apiAuth.ts', 'utf8');

test('background learner sync binds account scope and token for the entire request', () => {
  assert.match(syncSource, /const scope = getUserContentStorageScope\(\)/);
  assert.match(syncSource, /const accessToken = await getAccessToken\(\)/);
  assert.match(syncSource, /authFetchWithAccessToken\('\/api\/learner-state', accessToken/);
  assert.match(syncSource, /removeConfirmedWrites\(confirmed, scope\)/);
  assert.match(syncSource, /userContentStorageKeys\(scope\)/);
  assert.match(syncSource, /getUserContentStorageScope\(\) !== scope/);
  assert.match(syncSource, /putDurableOutboxRecord/);
  assert.match(syncSource, /deleteDurableOutboxRecord/);
});

test('bound auth requests never refresh into a different active account', () => {
  const block = authSource.match(/export async function authFetchWithAccessToken[\s\S]*?\n}\n/)?.[0] ?? '';
  assert.match(block, /headers\.set\('Authorization', `Bearer \$\{accessToken\}`\)/);
  assert.doesNotMatch(block, /refreshAccessToken/);
});

test('general auth requests reject stale responses after the active account changes', () => {
  const block = authSource.match(/export async function authFetch\(input[\s\S]*?\n}\n/)?.[0] ?? '';

  assert.match(authSource, /class AccountScopeChangedError extends Error/);
  assert.match(authSource, /function assertAccountScope\(accountScope:/);
  assert.match(block, /assertAccountScope\(accountScope\);\n {4}let response = await performRequest\(headers\);\n {4}assertAccountScope\(accountScope\);/);
  assert.match(block, /response = await performRequest\(retryHeaders\);\n {8}assertAccountScope\(accountScope\);/);
  assert.match(block, /const resultBody = response\.ok \? await response\.clone\(\)\.json\(\)\.catch\(\(\) => null\) : null;\n {6}assertAccountScope\(accountScope\);/);
  assert.match(block, /assertAccountScope\(accountScope\);\n {4}return response;/);
});

test('account switches are not mislabeled as network or deletion failures', () => {
  const block = authSource.match(/export async function authFetch\(input[\s\S]*?\n}\n/)?.[0] ?? '';

  assert.match(block, /const accountScopeChanged = error instanceof AccountScopeChangedError;/);
  assert.match(block, /if \(shouldTrackAiRequest && !accountScopeChanged\)/);
  assert.match(block, /if \(shouldTrackAccountDeletion && !accountScopeChanged\)/);
});
