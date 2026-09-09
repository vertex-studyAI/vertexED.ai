import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

import { PercyStore } from '../tools/percy-runtime/core.mjs';

const primePath = resolve('tools/percy-runtime/prime.mjs');

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function runPrime(...args) {
  return spawnSync(process.execPath, [primePath, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env },
  });
}

test('prime backup uses the verified installer and requires explicit overwrite', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-prime-backup-'));
  const dbPath = join(dir, 'percy.sqlite');
  const backupPath = join(dir, 'backups', 'percy.sqlite');

  try {
    let store = new PercyStore(dbPath);
    store.submit({ id: 'first', kind: 'echo', payload: { value: 1 } });
    store.close();

    const first = runPrime('backup', '--db', dbPath, '--to', backupPath);
    assert.equal(first.status, 0, first.stderr);
    const firstResult = JSON.parse(first.stdout);
    assert.equal(firstResult.status, 'BACKUP_VERIFIED');
    assert.deepEqual(firstResult.integrity, ['ok']);
    assert.equal(firstResult.counts.tasks, 1);
    assert.equal(firstResult.counts.meta, 1);
    assert.equal(firstResult.counts.evidence, 0);
    assert.equal(firstResult.counts.failures, 0);

    const backupDb = new DatabaseSync(backupPath, { readOnly: true });
    try {
      assert.equal(backupDb.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
      assert.equal(backupDb.prepare('SELECT COUNT(*) AS n FROM tasks').get().n, 1);
    } finally {
      backupDb.close();
    }

    const beforeBlockedOverwrite = sha256(backupPath);
    const blocked = runPrime('backup', '--db', dbPath, '--to', backupPath);
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /backup output already exists/);
    assert.equal(sha256(backupPath), beforeBlockedOverwrite);

    store = new PercyStore(dbPath);
    store.submit({ id: 'second', kind: 'echo', payload: { value: 2 } });
    store.close();

    const replaced = runPrime('backup', '--db', dbPath, '--to', backupPath, '--overwrite');
    assert.equal(replaced.status, 0, replaced.stderr);
    const replacedResult = JSON.parse(replaced.stdout);
    assert.equal(replacedResult.status, 'BACKUP_VERIFIED');
    assert.deepEqual(replacedResult.integrity, ['ok']);
    assert.equal(replacedResult.counts.tasks, 2);

    const replacedDb = new DatabaseSync(backupPath, { readOnly: true });
    try {
      assert.equal(replacedDb.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
      assert.equal(replacedDb.prepare('SELECT COUNT(*) AS n FROM tasks').get().n, 2);
    } finally {
      replacedDb.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
