import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readinessMigrationPath = 'supabase/migrations/20260908165433_exam_session_readiness.sql';
const provenancePath = 'docs/PRODUCTION_REPAIR_PROVENANCE_2026-09-20.md';

const readinessProductionSha256 = '8f43395b1d0c71fdb4389f6b1a53b931f7443064c386e8ad8e37a132852566e5';
const runtimeRepairProductionSha256 = '3b128512234720381ef3d6a20c30674536f56c05840116fb67a3cc60e27de01d';

const runtimeCompositeSourceBlobs = [
  ['supabase/migrations/20260906101155_learner_state_and_telemetry.sql', '9a15c9e5e8307ceb4c27395dbc0c17308ad0e27d'],
  ['supabase/migrations/20260906103806_atomic_rate_limits_and_singletons.sql', '452da7821abf9a90665d364aa1ef0b9637455cd8'],
  ['supabase/migrations/20260906112000_batch_state_and_privileges.sql', 'fad08e4aff89d75a23cd758b5c4ce165a46f7513'],
  ['supabase/migrations/20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql', 'a710f8503933af9d78c9c178ba8a4ec467859335'],
  ['supabase/migrations/20260908105340_exam_session_history.sql', '925b6c68d14be5ddd7ea8ad6a876d7a22a28d94e'],
  ['supabase/migrations/20260908165433_exam_session_readiness.sql', 'df530e80c0db4ac2bbce28b8aacefd6ab0516c87'],
];

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function gitBlobSha1(path) {
  const contents = readFileSync(path);
  const header = Buffer.from(`blob ${contents.byteLength}\0`);
  return createHash('sha1').update(header).update(contents).digest('hex');
}

test('readiness production repair stays byte-bound to the reviewed migration', () => {
  assert.equal(sha256(readinessMigrationPath), readinessProductionSha256);
});

test('runtime repair source-map migrations stay bound to the reviewed blobs', () => {
  for (const [path, expectedBlob] of runtimeCompositeSourceBlobs) {
    assert.equal(gitBlobSha1(path), expectedBlob, `${path} drifted from the reviewed production-repair source map`);
  }
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
