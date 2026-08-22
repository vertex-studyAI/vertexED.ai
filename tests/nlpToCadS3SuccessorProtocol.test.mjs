import test from 'node:test';
import assert from 'node:assert/strict';
import { validateS3SuccessorProtocol } from '../portfolio/project2424/projects/T2424-0037/benchmark/validate_s3_successor_protocol.mjs';

test('NeuroCAD S3 successor protocol is frozen but not execution-authorized', async () => {
  const result = await validateS3SuccessorProtocol();
  assert.equal(result.verdict, 'PASS_PROTOCOL_INTEGRITY_GATE');
  assert.equal(result.execution_authorized, false);
  assert.equal(result.results_status, 'NOT_RUN');
  assert.equal(result.benchmark_target_cases, 150);
  assert.equal(result.strata_total, 150);
  assert.equal(result.baseline_families, 4);
  assert.equal(result.required_ablations, 4);
  assert.equal(result.external_benchmark_adapters_required, 2);
  assert.equal(result.external_benchmark_candidates_materialized, 0);
  assert.equal(result.implementations_frozen, 0);
  assert.equal(result.blocker, 'DATASET_AND_MODEL_IDENTITY_BLOCKED');
});
