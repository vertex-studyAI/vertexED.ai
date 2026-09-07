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
