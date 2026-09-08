import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'tools', 'percy-runtime', 'cli.mjs');

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-stale-resume-'));
  return { dir, db: join(dir, 'percy.sqlite'), store: new PercyStore(join(dir, 'percy.sqlite')) };
}

function runResume(db) {
  const result = spawnSync(process.execPath, [cli, 'resume', '--db', db], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function runWorkOne(db, dir) {
  const result = spawnSync(process.execPath, [
    cli,
    'work-one',
    '--db', db,
    '--worker-id', 'worker-recovery',
    '--lease-ms', '1000',
    '--timeout-ms', '1000',
    '--log', join(dir, 'events.jsonl'),
  ], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function failures(store, taskId) {
  return store.db.prepare('SELECT owner_id,attempt,error FROM failures WHERE task_id=? ORDER BY id').all(taskId)
    .map(({ owner_id, attempt, error }) => ({ owner_id, attempt, error }));
}

function cleanup(fixture) {
  try { fixture.store?.close(); } catch (error) { void error; }
  rmSync(fixture.dir, { recursive: true, force: true });
}

test('resume requeues a signal-stale task when retry budget remains', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', maxAttempts: 2 });
    assert.equal(fixture.store.claim('worker-a', 1_000).attempts, 1);
    assert.equal(fixture.store.start('task', 'worker-a'), true);
    assert.equal(fixture.store.markStale('task', 'worker-a', 'worker received SIGTERM'), true);
    assert.equal(fixture.store.get('task').status, 'STALE');
    fixture.store.close();
    fixture.store = null;

    assert.deepEqual(runResume(fixture.db), {
      resumed: true,
      recovered: 1,
      requeued: 1,
      failed: 0,
    });

    fixture.store = new PercyStore(fixture.db);
    assert.equal(fixture.store.get('task').status, 'READY');
    assert.deepEqual(failures(fixture.store, 'task'), [
      { owner_id: null, attempt: 1, error: 'worker received SIGTERM' },
    ]);
    assert.equal(fixture.store.claim('worker-b', 1_000).attempts, 2);
  } finally {
    cleanup(fixture);
  }
});

test('resume terminalizes a signal-stale task when retry budget is exhausted', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', maxAttempts: 1 });
    fixture.store.claim('worker-a', 1_000);
    fixture.store.start('task', 'worker-a');
    fixture.store.markStale('task', 'worker-a', 'worker received SIGINT');
    fixture.store.close();
    fixture.store = null;

    assert.deepEqual(runResume(fixture.db), {
      resumed: true,
      recovered: 1,
      requeued: 0,
      failed: 1,
    });

    fixture.store = new PercyStore(fixture.db);
    assert.equal(fixture.store.get('task').status, 'FAILED');
    assert.deepEqual(failures(fixture.store, 'task'), [
      { owner_id: null, attempt: 1, error: 'worker received SIGINT' },
    ]);
    assert.equal(fixture.store.queueDepth(), 0);
    assert.equal(fixture.store.claim('worker-b', 1_000), null);
  } finally {
    cleanup(fixture);
  }
});

test('resume terminalizes an expired final lease instead of stranding READY work', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', maxAttempts: 1 });
    fixture.store.claim('worker-a', 1_000);
    fixture.store.start('task', 'worker-a');
    fixture.store.db.prepare('UPDATE tasks SET lease_expires_at=0 WHERE id=?').run('task');
    fixture.store.close();
    fixture.store = null;

    assert.deepEqual(runResume(fixture.db), {
      resumed: true,
      recovered: 1,
      requeued: 0,
      failed: 1,
    });

    fixture.store = new PercyStore(fixture.db);
    assert.equal(fixture.store.get('task').status, 'FAILED');
    assert.deepEqual(failures(fixture.store, 'task'), [
      { owner_id: 'worker-a', attempt: 1, error: 'stale lease recovered' },
    ]);
    assert.equal(fixture.store.queueDepth(), 0);
  } finally {
    cleanup(fixture);
  }
});

test('work-one automatically recovers signal-stale work before claiming the retry', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', payload: { safe: true }, maxAttempts: 2 });
    fixture.store.claim('worker-a', 1_000);
    fixture.store.start('task', 'worker-a');
    fixture.store.markStale('task', 'worker-a', 'worker received SIGTERM');
    fixture.store.close();
    fixture.store = null;

    assert.deepEqual(runWorkOne(fixture.db, fixture.dir), {
      workerId: 'worker-recovery',
      taskId: 'task',
      status: 'COMPLETE',
      result: { safe: true },
    });

    fixture.store = new PercyStore(fixture.db);
    assert.equal(fixture.store.get('task').status, 'COMPLETE');
    assert.equal(fixture.store.get('task').attempts, 2);
    assert.deepEqual(failures(fixture.store, 'task'), [
      { owner_id: null, attempt: 1, error: 'worker received SIGTERM' },
    ]);
  } finally {
    cleanup(fixture);
  }
});

test('resume heals an exhausted READY row left by legacy lease recovery', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task', maxAttempts: 1 });
    fixture.store.claim('worker-a', 1_000);
    fixture.store.start('task', 'worker-a');
    fixture.store.db.prepare('UPDATE tasks SET lease_expires_at=0 WHERE id=?').run('task');

    assert.equal(fixture.store.claim('worker-b', 1_000), null);
    assert.equal(fixture.store.get('task').status, 'READY');
    assert.equal(fixture.store.get('task').attempts, 1);
    fixture.store.close();
    fixture.store = null;

    assert.deepEqual(runResume(fixture.db), {
      resumed: true,
      recovered: 1,
      requeued: 0,
      failed: 1,
    });

    fixture.store = new PercyStore(fixture.db);
    assert.equal(fixture.store.get('task').status, 'FAILED');
    assert.deepEqual(failures(fixture.store, 'task'), [
      { owner_id: null, attempt: 1, error: 'stale lease recovered' },
    ]);
  } finally {
    cleanup(fixture);
  }
});
