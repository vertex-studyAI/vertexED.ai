import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import { backup, DatabaseSync } from 'node:sqlite';
import { basename, dirname, join, resolve } from 'node:path';

const PERCY_TABLES = ['meta', 'tasks', 'evidence', 'failures'];

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function sqliteArtifacts(path) {
  return [path, `${path}-wal`, `${path}-shm`];
}

function removeSqliteArtifacts(path) {
  for (const artifact of sqliteArtifacts(path)) rmSync(artifact, { force: true });
}

function assertRegularFile(path, label) {
  if (!existsSync(path)) return;
  if (!lstatSync(path).isFile()) throw new Error(`${label} must be a regular file: ${path}`);
}

function readIntegrity(db, label) {
  const integrity = db.prepare('PRAGMA integrity_check').all().map((row) => row.integrity_check);
  if (integrity.length !== 1 || integrity[0] !== 'ok') {
    throw new Error(`${label} integrity check failed: ${integrity.join(', ')}`);
  }
  return integrity;
}

function assertPercySchema(db, label) {
  const found = new Set(
    db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name),
  );
  const missing = PERCY_TABLES.filter((table) => !found.has(table));
  if (missing.length) throw new Error(`${label} is missing Percy tables: ${missing.join(', ')}`);
}

function tableCounts(db) {
  return Object.fromEntries(
    PERCY_TABLES.map((table) => [
      table,
      Number(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n),
    ]),
  );
}

function installVerifiedRestore(stagedPath, destination) {
  const rollbackToken = `${process.pid}-${Date.now()}`;
  const displaced = [];

  try {
    for (const artifact of sqliteArtifacts(destination)) {
      if (!existsSync(artifact)) continue;
      assertRegularFile(artifact, 'restore destination artifact');
      const rollbackPath = `${artifact}.previous-${rollbackToken}`;
      renameSync(artifact, rollbackPath);
      displaced.push([artifact, rollbackPath]);
    }

    renameSync(stagedPath, destination);
  } catch (error) {
    removeSqliteArtifacts(destination);
    for (const [originalPath, rollbackPath] of displaced.reverse()) {
      if (existsSync(rollbackPath)) renameSync(rollbackPath, originalPath);
    }
    throw error;
  }

  for (const [, rollbackPath] of displaced) rmSync(rollbackPath, { force: true });
}

export async function restoreVerifiedDatabase(backupPath, destinationPath) {
  if (!backupPath) throw new TypeError('backupPath required');
  if (!destinationPath) throw new TypeError('destinationPath required');

  const source = resolve(backupPath);
  const destination = resolve(destinationPath);
  if (source === destination) throw new Error('restore source must differ from destination');
  if (!existsSync(source)) throw new Error(`backup not found: ${source}`);
  assertRegularFile(source, 'restore source');
  for (const artifact of sqliteArtifacts(destination)) {
    assertRegularFile(artifact, 'restore destination artifact');
  }

  mkdirSync(dirname(destination), { recursive: true });
  const stagingDir = mkdtempSync(join(dirname(destination), '.percy-restore-'));
  const stagedPath = join(stagingDir, basename(destination));
  let sourceDb;

  try {
    sourceDb = new DatabaseSync(source, { readOnly: true });
    const sourceIntegrity = readIntegrity(sourceDb, 'backup');
    assertPercySchema(sourceDb, 'backup');
    const sourceCounts = tableCounts(sourceDb);

    const pages = await backup(sourceDb, stagedPath);
    sourceDb.close();
    sourceDb = undefined;

    const stagedDb = new DatabaseSync(stagedPath, { readOnly: true });
    let integrity;
    let counts;
    try {
      integrity = readIntegrity(stagedDb, 'restored candidate');
      assertPercySchema(stagedDb, 'restored candidate');
      counts = tableCounts(stagedDb);
    } finally {
      stagedDb.close();
    }

    if (JSON.stringify(counts) !== JSON.stringify(sourceCounts)) {
      throw new Error('restored candidate row counts do not match backup source');
    }

    const sha256 = sha256File(stagedPath);
    const bytes = statSync(stagedPath).size;
    installVerifiedRestore(stagedPath, destination);
    return {
      path: destination,
      bytes,
      sha256,
      pages,
      integrity,
      sourceIntegrity,
      counts,
    };
  } finally {
    try { sourceDb?.close(); } catch (error) { void error; }
    rmSync(stagingDir, { recursive: true, force: true });
  }
}
