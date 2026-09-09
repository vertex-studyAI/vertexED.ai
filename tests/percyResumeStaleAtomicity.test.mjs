import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'percy-resume-stale-'));
  const store = new PercyStore(join(dir, 'percy.sqlite'));
  return {
    store,
    close() {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

test('resumeStale atomically rechecks lease expiry and reports actual recovered rows', () => {
  const f = fixture();
  try {
    f.store.submit({ id: 't' });
    assert.equal(f.store.claim('w1', 60_000).id, 't');
    assert.equal(f.store.start('t', 'w1'), true);

    assert.equal(f.store.resumeStale(), 0);
    assert.equal(f.store.get('t').status, 'RUNNING');
    assert.equal(f.store.get('t').owner_id, 'w1');

    f.store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?').run(Date.now() - 1, 't');
    assert.equal(f.store.resumeStale(), 1);
    assert.equal(f.store.get('t').status, 'READY');
    assert.equal(f.store.get('t').owner_id, null);
    assert.equal(f.store.resumeStale(), 0);
  } finally {
    f.close();
  }
});

test('resumeStale terminalizes an expired final attempt instead of stranding READY work', () => {
  const f = fixture();
  try {
    f.store.submit({ id: 'final', maxAttempts: 1 });
    assert.equal(f.store.claim('w1', 60_000).id, 'final');
    assert.equal(f.store.start('final', 'w1'), true);
    f.store.db.prepare('UPDATE tasks SET lease_expires_at=? WHERE id=?').run(Date.now() - 1, 'final');

    assert.equal(f.store.resumeStale(), 1);
    const task = f.store.get('final');
    assert.equal(task.status, 'FAILED');
    assert.equal(task.owner_id, null);
    assert.equal(task.attempts, 1);
    assert.equal(f.store.claim('w2', 60_000), null);

    const failures = f.store.db.prepare('SELECT task_id,owner_id,attempt,error FROM failures WHERE task_id=?').all('final');
    assert.equal(failures.length, 1);
    assert.equal(failures[0].task_id, 'final');
    assert.equal(failures[0].owner_id, 'w1');
    assert.equal(failures[0].attempt, 1);
    assert.match(failures[0].error, /stale lease recovered/);
  } finally {
    f.close();
  }
});

test('resumeStale recovers explicit STALE tasks and preserves their interruption reason', () => {
  const f = fixture();
  try {
    f.store.submit({ id: 'signal', maxAttempts: 2 });
    assert.equal(f.store.claim('w1', 60_000).id, 'signal');
    assert.equal(f.store.start('signal', 'w1'), true);
    assert.equal(f.store.markStale('signal', 'w1', 'worker received SIGTERM'), true);

    assert.equal(f.store.resumeStale(), 1);
    const task = f.store.get('signal');
    assert.equal(task.status, 'READY');
    assert.equal(task.owner_id, null);
    assert.equal(task.error, 'worker received SIGTERM');

    const failures = f.store.db.prepare('SELECT attempt,error FROM failures WHERE task_id=?').all('signal');
    assert.deepEqual(failures.map((row) => ({ ...row })), [
      { attempt: 1, error: 'worker received SIGTERM' },
    ]);
  } finally {
    f.close();
  }
});

test('resumeStale heals legacy exhausted READY rows instead of leaving them unclaimable', () => {
  const f = fixture();
  try {
    f.store.submit({ id: 'legacy', maxAttempts: 1 });
    f.store.db.prepare("UPDATE tasks SET status='READY', attempts=max_attempts, error=NULL WHERE id=?").run('legacy');

    assert.equal(f.store.resumeStale(), 1);
    const task = f.store.get('legacy');
    assert.equal(task.status, 'FAILED');
    assert.match(task.error, /retry budget exhausted/);

    const failures = f.store.db.prepare('SELECT attempt,error FROM failures WHERE task_id=?').all('legacy');
    assert.deepEqual(failures.map((row) => ({ ...row })), [
      { attempt: 1, error: 'retry budget exhausted' },
    ]);
  } finally {
    f.close();
  }
});
