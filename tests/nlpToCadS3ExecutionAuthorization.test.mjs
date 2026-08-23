import test from 'node:test';
import assert from 'node:assert/strict';
import { assessS3ExecutionAuthorization, generateS3ExecutionAuthorization } from '../portfolio/project2424/projects/T2424-0037/benchmark/generate_s3_execution_authorization.mjs';

test('NeuroCAD S3 confirmatory execution is refused before hashes and adapters are frozen', async () => {
  const assessment = await assessS3ExecutionAuthorization();
  assert.equal(assessment.execution_authorized, false);
  assert.equal(assessment.freeze_present, false);
  assert.deepEqual(assessment.materialized_external_adapters, []);
  assert.ok(assessment.blockers.includes('EXTERNAL_ADAPTERS_NOT_MATERIALIZED_AND_HASHED'));
  assert.ok(assessment.blockers.includes('S3_EXECUTION_FREEZE_MISSING'));

  await assert.rejects(
    () => generateS3ExecutionAuthorization(),
    (error) => {
      assert.equal(error.code, 'S3_EXECUTION_NOT_AUTHORIZED');
      assert.ok(error.message.includes('EXTERNAL_ADAPTERS_NOT_MATERIALIZED_AND_HASHED'));
      assert.ok(error.message.includes('S3_EXECUTION_FREEZE_MISSING'));
      return true;
    },
  );
});
