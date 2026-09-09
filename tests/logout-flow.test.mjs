import assert from 'node:assert/strict';
import test from 'node:test';

import { logoutWithLocalFallback } from '../src/lib/logoutFlow.mjs';

test('logout succeeds globally without attempting a local fallback', async () => {
  const calls = [];
  const result = await logoutWithLocalFallback(async (options) => calls.push(options));

  assert.deepEqual(result, { scope: 'global' });
  assert.deepEqual(calls, [undefined]);
});

test('logout clears the local session when global revocation is unavailable', async () => {
  const globalError = new Error('provider unavailable');
  const calls = [];
  const result = await logoutWithLocalFallback(async (options) => {
    calls.push(options);
    if (!options?.localOnly) throw globalError;
  });

  assert.equal(result.scope, 'local');
  assert.equal(result.globalError, globalError);
  assert.deepEqual(calls, [undefined, { localOnly: true }]);
});

test('logout reports failure when the local session cannot be cleared', async () => {
  await assert.rejects(
    () => logoutWithLocalFallback(async () => { throw new Error('failed'); }),
    /Could not sign out on this device/,
  );
});
