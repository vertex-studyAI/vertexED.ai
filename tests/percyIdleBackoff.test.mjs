import test from 'node:test';
import assert from 'node:assert/strict';
import { ClassLimiter, parseClassLimits, runWorkerLoop } from '../tools/percy-runtime/advanced.mjs';

const idleStore = () => ({ claim: () => null });

test('Percy worker idle polling backs off exponentially and caps at maxIdleSleepMs', async () => {
  const waits = [];
  const result = await runWorkerLoop({
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'idle-backoff',
    idleMs: 10,
    maxIdleSleepMs: 80,
    idleBackoffFactor: 2,
    sleepFn: async (ms) => { waits.push(ms); },
    shouldStop: () => waits.length >= 5,
  });
  assert.deepEqual(waits, [10, 20, 40, 80, 80]);
  assert.deepEqual(result, { workerId: 'idle-backoff', completed: 0, failed: 0 });
});

test('Percy worker jitter is deterministic with injected randomness and remains bounded', async () => {
  const waits = [];
  const samples = [0, 1, 0.5];
  let sampleIndex = 0;
  await runWorkerLoop({
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'idle-jitter',
    idleMs: 50,
    maxIdleSleepMs: 100,
    idleBackoffFactor: 1,
    idleJitterRatio: 0.2,
    random: () => samples[sampleIndex++],
    sleepFn: async (ms) => { waits.push(ms); },
    shouldStop: () => waits.length >= 3,
  });
  assert.deepEqual(waits, [40, 60, 50]);
  for (const wait of waits) assert.ok(wait >= 40 && wait <= 60);
});

test('Percy worker maxIdleMs caps the final sleep and terminates on an injected clock', async () => {
  const waits = [];
  const events = [];
  let now = 1_000;
  const result = await runWorkerLoop({
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'idle-timeout',
    idleMs: 50,
    maxIdleSleepMs: 100,
    idleBackoffFactor: 2,
    maxIdleMs: 120,
    nowFn: () => now,
    sleepFn: async (ms) => { waits.push(ms); now += ms; },
    logger: { write: (event, data) => { events.push({ event, data }); } },
  });
  assert.deepEqual(waits, [50, 70]);
  assert.deepEqual(result, { workerId: 'idle-timeout', completed: 0, failed: 0 });
  assert.deepEqual(events.find(({ event }) => event === 'worker_idle_timeout'), {
    event: 'worker_idle_timeout',
    data: { workerId: 'idle-timeout', idleForMs: 120, maxIdleMs: 120 },
  });
});

test('Percy worker maxIdleMs remains authoritative when positive jitter exceeds the remaining budget', async () => {
  const waits = [];
  let now = 1_000;
  const result = await runWorkerLoop({
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'idle-jitter-budget',
    idleMs: 80,
    maxIdleSleepMs: 200,
    idleBackoffFactor: 2,
    idleJitterRatio: 0.5,
    maxIdleMs: 100,
    random: () => 1,
    nowFn: () => now,
    sleepFn: async (ms) => { waits.push(ms); now += ms; },
  });
  assert.deepEqual(waits, [100]);
  assert.deepEqual(result, { workerId: 'idle-jitter-budget', completed: 0, failed: 0 });
});

test('Percy worker clock rollback cannot create a negative idle duration or premature timeout', async () => {
  const waits = [];
  const events = [];
  const readings = [1_000, 900];
  let readIndex = 0;
  const result = await runWorkerLoop({
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'idle-clock-rollback',
    idleMs: 50,
    maxIdleSleepMs: 100,
    maxIdleMs: 100,
    nowFn: () => readings[Math.min(readIndex++, readings.length - 1)],
    sleepFn: async (ms) => { waits.push(ms); },
    shouldStop: () => waits.length >= 1,
    logger: { write: (event, data) => { events.push({ event, data }); } },
  });
  assert.deepEqual(waits, [50]);
  assert.deepEqual(result, { workerId: 'idle-clock-rollback', completed: 0, failed: 0 });
  assert.equal(events.some(({ event }) => event === 'worker_idle_timeout'), false);
});

test('Percy worker resets idle backoff after successfully claiming work', async () => {
  const waits = [];
  let claimCalls = 0;
  let state = 'READY';
  const task = { id: 't1', kind: 'echo', payload: { providerClass: 'remote' } };
  const store = {
    claim: () => {
      claimCalls += 1;
      if (claimCalls <= 2) return null;
      if (state === 'READY') { state = 'CLAIMED'; return { ...task }; }
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
    execute: async () => ({ ok: true }),
    workerId: 'backoff-reset',
    limiter: new ClassLimiter(parseClassLimits('default=1,remote=1')),
    idleMs: 10,
    maxIdleSleepMs: 80,
    idleBackoffFactor: 2,
    sleepFn: async (ms) => { waits.push(ms); },
    shouldStop: () => state === 'COMPLETE' && waits.length >= 3,
  });
  assert.deepEqual(waits, [10, 20, 10]);
  assert.equal(state, 'COMPLETE');
  assert.equal(result.completed, 1);
  assert.equal(result.failed, 0);
});

