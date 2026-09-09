import { backup, DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const TABLES = ['meta', 'tasks', 'evidence', 'failures'];

function tableCounts(db) {
  return Object.fromEntries(
    TABLES.map((table) => [
      table,
      Number(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n),
    ]),
  );
}

function assertPercySchema(db) {
  const found = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name),
  );
  const missing = TABLES.filter((table) => !found.has(table));
  if (missing.length) throw new Error(`backup is missing Percy tables: ${missing.join(', ')}`);
}

function backupArtifacts(output) {
  return [output, `${output}-wal`, `${output}-shm`];
}

function removeBackupArtifacts(output) {
  for (const path of backupArtifacts(output)) rmSync(path, { force: true });
}

function installVerifiedBackup(stagedOutput, output, { overwrite }) {
  const rollbackToken = `${process.pid}-${Date.now()}`;
  const displaced = [];

  try {
    if (overwrite) {
      for (const path of backupArtifacts(output)) {
        if (!existsSync(path)) continue;
        const rollbackPath = `${path}.previous-${rollbackToken}`;
        renameSync(path, rollbackPath);
        displaced.push([path, rollbackPath]);
      }
    }

    renameSync(stagedOutput, output);
  } catch (error) {
    removeBackupArtifacts(output);
    for (const [originalPath, rollbackPath] of displaced.reverse()) {
      if (existsSync(rollbackPath)) renameSync(rollbackPath, originalPath);
    }
    throw error;
  }

  for (const [, rollbackPath] of displaced) rmSync(rollbackPath, { force: true });
}

export async function createVerifiedBackup(
  sourceDb,
  sourcePath,
  outputPath,
  { overwrite = false } = {},
) {
  if (!sourceDb) throw new TypeError('sourceDb required');
  if (!sourcePath) throw new TypeError('sourcePath required');
  if (!outputPath) throw new TypeError('outputPath required');

  const source = resolve(sourcePath);
  const output = resolve(outputPath);
  if (source === output) throw new Error('backup output must differ from the live database path');

  const existingArtifacts = backupArtifacts(output).filter((path) => existsSync(path));
  if (existingArtifacts.length && !overwrite) {
    throw new Error(`backup output already exists: ${existingArtifacts.join(', ')}`);
  }

  mkdirSync(dirname(output), { recursive: true });

  const sourceIntegrity = sourceDb.prepare('PRAGMA integrity_check').all().map((row) => row.integrity_check);
  if (sourceIntegrity.length !== 1 || sourceIntegrity[0] !== 'ok') {
    throw new Error(`live database integrity check failed: ${sourceIntegrity.join(', ')}`);
  }
  assertPercySchema(sourceDb);

  const stagingDir = mkdtempSync(join(dirname(output), '.percy-backup-'));
  const stagedOutput = join(stagingDir, basename(output));

  try {
    const pages = await backup(sourceDb, stagedOutput);
    const copy = new DatabaseSync(stagedOutput, { readOnly: true });
    let integrity;
    let counts;
    try {
      integrity = copy.prepare('PRAGMA integrity_check').all().map((row) => row.integrity_check);
      if (integrity.length !== 1 || integrity[0] !== 'ok') {
        throw new Error(`backup integrity check failed: ${integrity.join(', ')}`);
      }
      assertPercySchema(copy);
      counts = tableCounts(copy);
    } finally {
      copy.close();
    }

    installVerifiedBackup(stagedOutput, output, { overwrite });
    return { output, pages, integrity, counts };
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
  }
}
