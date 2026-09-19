import assert from 'node:assert/strict';
import test from 'node:test';

import { MigrationLedgerError, parseLedgerText } from '../scripts/check-supabase-migration-ledger.mjs';

test('generic row ids do not override explicit migration-version fields', () => {
  assert.deepEqual(
    parseLedgerText(JSON.stringify({
      rows: [{ id: 42, version: '20260901000000' }],
    })),
    ['20260901000000'],
  );
});

test('version-shaped row ids must agree with explicit migration versions', () => {
  assert.throws(
    () => parseLedgerText(JSON.stringify({
      rows: [{ id: '20260902000000', version: '20260901000000' }],
    })),
    (error) => error instanceof MigrationLedgerError && /conflicting migration versions/.test(error.message),
  );
});

test('a generic id remains valid as the sole version field only when version-shaped', () => {
  assert.deepEqual(
    parseLedgerText(JSON.stringify({ rows: [{ id: '20260901000000' }] })),
    ['20260901000000'],
  );

  assert.throws(
    () => parseLedgerText(JSON.stringify({ rows: [{ id: 42 }] })),
    (error) => error instanceof MigrationLedgerError && /must be exactly 8 or 14 digits/.test(error.message),
  );
});
