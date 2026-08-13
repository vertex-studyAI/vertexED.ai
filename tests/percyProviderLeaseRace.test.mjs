import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';
import {
  ClassLimiter,
  MIN_WORKER_LEASE_MS,
  parseClassLimits,
  runWorkerLoop,
} from '../tools/percy-runtime/advanced.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('worker lease floor is scheduler-safe while direct store leases remain independently testable', () => {
  assert.equal(MIN_WORKER_LEASE_MS >= 1_000, true);
});

test('provider-slot handoff reserves the released slot for the queued waiter', async () => {
  const limiter = new ClassLimiter(parseClassLimits('default=1,remote=1'));
  const releaseFirst = await limiter.acquire('remote');
  let secondEntered = false;
  let releaseSecond;
  const second = limiter.acquire('remote').then((release) => {
    secondEntered = true;
    releaseSecond = release;
  });

  await sleep(5);
  assert.equal(secondEntered, false);
  assert.equal(limiter.activeFor('remote'), 1);

  releaseFirst();
  // The active reservation must never drop to zero during a queued handoff.
  assert.equal(limiter.activeFor('remote'), 1);
  await second;
  assert.equal(secondEntered, true);
  assert.equal(limiter.activeFor('remote'), 1);

  releaseSecond();
  assert.equal(limiter.activeFor('remote'), 0);
});

test('provider-capacity waiting cannot cause duplicate task execution under a short requested lease', async () => {
  for (let iteration = 0; iteration < 4; iteration += 1) {
    const dir = mkdtempSync(join(tmpdir(), `percy-provider-race-${iteration}-`));
    const store = new PercyStore(join(dir, 'percy.sqlite'), { maxActive: 2 });
    try {
      store.submit({ id: `a-${iteration}`, kind: 'sleep', payload: { providerClass: 'remote', ms: 180 } });
      store.submit({ id: `b-${iteration}`, kind: 'echo', payload: { providerClass: 'remote', value: iteration } });
      const limiter = new ClassLimiter(parseClassLimits('default=1,remote=1'));
      const executions = new Map();
      const execute = async (task) => {
        executions.set(task.id, (executions.get(task.id) ?? 0) + 1);
        if (task.kind === 'sleep') await sleep(task.payload.ms);
        return { id: task.id };
      };

      await Promise.all([
        runWorkerLoop({ store, execute, workerId: `w1-${iteration}`, limiter, leaseMs: 100, idleMs: 5, maxIdleMs: 300 }),
        runWorkerLoop({ store, execute, workerId: `w2-${iteration}`, limiter, leaseMs: 100, idleMs: 5, maxIdleMs: 300 }),
      ]);

      for (const id of [`a-${iteration}`, `b-${iteration}`]) {
        assert.equal(store.get(id).status, 'COMPLETE');
        assert.equal(store.get(id).attempts, 1);
        assert.equal(executions.get(id), 1);
      }
    } finally {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  }
});
