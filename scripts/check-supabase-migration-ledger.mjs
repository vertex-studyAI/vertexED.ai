import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATION_FILENAME = /^(\d{14})_(.+)\.sql$/;
const VERSION = /^\d{14}$/;

export class MigrationLedgerError extends Error {}

function normalizeVersion(value, label = 'migration version') {
  const text = String(value ?? '').trim();
  if (!VERSION.test(text)) {
    throw new MigrationLedgerError(`${label} must be exactly 14 digits; received ${JSON.stringify(text)}`);
  }
  return text;
}

function extractJsonRows(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') {
    throw new MigrationLedgerError('ledger JSON must be an array or an object containing versions, migrations, rows, or data');
  }

  for (const key of ['versions', 'migrations', 'rows', 'data']) {
    if (Array.isArray(value[key])) return value[key];
  }

  throw new MigrationLedgerError('ledger JSON object must contain an array field named versions, migrations, rows, or data');
}

function versionFromJsonRow(row, index) {
  if (typeof row === 'string' || typeof row === 'number') {
    return normalizeVersion(row, `ledger[${index}]`);
  }
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    throw new MigrationLedgerError(`ledger[${index}] must be a version string/number or an object with a version field`);
  }

  for (const key of ['version', 'migration_version', 'id']) {
    if (row[key] != null && row[key] !== '') {
      return normalizeVersion(row[key], `ledger[${index}].${key}`);
    }
  }

  for (const key of ['name', 'filename']) {
    if (typeof row[key] === 'string') {
      const match = row[key].match(/^(\d{14})(?:_|$)/);
      if (match) return normalizeVersion(match[1], `ledger[${index}].${key}`);
    }
  }

  throw new MigrationLedgerError(`ledger[${index}] does not contain a recognized migration version field`);
}

export function parseLedgerText(text) {
  const source = String(text ?? '').trim();
  if (!source) throw new MigrationLedgerError('ledger input is empty');

  if (source.startsWith('[') || source.startsWith('{')) {
    let parsed;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      throw new MigrationLedgerError(`ledger JSON is invalid: ${error?.message ?? error}`);
    }
    return extractJsonRows(parsed).map(versionFromJsonRow);
  }

  const versions = [];
  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const matches = [...line.matchAll(/\b\d{14}\b/g)].map((match) => match[0]);
    if (matches.length !== 1) {
      throw new MigrationLedgerError(
        `plain-text ledger line ${index + 1} must contain exactly one 14-digit remote migration version; found ${matches.length}`,
      );
    }
    versions.push(matches[0]);
  }

  if (!versions.length) throw new MigrationLedgerError('ledger input contains no migration versions');
  return versions;
}

export function readLocalMigrations(migrationsDir = resolve('supabase/migrations')) {
  const entries = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();

  if (!entries.length) {
    throw new MigrationLedgerError(`no .sql migrations found in ${migrationsDir}`);
  }

  const malformed = [];
  const migrations = [];
  for (const filename of entries) {
    const match = filename.match(MIGRATION_FILENAME);
    if (!match) {
      malformed.push(filename);
      continue;
    }
    migrations.push({ version: match[1], filename });
  }

  if (malformed.length) {
    throw new MigrationLedgerError(
      `migration filenames must use <14-digit-version>_<name>.sql; invalid: ${malformed.join(', ')}`,
    );
  }

  return migrations;
}

function duplicates(values) {
  const seen = new Set();
  const duplicateSet = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicateSet.add(value);
    seen.add(value);
  }
  return [...duplicateSet].sort();
}

