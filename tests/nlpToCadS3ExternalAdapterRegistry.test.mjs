import test from 'node:test';
import assert from 'node:assert/strict';
import { validateS3ExternalAdapterRegistry } from '../portfolio/project2424/projects/T2424-0037/benchmark/validate_s3_external_adapter_registry.mjs';

test('NeuroCAD S3 external adapters are identified but not falsely materialized', async () => {
  const result = await validateS3ExternalAdapterRegistry();
  assert.equal(result.verdict, 'PASS_EXTERNAL_ADAPTER_IDENTITY_GATE');
  assert.deepEqual(result.selected_adapter_ids, ['cadtestbench', 'muse']);
  assert.equal(result.materialized_count, 0);
  assert.equal(result.required_materialized_adapters, 2);
  assert.equal(result.confirmatory_execution_authorized, false);
  assert.equal(result.blocker, 'EXACT_DATASET_REVISIONS_AND_CONTENT_HASHES_NOT_FROZEN');
});
