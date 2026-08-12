import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';
import {
  backupDatabase, ClassLimiter, JsonlLogger, parseClassLimits, payloadBytes,
  restoreDatabase, runWorkerLoop, safeSubmit, validateSubmission,
} from '../tools/percy-runtime/advanced.mjs';

test('class limits parse and validate', () => {
  const m = parseClassLimits('default=2,remote=4,local=1');
  assert.equal(m.get('default'), 2); assert.equal(m.get('remote'), 4); assert.equal(m.get('local'), 1);
  assert.throws(() => parseClassLimits('x=0'), /invalid class limit/);
});

test('payload and kind bounds reject unsafe queue growth', () => {
  assert.equal(payloadBytes({ message: 'hi' }) > 0, true);
  assert.equal(validateSubmission({ kind: 'echo', payload: { ok: true } }).kind, 'echo');
  assert.throws(() => validateSubmission({ kind: 'shell', payload: {} }), /not allowed/);
  assert.throws(() => validateSubmission({ kind: 'echo', payload: { x: '12345' } }, { maxPayloadBytes: 4 }), /payload too large/);
  const submitted = [];
  const store = { counts: () => ({ READY: submitted.length }), submit: (task) => { submitted.push(task); return `t${submitted.length}`; } };
  assert.equal(safeSubmit(store, { kind: 'echo', payload: {} }, { maxReady: 1 }).id, 't1');
  assert.throws(() => safeSubmit(store, { kind: 'echo', payload: {} }, { maxReady: 1 }), /queue limit reached/);
});

test('JSONL logger redacts common secret keys recursively', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-log-'));
  try {
    const path = join(dir, 'events.jsonl'); const log = new JsonlLogger(path);
    log.write('x', { token: 'abc', nested: { apiKey: 'def', safe: 'yes' } });
    const row = JSON.parse(readFileSync(path, 'utf8').trim());
    assert.equal(row.token, '[REDACTED]'); assert.equal(row.nested.apiKey, '[REDACTED]'); assert.equal(row.nested.safe, 'yes');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('online SQLite backup and restore preserve committed rows', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-backup-'));
  let db;
  try {
    const path = join(dir, 'db.sqlite'); const bak = join(dir, 'backups', 'db.sqlite'); const restored = join(dir, 'restored.sqlite');
    db = new DatabaseSync(path); db.exec('CREATE TABLE t(x TEXT); INSERT INTO t VALUES (\'a\'),(\'b\');');
    const b = await backupDatabase(db, bak);
    db.exec('INSERT INTO t VALUES (\'c\');');
    const r = await restoreDatabase(bak, restored);
    const restoredDb = new DatabaseSync(restored, { readOnly: true });
    try { assert.equal(restoredDb.prepare('SELECT COUNT(*) AS n FROM t').get().n, 2); } finally { restoredDb.close(); }
    assert.equal(b.sha256, r.sha256);
  } finally { try { db?.close(); } catch (error) { void error; } rmSync(dir, { recursive: true, force: true }); }
});

test('ClassLimiter enforces per-class concurrency', async () => {
  const limiter = new ClassLimiter(parseClassLimits('default=1,remote=2'));
  const r1 = await limiter.acquire('remote'); const r2 = await limiter.acquire('remote');
  let acquired = false;
  const p = limiter.acquire('remote').then((release) => { acquired = true; release(); });
  await new Promise((r) => setTimeout(r, 10)); assert.equal(acquired, false);
  r1(); await p; assert.equal(acquired, true); r2();
});

test('worker loop completes bounded task with heartbeat and evidence gate', async () => {
  const task = { id: 't1', kind: 'echo', payload: { providerClass: 'remote' } };
  let state = 'READY'; let evidence = 0; let heartbeats = 0;
  const store = {
    claim: () => state === 'READY' ? (state = 'CLAIMED', { ...task }) : null,
    start: () => state === 'CLAIMED' ? (state = 'RUNNING', true) : false,
    heartbeat: () => { heartbeats += 1; return true; },
    addEvidence: () => { evidence += 1; },
    markVerifying: () => state === 'RUNNING' ? (state = 'VERIFYING', true) : false,
    verifyComplete: () => evidence > 0 && state === 'VERIFYING' ? (state = 'COMPLETE', true) : false,
    fail: () => { state = 'FAILED'; return true; },
  };
  const result = await runWorkerLoop({
    store, workerId: 'w1', leaseMs: 120, idleMs: 5, maxIdleMs: 25,
    limiter: new ClassLimiter(parseClassLimits('default=1,remote=1')),
    execute: async () => ({ ok: true }),
  });
  assert.equal(state, 'COMPLETE'); assert.equal(evidence, 1); assert.equal(result.completed, 1); assert.equal(result.failed, 0);
  assert.equal(heartbeats > 0, true);
});

test('worker waiting on provider capacity retains its claim lease and executes once', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-capacity-'));
  const store = new PercyStore(join(dir, 'percy.sqlite'), { maxActive: 2 });
  try {
    store.submit({ id: 'a', kind: 'sleep', payload: { providerClass: 'remote', ms: 160 } });
    store.submit({ id: 'b', kind: 'echo', payload: { providerClass: 'remote', value: 2 } });
    const limiter = new ClassLimiter(parseClassLimits('default=1,remote=1'));
    const executions = new Map();
    const execute = async (task) => {
      executions.set(task.id, (executions.get(task.id) ?? 0) + 1);
      if (task.id === 'a') await new Promise((resolve) => setTimeout(resolve, 160));
      return { id: task.id };
    };
    await Promise.all([
      runWorkerLoop({ store, execute, workerId: 'w1', limiter, leaseMs: 100, idleMs: 5, maxIdleMs: 240 }),
      runWorkerLoop({ store, execute, workerId: 'w2', limiter, leaseMs: 100, idleMs: 5, maxIdleMs: 240 }),
    ]);
    assert.equal(store.get('a').status, 'COMPLETE');
    assert.equal(store.get('b').status, 'COMPLETE');
    assert.equal(executions.get('a'), 1);
    assert.equal(executions.get('b'), 1);
    assert.equal(store.get('b').attempts, 1);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