export function compareMigrationLedger(localMigrations, remoteVersions) {
  const localVersions = localMigrations.map((migration) => normalizeVersion(migration.version, 'local migration version'));
  const normalizedRemote = remoteVersions.map((version, index) => normalizeVersion(version, `remote ledger version #${index + 1}`));

  const localDuplicates = duplicates(localVersions);
  const remoteDuplicates = duplicates(normalizedRemote);
  const localSet = new Set(localVersions);
  const remoteSet = new Set(normalizedRemote);

  const missingRequired = localMigrations
    .filter((migration) => !remoteSet.has(migration.version))
    .map((migration) => ({ version: migration.version, filename: migration.filename }));

  // This project has historically shared a Supabase project with FinanceMeta.
  // Remote-only ledger entries are therefore evidence to review, not automatic corruption.
  const remoteOnly = [...remoteSet].filter((version) => !localSet.has(version)).sort();

  const maxRemote = normalizedRemote.length ? [...normalizedRemote].sort().at(-1) : null;
  const interleavedMissing = maxRemote
    ? missingRequired.filter((migration) => migration.version < maxRemote)
    : [];

  const ok = localDuplicates.length === 0 && remoteDuplicates.length === 0 && missingRequired.length === 0;

  return {
    ok,
    localMigrationCount: localMigrations.length,
    remoteLedgerCount: normalizedRemote.length,
    localDuplicates,
    remoteDuplicates,
    missingRequired,
    remoteOnly,
    interleavedMissing,
    maxRemote,
  };
}

export function formatReport(report) {
  const lines = [
    `VERTEXED_MIGRATION_LEDGER_${report.ok ? 'PASS' : 'FAIL'}`,
    `local_migrations=${report.localMigrationCount}`,
    `remote_ledger_entries=${report.remoteLedgerCount}`,
    `remote_only_entries=${report.remoteOnly.length}`,
    `missing_required=${report.missingRequired.length}`,
    `interleaved_missing=${report.interleavedMissing.length}`,
  ];

  if (report.localDuplicates.length) {
    lines.push(`ERROR local duplicate versions: ${report.localDuplicates.join(', ')}`);
  }
  if (report.remoteDuplicates.length) {
    lines.push(`ERROR remote duplicate versions: ${report.remoteDuplicates.join(', ')}`);
  }
  for (const migration of report.missingRequired) {
    lines.push(`MISSING ${migration.version} ${migration.filename}`);
  }
  if (report.remoteOnly.length) {
    lines.push(`INFO remote-only versions (shared-project evidence; not automatic failure): ${report.remoteOnly.join(', ')}`);
  }
  if (report.interleavedMissing.length) {
    lines.push(
      `ERROR later remote migrations exist after missing VertexED versions: ${report.interleavedMissing
        .map((migration) => migration.version)
        .join(', ')}`,
    );
  }

  return `${lines.join('\n')}\n`;
}

function parseArgs(argv) {
  const args = { ledger: null, migrationsDir: resolve('supabase/migrations'), json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--ledger') {
      args.ledger = argv[++index];
      if (!args.ledger) throw new MigrationLedgerError('--ledger requires a file path or - for stdin');
    } else if (arg === '--migrations-dir') {
      const value = argv[++index];
      if (!value) throw new MigrationLedgerError('--migrations-dir requires a path');
      args.migrationsDir = resolve(value);
    } else if (arg === '--json') {
      args.json = true;
    } else {
      throw new MigrationLedgerError(`unknown argument: ${arg}`);
    }
  }
  if (!args.ledger) {
    throw new MigrationLedgerError(
      'usage: node scripts/check-supabase-migration-ledger.mjs --ledger <remote-ledger.json|txt|-> [--migrations-dir path] [--json]',
    );
  }
  return args;
}

function readLedgerSource(path) {
  if (path === '-') return readFileSync(0, 'utf8');
  return readFileSync(resolve(path), 'utf8');
}

function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv);
    const localMigrations = readLocalMigrations(args.migrationsDir);
    const remoteVersions = parseLedgerText(readLedgerSource(args.ledger));
    const report = compareMigrationLedger(localMigrations, remoteVersions);
    process.stdout.write(args.json ? `${JSON.stringify(report, null, 2)}\n` : formatReport(report));
    process.exitCode = report.ok ? 0 : 1;
  } catch (error) {
    process.stderr.write(`VERTEXED_MIGRATION_LEDGER_INVALID: ${error?.message ?? error}\n`);
    process.exitCode = 2;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  main();
}
