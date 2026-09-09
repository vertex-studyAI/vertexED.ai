import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createVerifiedBackup } from '../tools/percy-runtime/backup.mjs';
import { PercyStore } from '../tools/percy-runtime/core.mjs';

function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true });
}

test('overwrite preserves the existing backup when source verification fails', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-backup-overwrite-fail-'));
  const sourcePath = join(dir, 'invalid-source.sqlite');
  const outputPath = join(dir, 'existing.sqlite');
  const source = new DatabaseSync(sourcePath);

  try {
    writeFileSync(outputPath, 'known-good-existing-backup');
    writeFileSync(`${outputPath}-wal`, 'known-good-existing-wal');

    await assert.rejects(
      createVerifiedBackup(source, sourcePath, outputPath, { overwrite: true }),
      /backup is missing Percy tables/,
    );

    assert.equal(readFileSync(outputPath, 'utf8'), 'known-good-existing-backup');
    assert.equal(readFileSync(`${outputPath}-wal`, 'utf8'), 'known-good-existing-wal');
    assert.equal(readdirSync(dir).some((name) => name.startsWith('.percy-backup-')), false);
    assert.equal(readdirSync(dir).some((name) => name.includes('.previous-')), false);
  } finally {
    source.close();
    cleanup(dir);
  }
});

test('overwrite installs only the fully verified replacement and clears displaced sidecars', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-backup-overwrite-success-'));
  const sourcePath = join(dir, 'source.sqlite');
  const outputPath = join(dir, 'existing.sqlite');
  const store = new PercyStore(sourcePath);
  let copy;

  try {
    store.submit({ id: 'durable-task', payload: { value: 7 } });
    writeFileSync(outputPath, 'old-backup');
    writeFileSync(`${outputPath}-wal`, 'old-wal');
    writeFileSync(`${outputPath}-shm`, 'old-shm');

    const result = await createVerifiedBackup(store.db, store.path, outputPath, { overwrite: true });

    assert.equal(result.output, outputPath);
    assert.deepEqual(result.integrity, ['ok']);
    assert.equal(result.counts.tasks, 1);
    assert.equal(existsSync(`${outputPath}-wal`), false);
    assert.equal(existsSync(`${outputPath}-shm`), false);
    assert.equal(readdirSync(dir).some((name) => name.startsWith('.percy-backup-')), false);
    assert.equal(readdirSync(dir).some((name) => name.includes('.previous-')), false);

    copy = new DatabaseSync(outputPath, { readOnly: true });
    const task = copy.prepare('SELECT id, payload FROM tasks WHERE id = ?').get('durable-task');
    assert.equal(task.id, 'durable-task');
    assert.deepEqual(JSON.parse(task.payload), { value: 7 });
  } finally {
    try {
      copy?.close();
    } catch (error) {
      void error;
    }
    store.close();
    cleanup(dir);
  }
});
