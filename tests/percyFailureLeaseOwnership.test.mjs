import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-failure-lease-'));
  const store = new PercyStore(join(dir, 'percy.sqlite'));
  return { dir, store };
}

function cleanup(fixture) {
  try { fixture.store.close(); } catch (error) { void error; }
  rmSync(fixture.dir, { recursive: true, force: true });
}

function expireLease(store, taskId) {
  store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?').run(Date.now() - 1, taskId);
}

function failureRows(store, taskId) {
  return store.db.prepare('SELECT owner_id,attempt,error FROM failures WHERE task_id=? ORDER BY id').all(taskId);
}

test('live owner can record a retry failure atomically', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 'task', maxAttempts: 2 });
    assert.equal(f.store.claim('worker-a', 10_000).id, 'task');
    assert.equal(f.store.start('task', 'worker-a'), true);

    assert.equal(f.store.fail('task', 'worker-a', new Error('boom'), 0), true);
    assert.equal(f.store.get('task').status, 'READY');
    assert.deepEqual(failureRows(f.store, 'task'), [
      { owner_id: 'worker-a', attempt: 1, error: 'boom' },
    ]);
  } finally { cleanup(f); }
});

test('expired owner cannot append failure history or mutate task state', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 'task', maxAttempts: 2 });
    assert.equal(f.store.claim('worker-a', 10_000).id, 'task');
    assert.equal(f.store.start('task', 'worker-a'), true);
    expireLease(f.store, 'task');

    assert.equal(f.store.fail('task', 'worker-a', new Error('stale failure'), 0), false);
    assert.equal(f.store.get('task').status, 'RUNNING');
    assert.deepEqual(failureRows(f.store, 'task'), []);

    const recovered = f.store.claim('worker-b', 10_000);
    assert.equal(recovered.id, 'task');
    assert.equal(recovered.owner_id, 'worker-b');
    assert.equal(f.store.start('task', 'worker-b'), true);
    assert.equal(f.store.fail('task', 'worker-b', new Error('real failure'), 0), true);
    assert.deepEqual(failureRows(f.store, 'task'), [
      { owner_id: 'worker-b', attempt: 2, error: 'real failure' },
    ]);
  } finally { cleanup(f); }
});

test('expired owner cannot mark a task stale after lease authority ends', () => {
  const f = fresh();
  try {
    f.store.submit({ id: 'task' });
    assert.equal(f.store.claim('worker-a', 10_000).id, 'task');
    assert.equal(f.store.start('task', 'worker-a'), true);
    expireLease(f.store, 'task');

    assert.equal(f.store.markStale('task', 'worker-a', 'late shutdown'), false);
    assert.equal(f.store.get('task').status, 'RUNNING');

    const recovered = f.store.claim('worker-b', 10_000);
    assert.equal(recovered.owner_id, 'worker-b');
    assert.equal(f.store.markStale('task', 'worker-a', 'stale worker'), false);
  } finally { cleanup(f); }
});
