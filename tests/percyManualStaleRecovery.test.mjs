import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-manual-stale-'));
  return { dir, store: new PercyStore(join(dir, 'percy.sqlite')) };
}

function cleanup(fixture) {
  fixture.store.close();
  rmSync(fixture.dir, { recursive: true, force: true });
}

function failureRows(store, taskId) {
  return store.db.prepare(
    'SELECT task_id,attempt,error FROM failures WHERE task_id=? ORDER BY id',
  ).all(taskId).map((row) => ({ ...row }));
}

test('manual stale recovery requeues only when retry budget remains and records provenance', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 'retryable', maxAttempts: 2 });
    assert.equal(f.store.claim('worker-1', 1_000).id, 'retryable');
    assert.equal(f.store.start('retryable', 'worker-1'), true);
    assert.equal(f.store.markStale('retryable', 'worker-1', 'SIGTERM'), true);

    assert.equal(f.store.requeueStale('retryable'), true);
    assert.equal(f.store.get('retryable').status, 'READY');
    assert.deepEqual(failureRows(f.store, 'retryable'), [
      { task_id: 'retryable', attempt: 1, error: 'SIGTERM' },
    ]);

    const retried = f.store.claim('worker-2', 1_000);
    assert.equal(retried.id, 'retryable');
    assert.equal(retried.attempts, 2);
  } finally {
    cleanup(f);
  }
});

test('manual stale recovery terminalizes an exhausted attempt instead of reviving it', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 'exhausted', maxAttempts: 1 });
    assert.equal(f.store.claim('worker-1', 1_000).id, 'exhausted');
    assert.equal(f.store.start('exhausted', 'worker-1'), true);
    assert.equal(f.store.markStale('exhausted', 'worker-1', 'SIGTERM'), true);

    assert.equal(f.store.requeueStale('exhausted'), true);
    assert.equal(f.store.get('exhausted').status, 'FAILED');
    assert.equal(f.store.claim('worker-2', 1_000), null);
    assert.deepEqual(failureRows(f.store, 'exhausted'), [
      { task_id: 'exhausted', attempt: 1, error: 'SIGTERM' },
    ]);
    assert.equal(f.store.requeueStale('exhausted'), false);
    assert.equal(failureRows(f.store, 'exhausted').length, 1);
  } finally {
    cleanup(f);
  }
});

test('manual stale recovery is task-scoped and does not recover unrelated interrupted work', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 'first', maxAttempts: 2 });
    f.store.submit({ id: 'second', maxAttempts: 2 });
    assert.equal(f.store.claim('worker-1', 1_000).id, 'first');
    assert.equal(f.store.claim('worker-2', 1_000).id, 'second');
    assert.equal(f.store.start('first', 'worker-1'), true);
    assert.equal(f.store.start('second', 'worker-2'), true);
    assert.equal(f.store.markStale('first', 'worker-1', 'SIGTERM'), true);
    assert.equal(f.store.markStale('second', 'worker-2', 'SIGTERM'), true);

    assert.equal(f.store.requeueStale('first'), true);
    assert.equal(f.store.get('first').status, 'READY');
    assert.equal(f.store.get('second').status, 'STALE');
    assert.equal(failureRows(f.store, 'first').length, 1);
    assert.equal(failureRows(f.store, 'second').length, 0);
  } finally {
    cleanup(f);
  }
});