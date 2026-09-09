import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PercyStore } from '../tools/percy-runtime/core.mjs';
import { restoreVerifiedDatabase } from '../tools/percy-runtime/restore.mjs';

function makeStore(path, taskId) {
  const store = new PercyStore(path);
  if (taskId) store.submit({ id: taskId, kind: 'echo', payload: { taskId } });
  store.close();
}

test('verified restore replaces the destination only after candidate verification', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-'));
  try {
    const source = join(dir, 'source.sqlite');
    const destination = join(dir, 'live.sqlite');
    makeStore(source, 'from-backup');
    makeStore(destination, 'old-live');
    writeFileSync(`${destination}-wal`, 'stale wal');
    writeFileSync(`${destination}-shm`, 'stale shm');

    const result = await restoreVerifiedDatabase(source, destination);
    assert.equal(result.integrity[0], 'ok');
    assert.equal(result.sourceIntegrity[0], 'ok');
    assert.equal(result.counts.tasks, 1);
    assert.equal(existsSync(`${destination}-wal`), false);
    assert.equal(existsSync(`${destination}-shm`), false);

    const restored = new PercyStore(destination);
    try {
      assert.equal(restored.get('from-backup')?.id, 'from-backup');
      assert.equal(restored.get('old-live'), null);
    } finally {
      restored.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verified restore rejects a non-Percy SQLite source without touching the live database', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-reject-'));
  try {
    const source = join(dir, 'not-percy.sqlite');
    const destination = join(dir, 'live.sqlite');
    const sourceDb = new DatabaseSync(source);
    sourceDb.exec("CREATE TABLE unrelated(value TEXT); INSERT INTO unrelated VALUES ('x');");
    sourceDb.close();
    makeStore(destination, 'keep-me');
    const before = readFileSync(destination);

    await assert.rejects(
      restoreVerifiedDatabase(source, destination),
      /backup is missing Percy tables/,
    );
    assert.deepEqual(readFileSync(destination), before);

    const live = new PercyStore(destination);
    try {
      assert.equal(live.get('keep-me')?.id, 'keep-me');
    } finally {
      live.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verified restore fails closed when source and destination are the same file', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-self-'));
  try {
    const path = join(dir, 'percy.sqlite');
    makeStore(path, 'same-file');
    const before = readFileSync(path);
    await assert.rejects(
      restoreVerifiedDatabase(path, path),
      /restore source must differ from destination/,
    );
    assert.deepEqual(readFileSync(path), before);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
