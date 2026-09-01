import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { PercyStore } from '../tools/percy-runtime/core.mjs';
import { createVerifiedBackup } from '../tools/percy-runtime/backup.mjs';

function fresh(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'percy-'));
  return { dir, db: join(dir, 'percy.sqlite'), store: new PercyStore(join(dir, 'percy.sqlite'), options) };
}
const cleanup = (f) => { try { f.store?.close(); } catch (error) { void error; } rmSync(f.dir, { recursive: true, force: true }); };

test('READY -> CLAIMED -> RUNNING -> VERIFYING -> COMPLETE survives reopen', () => {
  const f = fresh();
  try {
    const id = f.store.submit({ kind: 'echo', payload: { x: 1 } });
    assert.equal(f.store.get(id).status, 'READY');
    assert.equal(f.store.claim('w1', 1000).status, 'CLAIMED');
    assert.equal(f.store.start(id, 'w1'), true);
    assert.equal(f.store.get(id).status, 'RUNNING');
    f.store.addEvidence(id, 'tests', { passed: true });
    assert.equal(f.store.markVerifying(id, 'w1', { ok: true }), true);
    assert.equal(f.store.get(id).status, 'VERIFYING');
    assert.equal(f.store.verifyComplete(id), true);
    assert.equal(f.store.get(id).status, 'COMPLETE');
    f.store.close(); f.store = new PercyStore(f.db);
    assert.equal(f.store.get(id).status, 'COMPLETE');
    assert.deepEqual(f.store.integrityCheck(), ['ok']);
  } finally { cleanup(f); }
});

test('evidence gate blocks VERIFYING -> COMPLETE without evidence', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 1000); f.store.start('t', 'w1');
    assert.equal(f.store.markVerifying('t', 'w1', {}), true);
    assert.equal(f.store.verifyComplete('t'), false);
    assert.equal(f.store.get('t').status, 'VERIFYING');
  } finally { cleanup(f); }
});

test('default concurrency cap permits two active claims and rejects the third', () => {
  const f = fresh();
  try {
    for (const id of ['a','b','c']) f.store.submit({ id });
    assert.equal(f.store.claim('w1', 10000).id, 'a');
    assert.equal(f.store.claim('w2', 10000).id, 'b');
    assert.equal(f.store.activeCount(), 2);
    assert.equal(f.store.claim('w3', 10000), null);
  } finally { cleanup(f); }
});

test('queue depth cap rejects runaway READY submissions and releases capacity after claim', () => {
  const f = fresh({ maxQueued: 2 });
  try {
    f.store.submit({ id: 'a' });
    f.store.submit({ id: 'b' });
    assert.equal(f.store.queueDepth(), 2);
    assert.throws(() => f.store.submit({ id: 'c' }), /queue depth limit reached/);
    assert.equal(f.store.claim('w1', 1000).id, 'a');
    assert.equal(f.store.queueDepth(), 1);
    assert.equal(f.store.submit({ id: 'c' }), 'c');
    assert.equal(f.store.queueDepth(), 2);
  } finally { cleanup(f); }
});

test('payload byte cap rejects oversized task payloads before insertion', () => {
  const f = fresh({ maxPayloadBytes: 8 });
  try {
    assert.throws(
      () => f.store.submit({ id: 'large', payload: { x: '1234567890' } }),
      /payload exceeds maxPayloadBytes/,
    );
    assert.equal(f.store.get('large'), null);
    assert.equal(f.store.submit({ id: 'small', payload: { x: 1 } }), 'small');
  } finally { cleanup(f); }
});

test('verified online backup restores task, evidence, and failure history', async () => {
  const f = fresh();
  let restored;
  try {
    f.store.submit({ id: 'backup-task', payload: { durable: true }, maxAttempts: 2 });
    f.store.claim('backup-worker', 1000);
    f.store.start('backup-task', 'backup-worker');
    f.store.addEvidence('backup-task', 'pre-failure-checkpoint', { ok: true });
    f.store.fail('backup-task', 'backup-worker', new Error('retry me'), 0);

    const backupPath = join(f.dir, 'backups', 'percy.sqlite');
    const result = await createVerifiedBackup(f.store.db, f.store.path, backupPath);
    assert.deepEqual(result.integrity, ['ok']);
    assert.equal(result.counts.tasks, 1);
    assert.equal(result.counts.evidence, 1);
    assert.equal(result.counts.failures, 1);

    await assert.rejects(
      createVerifiedBackup(f.store.db, f.store.path, backupPath),
      /backup output already exists/,
    );
    await assert.rejects(
      createVerifiedBackup(f.store.db, f.store.path, f.store.path),
      /backup output must differ/,
    );

    restored = new PercyStore(backupPath);
    assert.equal(restored.get('backup-task').status, 'READY');
    assert.deepEqual(restored.get('backup-task').payload, { durable: true });
    assert.equal(restored.listEvidence('backup-task').length, 1);
    assert.equal(restored.db.prepare('SELECT COUNT(*) AS n FROM failures WHERE task_id=?').get('backup-task').n, 1);
    assert.deepEqual(restored.integrityCheck(), ['ok']);
  } finally {
    try { restored?.close(); } catch (error) { void error; }
    cleanup(f);
  }
});

