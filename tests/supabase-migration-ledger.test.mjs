import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

import {
  MigrationLedgerError,
  compareMigrationLedger,
  parseLedgerText,
  readLocalMigrations,
} from '../scripts/check-supabase-migration-ledger.mjs';

function withMigrationDir(filenames, fn) {
  const root = mkdtempSync(join(tmpdir(), 'vertexed-migrations-'));
  const dir = join(root, 'migrations');
  mkdirSync(dir);
  for (const filename of filenames) {
    writeFileSync(join(dir, filename), '-- fixture\n', 'utf8');
  }
  try {
    return fn(dir);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('parses JSON ledgers from legacy date versions, timestamp versions, and row objects', () => {
  assert.deepEqual(
    parseLedgerText(JSON.stringify(['20260708', '20260901000000', 20260902000000])),
    ['20260708', '20260901000000', '20260902000000'],
  );

  assert.deepEqual(
    parseLedgerText(JSON.stringify({
      rows: [
        { version: '20260901000000' },
        { migration_version: '20260902000000' },
        { filename: '20260903000000_add_readiness.sql' },
      ],
    })),
    ['20260901000000', '20260902000000', '20260903000000'],
  );
});

test('plain text accepts one remote version per line and rejects ambiguous CLI tables', () => {
  assert.deepEqual(
    parseLedgerText('# sanitized remote ledger\n20260708\n20260901000000\nversion=20260902000000\n'),
    ['20260708', '20260901000000', '20260902000000'],
  );

  assert.throws(
    () => parseLedgerText('20260901000000 | 20260901000000 | 2026-09-01'),
    (error) => error instanceof MigrationLedgerError && /exactly one 8- or 14-digit remote migration version/.test(error.message),
  );
});

test('local migration reader fails closed on malformed SQL migration filenames', () => {
  withMigrationDir(
    ['20260708_legacy_valid.sql', '20260901000000_valid.sql', 'manual_patch.sql'],
    (dir) => {
      assert.throws(
        () => readLocalMigrations(dir),
        (error) => error instanceof MigrationLedgerError && /invalid: manual_patch\.sql/.test(error.message),
      );
    },
  );
});

test('remote-only shared-project migrations are informational rather than automatic failure', () => {
  const local = [
    { version: '20260901000000', filename: '20260901000000_a.sql' },
    { version: '20260902000000', filename: '20260902000000_b.sql' },
  ];
  const report = compareMigrationLedger(local, [
    '20260831000000',
    '20260901000000',
    '20260902000000',
    '20260903000000',
  ]);

  assert.equal(report.ok, true);
  assert.deepEqual(report.missingRequired, []);
  assert.deepEqual(report.remoteOnly, ['20260831000000', '20260903000000']);
});

test('missing VertexED migrations fail even when later remote migrations exist', () => {
  const local = [
    { version: '20260901000000', filename: '20260901000000_a.sql' },
    { version: '20260902000000', filename: '20260902000000_readiness.sql' },
    { version: '20260903000000', filename: '20260903000000_c.sql' },
  ];
  const report = compareMigrationLedger(local, [
    '20260901000000',
    '20260903000000',
    '20260904000000',
  ]);

  assert.equal(report.ok, false);
  assert.deepEqual(report.missingRequired, [
    { version: '20260902000000', filename: '20260902000000_readiness.sql' },
  ]);
  assert.deepEqual(report.interleavedMissing, [
    { version: '20260902000000', filename: '20260902000000_readiness.sql' },
  ]);
  assert.deepEqual(report.remoteOnly, ['20260904000000']);
});

test('duplicate remote ledger versions fail closed', () => {
  const local = [{ version: '20260901000000', filename: '20260901000000_a.sql' }];
  const report = compareMigrationLedger(local, ['20260901000000', '20260901000000']);
  assert.equal(report.ok, false);
  assert.deepEqual(report.remoteDuplicates, ['20260901000000']);
});

test('the checked-in VertexED migration directory is parseable and can be certified against an exact ledger', () => {
  const local = readLocalMigrations(resolve('supabase/migrations'));
  assert.ok(local.length > 0);

  const report = compareMigrationLedger(
    local,
    [...local.map((migration) => migration.version), '20991231235959'],
  );

  assert.equal(report.ok, true);
  assert.equal(report.missingRequired.length, 0);
  assert.deepEqual(report.remoteOnly, ['20991231235959']);
});
