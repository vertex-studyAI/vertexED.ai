import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-owned-evidence-'));
  return { dir, store: new PercyStore(join(dir, 'percy.sqlite')) };
}

function cleanup(fixture) {
  try { fixture.store.close(); } catch (error) { void error; }
  rmSync(fixture.dir, { recursive: true, force: true });
}

test('active worker can commit owned evidence', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task' });
    assert.equal(fixture.store.claim('worker-a', 1_000).id, 'task');
    assert.equal(fixture.store.start('task', 'worker-a'), true);

    const evidence = fixture.store.addOwnedEvidence(
      'task',
      'worker-a',
      'bounded-task-result',
      { ok: true },
      { source: 'test' },
    );

    assert.ok(evidence);
    assert.equal(evidence.task_id, 'task');
    assert.equal(fixture.store.listEvidence('task').length, 1);
    assert.deepEqual(fixture.store.listEvidence('task')[0].value, { ok: true });
  } finally {
    cleanup(fixture);
  }
});

test('stale worker cannot append evidence after lease handoff', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task' });
    assert.equal(fixture.store.claim('worker-a', 1_000).id, 'task');
    assert.equal(fixture.store.start('task', 'worker-a'), true);

    fixture.store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?')
      .run(Date.now() - 1, 'task');

    const reclaimed = fixture.store.claim('worker-b', 1_000);
    assert.equal(reclaimed.id, 'task');
    assert.equal(reclaimed.owner_id, 'worker-b');
    assert.equal(fixture.store.start('task', 'worker-b'), true);

    assert.equal(
      fixture.store.addOwnedEvidence('task', 'worker-a', 'bounded-task-result', { stale: true }),
      null,
    );
    assert.equal(fixture.store.listEvidence('task').length, 0);

    const current = fixture.store.addOwnedEvidence(
      'task',
      'worker-b',
      'bounded-task-result',
      { current: true },
    );
    assert.ok(current);

    const evidence = fixture.store.listEvidence('task');
    assert.equal(evidence.length, 1);
    assert.deepEqual(evidence[0].value, { current: true });
  } finally {
    cleanup(fixture);
  }
});

test('worker evidence commit fails closed after ownership is cleared for verification', () => {
  const fixture = fresh();
  try {
    fixture.store.submit({ id: 'task' });
    assert.equal(fixture.store.claim('worker-a', 1_000).id, 'task');
    assert.equal(fixture.store.start('task', 'worker-a'), true);
    fixture.store.addEvidence('task', 'preexisting-check', { ok: true });
    assert.equal(fixture.store.markVerifying('task', 'worker-a', { done: true }), true);

    assert.equal(
      fixture.store.addOwnedEvidence('task', 'worker-a', 'bounded-task-result', { late: true }),
      null,
    );
    assert.equal(fixture.store.listEvidence('task').length, 1);
  } finally {
    cleanup(fixture);
  }
});