test('active lease prevents duplicate execution', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' });
    assert.equal(f.store.claim('w1', 10000).id, 't');
    assert.equal(f.store.claim('w2', 10000), null);
  } finally { cleanup(f); }
});

test('expired lease is recovered and re-claimed', async () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 100); f.store.start('t', 'w1');
    await new Promise(resolve => setTimeout(resolve, 125));
    const recovered = f.store.claim('w2', 1000);
    assert.equal(recovered.id, 't'); assert.equal(recovered.owner_id, 'w2'); assert.equal(recovered.attempts, 2);
  } finally { cleanup(f); }
});

test('expired owner cannot start or resurrect its lease', async () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' });
    f.store.claim('w1', 100);
    await new Promise(resolve => setTimeout(resolve, 125));
    assert.equal(f.store.start('t', 'w1'), false);
    assert.equal(f.store.heartbeat('t', 'w1', 1000), false);
    const recovered = f.store.claim('w2', 1000);
    assert.equal(recovered.id, 't');
    assert.equal(recovered.owner_id, 'w2');
  } finally { cleanup(f); }
});

test('ownership checks block stale worker transitions', async () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 100); f.store.start('t', 'w1');
    await new Promise(resolve => setTimeout(resolve, 125));
    f.store.claim('w2', 1000); f.store.start('t', 'w2');
    assert.equal(f.store.markVerifying('t', 'w1', {}), false);
    f.store.addEvidence('t', 'tests', { ok: true });
    assert.equal(f.store.markVerifying('t', 'w2', {}), true);
    assert.equal(f.store.verifyComplete('t'), true);
  } finally { cleanup(f); }
});

test('bounded retries preserve failures and end in FAILED', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't', kind: 'fail', maxAttempts: 2 });
    f.store.claim('w1', 1000); f.store.start('t', 'w1'); f.store.fail('t', 'w1', new Error('x'), 0);
    assert.equal(f.store.get('t').status, 'READY');
    f.store.claim('w2', 1000); f.store.start('t', 'w2'); f.store.fail('t', 'w2', new Error('x'), 0);
    assert.equal(f.store.get('t').status, 'FAILED');
    assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM failures WHERE task_id=?').get('t').n, 2);
  } finally { cleanup(f); }
});

test('pause blocks new claims and resume restores them', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.setPaused(true); assert.equal(f.store.claim('w1'), null);
    f.store.setPaused(false); assert.equal(f.store.claim('w1').id, 't');
  } finally { cleanup(f); }
});

test('graceful worker stop can preserve task as STALE then requeue', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 't' }); f.store.claim('w1', 1000); f.store.start('t', 'w1');
    assert.equal(f.store.markStale('t', 'w1', 'SIGTERM'), true); assert.equal(f.store.get('t').status, 'STALE');
    assert.equal(f.store.requeueStale('t'), true); assert.equal(f.store.get('t').status, 'READY');
  } finally { cleanup(f); }
});

test('legacy queued/running/succeeded/failed database migrates additively', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-legacy-'));
  const db = join(dir, 'percy.sqlite');
  let store;
  try {
    const legacy = new DatabaseSync(db);
    legacy.exec(`
      CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO meta(key,value) VALUES ('paused','0');
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('queued','running','succeeded','failed')),
        attempts INTEGER NOT NULL DEFAULT 0, max_attempts INTEGER NOT NULL DEFAULT 3,
        owner_id TEXT, lease_expires_at INTEGER, heartbeat_at INTEGER,
        available_at INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
        result TEXT, error TEXT
      );
    `);
    const put = legacy.prepare('INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const t = Date.now();
    put.run('q','echo','{}','queued',0,3,null,null,null,t,t,t,null,null);
    put.run('r','echo','{}','running',1,3,'old-worker',t+1000,t,t,t,t,null,null);
    put.run('s','echo','{}','succeeded',1,3,null,null,null,t,t,t,'{"ok":true}',null);
    put.run('f','echo','{}','failed',3,3,null,null,null,t,t,t,null,'boom');
    legacy.close();

    store = new PercyStore(db);
    assert.equal(store.get('q').status, 'READY');
    assert.equal(store.get('r').status, 'STALE');
    assert.equal(store.get('s').status, 'COMPLETE');
    assert.equal(store.get('f').status, 'FAILED');
    assert.equal(store.get('r').owner_id, null);
    assert.deepEqual(store.get('s').result, { ok: true });
    assert.deepEqual(store.integrityCheck(), ['ok']);
    assert.equal(store.db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='evidence'").get().n, 1);
  } finally {
    try { store?.close(); } catch (error) { void error; }
    rmSync(dir, { recursive: true, force: true });
  }
});
