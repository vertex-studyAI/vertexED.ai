import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-attempt-evidence-'));
  return { dir, db: join(dir, 'percy.sqlite'), store: new PercyStore(join(dir, 'percy.sqlite')) };
}

function cleanup(fixture) {
  try { fixture.store?.close(); } catch (error) { void error; }
  rmSync(fixture.dir, { recursive: true, force: true });
}

test('evidence from a failed attempt cannot satisfy a later completion gate', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', maxAttempts: 2 });
    assert.equal(fixture.store.claim('worker-a', 1_000).attempts, 1);
    assert.equal(fixture.store.start('task', 'worker-a'), true);
    assert.equal(
      fixture.store.addOwnedEvidence('task', 'worker-a', 'bounded-task-result', { attempt: 1 }).attempt,
      1,
    );
    assert.equal(fixture.store.fail('task', 'worker-a', new Error('retry'), 0), true);

    assert.equal(fixture.store.claim('worker-b', 1_000).attempts, 2);
    assert.equal(fixture.store.start('task', 'worker-b'), true);
    assert.equal(fixture.store.markVerifying('task', 'worker-b', { attempt: 2 }), true);

    assert.equal(fixture.store.verifyComplete('task'), false);
    assert.equal(fixture.store.get('task').status, 'VERIFYING');
    assert.deepEqual(fixture.store.listEvidence('task').map((row) => row.attempt), [1]);
  } finally {
    cleanup(fixture);
  }
});

test('completion accepts evidence produced by the current retry attempt', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', maxAttempts: 2 });
    fixture.store.claim('worker-a', 1_000);
    fixture.store.start('task', 'worker-a');
    fixture.store.addOwnedEvidence('task', 'worker-a', 'bounded-task-result', { attempt: 1 });
    fixture.store.fail('task', 'worker-a', new Error('retry'), 0);

    fixture.store.claim('worker-b', 1_000);
    fixture.store.start('task', 'worker-b');
    assert.equal(
      fixture.store.addOwnedEvidence('task', 'worker-b', 'bounded-task-result', { attempt: 2 }).attempt,
      2,
    );
    assert.equal(fixture.store.markVerifying('task', 'worker-b', { attempt: 2 }), true);
    assert.equal(fixture.store.verifyComplete('task'), true);
    assert.equal(fixture.store.get('task').status, 'COMPLETE');
    assert.deepEqual(fixture.store.listEvidence('task').map((row) => row.attempt), [1, 2]);
  } finally {
    cleanup(fixture);
  }
});

test('existing evidence tables migrate additively and historical evidence stays attempt zero', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-attempt-migration-'));
  const dbPath = join(dir, 'percy.sqlite');
  let store;
  try {
    const db = new DatabaseSync(dbPath);
    db.exec(`
      PRAGMA foreign_keys=ON;
      CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO meta(key, value) VALUES ('paused', '0');
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('READY','CLAIMED','RUNNING','VERIFYING','COMPLETE','FAILED','BLOCKED','STALE','CANCELLED')),
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 3,
        owner_id TEXT,
        lease_expires_at INTEGER,
        heartbeat_at INTEGER,
        available_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        result TEXT,
        error TEXT
      );
      CREATE TABLE evidence (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        value TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        metadata TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE failures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        owner_id TEXT,
        attempt INTEGER NOT NULL,
        error TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
    const t = Date.now();
    db.prepare(`INSERT INTO tasks(
      id,kind,payload,status,attempts,max_attempts,owner_id,lease_expires_at,heartbeat_at,
      available_at,created_at,updated_at,result,error
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      'task', 'echo', '{}', 'READY', 0, 2, null, null, null, t, t, t, null, null,
    );
    db.prepare('INSERT INTO evidence(id,task_id,kind,value,sha256,metadata,created_at) VALUES(?,?,?,?,?,?,?)')
      .run('old-evidence', 'task', 'historical', '{"ok":true}', 'legacy-digest', '{}', t);
    db.close();

    store = new PercyStore(dbPath);
    const columns = store.db.prepare('PRAGMA table_info(evidence)').all().map((row) => row.name);
    assert.ok(columns.includes('attempt'));
    assert.equal(store.listEvidence('task')[0].attempt, 0);

    assert.equal(store.claim('worker-a', 1_000).attempts, 1);
    assert.equal(store.start('task', 'worker-a'), true);
    assert.equal(store.markVerifying('task', 'worker-a', {}), true);
    assert.equal(store.verifyComplete('task'), false);
    assert.equal(store.get('task').status, 'VERIFYING');
  } finally {
    try { store?.close(); } catch (error) { void error; }
    rmSync(dir, { recursive: true, force: true });
  }
});
