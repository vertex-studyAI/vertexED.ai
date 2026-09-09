import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
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

function makeStore(path, taskId, { paused = false } = {}) {
  const store = new PercyStore(path);
  if (taskId) store.submit({ id: taskId, kind: 'echo', payload: { taskId } });
  if (paused) store.setPaused(true);
  store.close();
}

function waitForLine(stream, expected) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk.toString();
      if (!buffer.includes(expected)) return;
      cleanup();
      resolve();
    };
    const onEnd = () => {
      cleanup();
      reject(new Error(`stream ended before ${expected}`));
    };
    const cleanup = () => {
      stream.off('data', onData);
      stream.off('end', onEnd);
    };
    stream.on('data', onData);
    stream.on('end', onEnd);
  });
}

function waitForExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    child.once('exit', resolve);
  });
}

test('verified restore replaces a paused quiescent destination only after candidate verification', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-'));
  try {
    const source = join(dir, 'source.sqlite');
    const destination = join(dir, 'live.sqlite');
    makeStore(source, 'from-backup');
    makeStore(destination, 'old-live', { paused: true });
    writeFileSync(`${destination}-wal`, 'stale wal');
    writeFileSync(`${destination}-shm`, 'stale shm');

    const result = await restoreVerifiedDatabase(source, destination);
    assert.equal(result.integrity[0], 'ok');
    assert.equal(result.sourceIntegrity[0], 'ok');
    assert.equal(result.counts.tasks, 1);
    assert.deepEqual(result.quiescence, { fresh: false, paused: true, active: 0 });
    assert.equal(existsSync(`${destination}-wal`), false);
    assert.equal(existsSync(`${destination}-shm`), false);
    assert.equal(existsSync(`${destination}.restore.lock`), false);

    const restored = new PercyStore(destination);
    try {
      assert.equal(restored.get('from-backup')?.id, 'from-backup');
      assert.equal(restored.get('old-live'), null);
      assert.equal(restored.isPaused(), true);
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

test('verified restore refuses an unpaused destination without changing it', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-unpaused-'));
  try {
    const source = join(dir, 'source.sqlite');
    const destination = join(dir, 'live.sqlite');
    makeStore(source, 'from-backup');
    makeStore(destination, 'keep-live');
    const before = readFileSync(destination);

    await assert.rejects(
      restoreVerifiedDatabase(source, destination),
      /must be durably paused/,
    );
    assert.deepEqual(readFileSync(destination), before);
    assert.equal(existsSync(`${destination}.restore.lock`), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verified restore refuses paused destinations that still have owned work', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-active-'));
  try {
    const source = join(dir, 'source.sqlite');
    const destination = join(dir, 'live.sqlite');
    makeStore(source, 'from-backup');

    const live = new PercyStore(destination);
    live.submit({ id: 'active-task', kind: 'echo', payload: { active: true } });
    const claimed = live.claim('restore-test-worker', 30_000);
    assert.equal(claimed.id, 'active-task');
    live.setPaused(true);
    const before = readFileSync(destination);

    await assert.rejects(
      restoreVerifiedDatabase(source, destination),
      /not quiescent: 1 active task/,
    );
    assert.deepEqual(readFileSync(destination), before);
    assert.equal(live.get('active-task')?.status, 'CLAIMED');
    assert.equal(existsSync(`${destination}.restore.lock`), false);
    live.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verified restore refuses a competing live SQLite writer process', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-restore-writer-'));
  let child;
  try {
    const source = join(dir, 'source.sqlite');
    const destination = join(dir, 'live.sqlite');
    makeStore(source, 'from-backup');
    makeStore(destination, 'keep-live', { paused: true });
    const before = readFileSync(destination);

    const script = `
      import { DatabaseSync } from 'node:sqlite';
      const db = new DatabaseSync(process.argv[1]);
      db.exec('PRAGMA journal_mode=WAL; BEGIN IMMEDIATE;');
      process.stdout.write('locked\\n');
      const stop = () => {
        try { db.exec('ROLLBACK;'); } catch {}
        try { db.close(); } catch {}
        process.exit(0);
      };
      process.on('SIGTERM', stop);
      process.on('SIGINT', stop);
      setInterval(() => {}, 1000);
    `;
    child = spawn(process.execPath, ['--input-type=module', '-e', script, destination], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    await waitForLine(child.stdout, 'locked');

    await assert.rejects(
      restoreVerifiedDatabase(source, destination),
      /another SQLite writer is active/,
    );
    assert.deepEqual(readFileSync(destination), before);
    assert.equal(existsSync(`${destination}.restore.lock`), false);
  } finally {
    if (child) {
      child.kill('SIGTERM');
      await waitForExit(child);
    }
    rmSync(dir, { recursive: true, force: true });
  }
});
