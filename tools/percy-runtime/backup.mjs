import { backup, DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

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
  if (existsSync(output) && !overwrite) {
    throw new Error(`backup output already exists: ${output}`);
  }

  mkdirSync(dirname(output), { recursive: true });
  if (overwrite) rmSync(output, { force: true });

  const sourceIntegrity = sourceDb.prepare('PRAGMA integrity_check').all().map((row) => row.integrity_check);
  if (sourceIntegrity.length !== 1 || sourceIntegrity[0] !== 'ok') {
    throw new Error(`live database integrity check failed: ${sourceIntegrity.join(', ')}`);
  }
  assertPercySchema(sourceDb);

  try {
    const pages = await backup(sourceDb, output);
    const copy = new DatabaseSync(output, { readOnly: true });
    try {
      const integrity = copy.prepare('PRAGMA integrity_check').all().map((row) => row.integrity_check);
      if (integrity.length !== 1 || integrity[0] !== 'ok') {
        throw new Error(`backup integrity check failed: ${integrity.join(', ')}`);
      }
      assertPercySchema(copy);
      return { output, pages, integrity, counts: tableCounts(copy) };
    } finally {
      copy.close();
    }
  } catch (error) {
    rmSync(output, { force: true });
    throw error;
  }
}
