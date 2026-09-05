import test from 'node:test';
import assert from 'node:assert/strict';
import { ClassLimiter, parseClassLimits, runWorkerLoop } from '../tools/percy-runtime/advanced.mjs';

test('Percy maxIdleMs starts after claimed task activity finishes, not when the task was claimed', async () => {
  const waits = [];
  const events = [];
  let now = 1_000;
  let state = 'READY';
  const task = { id: 'long-task', kind: 'echo', payload: { providerClass: 'remote' } };

  const store = {
    claim: () => {
      if (state === 'READY') {
        state = 'CLAIMED';
        return { ...task };
      }
      return null;
    },
    heartbeat: () => true,
    start: () => state === 'CLAIMED' ? (state = 'RUNNING', true) : false,
    addEvidence: () => {},
    markVerifying: () => state === 'RUNNING' ? (state = 'VERIFYING', true) : false,
    verifyComplete: () => state === 'VERIFYING' ? (state = 'COMPLETE', true) : false,
    fail: () => { state = 'FAILED'; return true; },
  };

  const result = await runWorkerLoop({
    store,
    execute: async () => {
      // Simulate work lasting far longer than the configured idle timeout.
      now += 500;
      return { ok: true };
    },
    workerId: 'idle-after-work',
    limiter: new ClassLimiter(parseClassLimits('default=1,remote=1')),
    idleMs: 50,
    maxIdleSleepMs: 50,
    maxIdleMs: 100,
    nowFn: () => now,
    sleepFn: async (ms) => { waits.push(ms); now += ms; },
    shouldStop: () => state === 'COMPLETE' && waits.length >= 1,
    logger: { write: (event, data) => { events.push({ event, data }); } },
  });

  assert.equal(state, 'COMPLETE');
  assert.deepEqual(waits, [50]);
  assert.equal(events.some(({ event }) => event === 'worker_idle_timeout'), false);
  assert.deepEqual(result, { workerId: 'idle-after-work', completed: 1, failed: 0 });
});
