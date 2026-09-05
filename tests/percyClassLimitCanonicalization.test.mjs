import assert from 'node:assert/strict';
import test from 'node:test';

import { parseClassLimits, runWorkerLoop } from '../tools/percy-runtime/advanced.mjs';

test('shared class-limit parser rejects duplicate and ambiguous declarations', () => {
  const limits = parseClassLimits(' default = 2 , gpu = 3 ');
  assert.equal(limits.get('default'), 2);
  assert.equal(limits.get('gpu'), 3);

  assert.throws(() => parseClassLimits('default=2,gpu=2,gpu=3'), /duplicate class limit: gpu/);
  assert.throws(() => parseClassLimits('default=2,gpu=2=3'), /invalid class limit: gpu=2=3/);
});

test('worker canonicalizes task provider class before limiter acquisition', async () => {
  const task = { id: 'task-1', kind: 'echo', payload: { providerClass: ' gpu ' } };
  let claimCount = 0;
  let acquiredClass = null;

  const store = {
    claim() {
      claimCount += 1;
      return claimCount === 1 ? task : null;
    },
    heartbeat() { return true; },
    start() { return true; },
    addEvidence() {},
    markVerifying() { return true; },
    verifyComplete() { return true; },
    fail() { return true; },
  };
  const limiter = {
    async acquire(name) {
      acquiredClass = name;
      return () => true;
    },
  };

  const result = await runWorkerLoop({
    store,
    execute: async () => ({ ok: true }),
    workerId: 'canonical-class-worker',
    limiter,
    leaseMs: 1_000,
    timeoutMs: 1_000,
    idleMs: 1,
    maxIdleSleepMs: 1,
    shouldStop: () => claimCount >= 2,
    sleepFn: async () => {},
    random: () => 0.5,
    nowFn: () => 0,
  });

  assert.equal(acquiredClass, 'gpu');
  assert.deepEqual(result, { workerId: 'canonical-class-worker', completed: 1, failed: 0 });
});
