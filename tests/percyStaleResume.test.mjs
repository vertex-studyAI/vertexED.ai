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
    assert.equal(fixture.store.queueDepth(), 0);
  } finally {
    cleanup(fixture);
  }
});