test('Percy class limiter release handles are idempotent across queued handoffs', async () => {
  const limiter = new ClassLimiter(parseClassLimits('default=1,remote=1'));
  const releaseFirst = await limiter.acquire('remote');
  assert.equal(limiter.activeFor('remote'), 1);

  const secondAcquire = limiter.acquire('remote');
  releaseFirst();
  const releaseSecond = await secondAcquire;
  assert.equal(limiter.activeFor('remote'), 1);

  assert.equal(releaseFirst(), false);
  assert.equal(limiter.activeFor('remote'), 1);
  assert.equal(releaseSecond(), true);
  assert.equal(limiter.activeFor('remote'), 0);
  assert.equal(releaseSecond(), false);
  assert.equal(limiter.activeFor('remote'), 0);
});

test('Percy worker validates timeout, idle backoff, jitter, sleep, stop, random, and clock controls fail closed', async () => {
  const base = {
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'validation',
    shouldStop: () => true,
  };
  await assert.rejects(() => runWorkerLoop({ ...base, timeoutMs: 0 }), /timeoutMs must be >=1/);
  await assert.rejects(() => runWorkerLoop({ ...base, timeoutMs: Number.NaN }), /timeoutMs must be >=1/);
  await assert.rejects(() => runWorkerLoop({ ...base, timeoutMs: Number.POSITIVE_INFINITY }), /timeoutMs must be >=1/);
  await assert.rejects(() => runWorkerLoop({ ...base, idleMs: 0 }), /idleMs must be >=1/);
  await assert.rejects(() => runWorkerLoop({ ...base, idleMs: 10, maxIdleSleepMs: 9 }), /maxIdleSleepMs must be >= idleMs/);
  await assert.rejects(() => runWorkerLoop({ ...base, idleBackoffFactor: 0.9 }), /idleBackoffFactor must be in \[1,10\]/);
  await assert.rejects(() => runWorkerLoop({ ...base, idleBackoffFactor: 11 }), /idleBackoffFactor must be in \[1,10\]/);
  await assert.rejects(() => runWorkerLoop({ ...base, idleJitterRatio: -0.1 }), /idleJitterRatio must be in \[0,1\]/);
  await assert.rejects(() => runWorkerLoop({ ...base, idleJitterRatio: 1.1 }), /idleJitterRatio must be in \[0,1\]/);
  await assert.rejects(() => runWorkerLoop({ ...base, maxIdleMs: -1 }), /maxIdleMs must be >=0/);
  await assert.rejects(() => runWorkerLoop({ ...base, sleepFn: null }), /sleepFn must be a function/);
  await assert.rejects(() => runWorkerLoop({ ...base, random: null }), /random must be a function/);
  await assert.rejects(() => runWorkerLoop({ ...base, nowFn: null }), /nowFn must be a function/);
  await assert.rejects(() => runWorkerLoop({ ...base, nowFn: () => Number.NaN }), /nowFn\(\) must return a finite number/);
  await assert.rejects(() => runWorkerLoop({ ...base, shouldStop: null }), /shouldStop must be a function/);

  let stopped = false;
  await assert.rejects(() => runWorkerLoop({
    ...base,
    shouldStop: () => stopped,
    random: () => 1.01,
    sleepFn: async () => { stopped = true; },
  }), /random\(\) must return a number in \[0,1\]/);
});

test('Percy worker emits start/stop observability with resolved idle controls', async () => {
  const events = [];
  const logger = { write: (event, data) => { events.push({ event, data }); } };
  const waits = [];
  await runWorkerLoop({
    store: idleStore(),
    execute: async () => ({ ok: true }),
    workerId: 'idle-observability',
    logger,
    idleMs: 7,
    maxIdleSleepMs: 21,
    idleBackoffFactor: 3,
    idleJitterRatio: 0.25,
    sleepFn: async (ms) => { waits.push(ms); },
    random: () => 0.5,
    shouldStop: () => waits.length >= 1,
  });
  assert.deepEqual(events[0], {
    event: 'worker_loop_start',
    data: {
      workerId: 'idle-observability',
      requestedLeaseMs: 30000,
      effectiveLeaseMs: 30000,
      timeoutMs: 10000,
      idleMs: 7,
      maxIdleSleepMs: 21,
      idleBackoffFactor: 3,
      idleJitterRatio: 0.25,
      maxIdleMs: 0,
    },
  });
  assert.deepEqual(events.at(-1), {
    event: 'worker_loop_stop',
    data: { workerId: 'idle-observability', completed: 0, failed: 0 },
  });
});