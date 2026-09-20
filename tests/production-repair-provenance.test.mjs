import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readinessMigrationPath = 'supabase/migrations/20260908165433_exam_session_readiness.sql';
const provenancePath = 'docs/PRODUCTION_REPAIR_PROVENANCE_2026-09-20.md';

const readinessProductionSha256 = '8f43395b1d0c71fdb4389f6b1a53b931f7443064c386e8ad8e37a132852566e5';
const runtimeRepairProductionSha256 = '3b128512234720381ef3d6a20c30674536f56c05840116fb67a3cc60e27de01d';

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

test('readiness production repair stays byte-bound to the reviewed migration', () => {
  assert.equal(sha256(readinessMigrationPath), readinessProductionSha256);
});

test('provenance receipt preserves exact and composite repair boundaries', () => {
  const receipt = readFileSync(provenancePath, 'utf8');

  assert.match(receipt, new RegExp(readinessProductionSha256));
  assert.match(receipt, new RegExp(runtimeRepairProductionSha256));
  assert.match(receipt, /byte-for-byte identical to the current repository file/);
  assert.match(receipt, /composite production repair/);
  assert.match(receipt, /not falsely claimed as byte-identical to one repository migration/);
  assert.match(receipt, /Do not infer one-time backfill execution from mutable current rows\./);
});
