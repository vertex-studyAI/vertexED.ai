import { createHash } from 'node:crypto';
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
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

function acquireRestoreBoundary(destination) {
  const lockPath = `${destination}.restore.lock`;
  let lockFd;
  let destinationDb;
  let transactionOpen = false;

  try {
    try {
      lockFd = openSync(lockPath, 'wx', 0o600);
    } catch (error) {
      if (error?.code === 'EEXIST') {
        throw new Error(`restore already in progress for destination: ${destination}`);
      }
      throw error;
    }

    if (!existsSync(destination)) {
      return {
        fresh: true,
        paused: true,
        active: 0,
        release() {
          if (lockFd !== undefined) closeSync(lockFd);
          rmSync(lockPath, { force: true });
          lockFd = undefined;
        },
      };
    }

    destinationDb = new DatabaseSync(destination);
    destinationDb.exec('PRAGMA busy_timeout=250;');
    try {
      destinationDb.exec('BEGIN IMMEDIATE;');
      transactionOpen = true;
    } catch (error) {
      throw new Error(`restore destination is busy; another SQLite writer is active: ${error.message}`);
    }

    assertPercySchema(destinationDb, 'restore destination');
    const paused = destinationDb.prepare("SELECT value FROM meta WHERE key='paused'").get()?.value === '1';
    const active = Number(
      destinationDb.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status IN ('CLAIMED','RUNNING')").get().n,
    );
    if (!paused) {
      throw new Error('restore destination must be durably paused before restore');
    }
    if (active !== 0) {
      throw new Error(`restore destination is not quiescent: ${active} active task(s) remain`);
    }

    return {
      fresh: false,
      paused,
      active,
      release() {
        if (transactionOpen) {
          try { destinationDb.exec('ROLLBACK;'); } catch (error) { void error; }
          transactionOpen = false;
        }
        try { destinationDb?.close(); } catch (error) { void error; }
        destinationDb = undefined;
        if (lockFd !== undefined) closeSync(lockFd);
        rmSync(lockPath, { force: true });
        lockFd = undefined;
      },
    };
  } catch (error) {
    if (transactionOpen) {
      try { destinationDb?.exec('ROLLBACK;'); } catch (rollbackError) { void rollbackError; }
    }
    try { destinationDb?.close(); } catch (closeError) { void closeError; }
    if (lockFd !== undefined) {
      try { closeSync(lockFd); } catch (closeError) { void closeError; }
    }
    rmSync(lockPath, { force: true });
    throw error;
  }
}

function prepareCandidateForPausedRestore(stagedPath, sourceCounts) {
  const stagedDb = new DatabaseSync(stagedPath);
  try {
    stagedDb.exec('BEGIN IMMEDIATE;');
    stagedDb.prepare("UPDATE meta SET value='1' WHERE key='paused'").run();
    stagedDb.exec('COMMIT;');

    const integrity = readIntegrity(stagedDb, 'restored candidate');
    assertPercySchema(stagedDb, 'restored candidate');
    const counts = tableCounts(stagedDb);
    if (JSON.stringify(counts) !== JSON.stringify(sourceCounts)) {
      throw new Error('restored candidate row counts do not match backup source');
    }
    return { integrity, counts };
  } catch (error) {
    try { stagedDb.exec('ROLLBACK;'); } catch (rollbackError) { void rollbackError; }
    throw error;
  } finally {
    stagedDb.close();
  }
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
  let boundary;

  try {
    sourceDb = new DatabaseSync(source, { readOnly: true });
    const sourceIntegrity = readIntegrity(sourceDb, 'backup');
    assertPercySchema(sourceDb, 'backup');
    const sourceCounts = tableCounts(sourceDb);

    const pages = await backup(sourceDb, stagedPath);
    sourceDb.close();
    sourceDb = undefined;

    const candidate = prepareCandidateForPausedRestore(stagedPath, sourceCounts);
    const sha256 = sha256File(stagedPath);
    const bytes = statSync(stagedPath).size;

    boundary = acquireRestoreBoundary(destination);
    installVerifiedRestore(stagedPath, destination);

    return {
      path: destination,
      bytes,
      sha256,
      pages,
      integrity: candidate.integrity,
      sourceIntegrity,
      counts: candidate.counts,
      quiescence: {
        fresh: boundary.fresh,
        paused: boundary.paused,
        active: boundary.active,
      },
    };
  } finally {
    try { boundary?.release(); } catch (error) { void error; }
    try { sourceDb?.close(); } catch (error) { void error; }
    rmSync(stagingDir, { recursive: true, force: true });
  }
}
