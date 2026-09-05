import assert from 'node:assert/strict';
import test from 'node:test';

import { runWorkerLoop } from '../tools/percy-runtime/advanced.mjs';

const baseWorker = () => ({
  store: { claim: () => null },
  execute: async () => ({}),
  workerId: 'timer-bound-test',
  shouldStop: () => true,
});

const MAX_TIMER_MS = 2_147_483_647;

for (const [name, minimum] of [
  ['leaseMs', 100],
  ['timeoutMs', 1],
  ['idleMs', 1],
  ['maxIdleSleepMs', 1],
  ['maxIdleMs', 0],
]) {
  test(`runWorkerLoop rejects fractional ${name}`, async () => {
    await assert.rejects(
      runWorkerLoop({ ...baseWorker(), [name]: minimum + 0.5 }),
      new RegExp(`${name} must be an integer`),
    );
  });

  test(`runWorkerLoop rejects overflow ${name}`, async () => {
    await assert.rejects(
      runWorkerLoop({ ...baseWorker(), [name]: MAX_TIMER_MS + 1 }),
      new RegExp(`${name} must be an integer`),
    );
  });

  test(`runWorkerLoop rejects non-finite ${name}`, async () => {
    await assert.rejects(
      runWorkerLoop({ ...baseWorker(), [name]: Number.POSITIVE_INFINITY }),
      new RegExp(`${name} must be an integer`),
    );
  });
}

test('runWorkerLoop preserves direct-store sub-second lease compatibility', async () => {
  const result = await runWorkerLoop({ ...baseWorker(), leaseMs: 100 });
  assert.deepEqual(result, { workerId: 'timer-bound-test', completed: 0, failed: 0 });
});

test('runWorkerLoop accepts the Node timer ceiling', async () => {
  const result = await runWorkerLoop({
    ...baseWorker(),
    leaseMs: MAX_TIMER_MS,
    timeoutMs: MAX_TIMER_MS,
    idleMs: MAX_TIMER_MS,
    maxIdleSleepMs: MAX_TIMER_MS,
    maxIdleMs: MAX_TIMER_MS,
  });
  assert.deepEqual(result, { workerId: 'timer-bound-test', completed: 0, failed: 0 });
});
