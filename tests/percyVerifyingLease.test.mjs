import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-verifying-lease-'));
  return { dir, store: new PercyStore(join(dir, 'percy.sqlite')) };
}

function cleanup(fixture) {
  try { fixture.store.close(); } catch (error) { void error; }
  rmSync(fixture.dir, { recursive: true, force: true });
}

test('active worker can transition RUNNING to VERIFYING with a live lease', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task' });
    assert.equal(fixture.store.claim('worker-a', 1_000).id, 'task');
    assert.equal(fixture.store.start('task', 'worker-a'), true);
    fixture.store.addEvidence('task', 'check', { ok: true });

    assert.equal(fixture.store.markVerifying('task', 'worker-a', { done: true }), true);
    const task = fixture.store.get('task');
    assert.equal(task.status, 'VERIFYING');
    assert.equal(task.owner_id, null);
    assert.equal(task.lease_expires_at, null);
    assert.deepEqual(task.result, { done: true });
  } finally {
    cleanup(fixture);
  }
});

test('expired owner cannot transition RUNNING to VERIFYING', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task' });
    assert.equal(fixture.store.claim('worker-a', 1_000).id, 'task');
    assert.equal(fixture.store.start('task', 'worker-a'), true);
    fixture.store.addEvidence('task', 'check', { ok: true });
    fixture.store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?')
      .run(Date.now() - 1, 'task');

    assert.equal(fixture.store.markVerifying('task', 'worker-a', { stale: true }), false);
    const task = fixture.store.get('task');
    assert.equal(task.status, 'RUNNING');
    assert.equal(task.owner_id, 'worker-a');
    assert.notEqual(task.lease_expires_at, null);
    assert.equal(task.result, null);
  } finally {
    cleanup(fixture);
  }
});

test('expired worker cannot verify after lease handoff to another worker', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task' });
    assert.equal(fixture.store.claim('worker-a', 1_000).id, 'task');
    assert.equal(fixture.store.start('task', 'worker-a'), true);
    fixture.store.addEvidence('task', 'check', { ok: true });
    fixture.store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?')
      .run(Date.now() - 1, 'task');

    const reclaimed = fixture.store.claim('worker-b', 1_000);
    assert.equal(reclaimed.id, 'task');
    assert.equal(reclaimed.owner_id, 'worker-b');
    assert.equal(fixture.store.start('task', 'worker-b'), true);

    assert.equal(fixture.store.markVerifying('task', 'worker-a', { stale: true }), false);
    assert.equal(fixture.store.markVerifying('task', 'worker-b', { current: true }), true);
    assert.deepEqual(fixture.store.get('task').result, { current: true });
  } finally {
    cleanup(fixture);
  }
});