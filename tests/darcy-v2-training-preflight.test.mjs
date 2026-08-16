import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  assessDarcyV2TrainingReadiness,
  assertDarcyV2TrainingAuthorized,
} from '../portfolio/project2424/projects/T2424-0050/src/v2-training-preflight.mjs';

const configUrl = new URL(
  '../portfolio/project2424/projects/T2424-0050/v2-freeze-config.json',
  import.meta.url,
);

async function currentConfig() {
  return JSON.parse(await readFile(configUrl, 'utf8'));
}

test('current Darcy v2 freeze fails closed on the exact unresolved pretraining gates', async () => {
  const assessment = assessDarcyV2TrainingReadiness(await currentConfig());
  assert.equal(assessment.ready_for_training, false);
  assert.equal(assessment.prerequisite_gates_closed, false);
  assert.equal(assessment.training_authorized, false);

  const blockerIds = assessment.blockers.map(({ id }) => id);
  for (const expected of [
    'covariance_interpretation_approval',
    'ood_d_global_offset_interpretation_approval',
    'learned_environment_lock',
    'hardware_identity',
    'b3_implementation',
    'b4_implementation',
    'training_authorization_flag',
  ]) {
    assert.ok(blockerIds.includes(expected), `missing expected blocker ${expected}`);
  }

  for (const unexpectedlyOpen of [
    'protocol_identity',
    'pre_outcome_state',
    'generator_implementation_hash',
    'split_manifest_hash',
    'b2_implementation',
    'learned_model_budget_freeze',
  ]) {
    assert.ok(!blockerIds.includes(unexpectedlyOpen), `unexpected blocker ${unexpectedlyOpen}`);
  }
});

test('assertion refuses current training authorization without touching any outcome surface', async () => {
  assert.throws(
    () => assertDarcyV2TrainingAuthorized(await currentConfig()),
    /DARCY_V2_TRAINING_BLOCKED/,
  );
});

test('preflight rejects malformed config instead of assuming readiness', () => {
  assert.throws(() => assessDarcyV2TrainingReadiness(null), TypeError);
  const assessment = assessDarcyV2TrainingReadiness({});
  assert.equal(assessment.ready_for_training, false);
  assert.ok(assessment.blocker_count > 0);
});

test('synthetic fully frozen control object can close every readiness gate', async () => {
  const config = await currentConfig();
  const frozen = structuredClone(config);

  frozen.unresolved_pretraining_blockers.covariance_interpretation_approval =
    'synthetic-test-approval-only';
  frozen.unresolved_pretraining_blockers.ood_d_global_offset_interpretation_approval =
    'synthetic-test-approval-only';
  frozen.unresolved_pretraining_blockers.learned_environment_lock =
    'synthetic-test-environment-lock';
  frozen.unresolved_pretraining_blockers.hardware_identity =
    'synthetic-test-hardware-identity';

  for (const id of ['B3', 'B4']) {
    const sha = id === 'B3'
      ? '3333333333333333333333333333333333333333'
      : '4444444444444444444444444444444444444444';
    frozen.systems[id] = {
      ...frozen.systems[id],
      state: 'IMPLEMENTED_PREOUTCOME_UNIT_VERIFIED',
      implementation: `src/${id.toLowerCase()}-synthetic-test-only.mjs`,
      implementation_git_blob_sha: sha,
    };
    frozen.unresolved_pretraining_blockers[`${id}_implementation_sha`] = sha;
  }
  frozen.training_authorized = true;

  const assessment = assessDarcyV2TrainingReadiness(frozen);
  assert.equal(assessment.prerequisite_gates_closed, true);
  assert.equal(assessment.training_authorized, true);
  assert.equal(assessment.ready_for_training, true);
  assert.equal(assessment.blocker_count, 0);
  assert.doesNotThrow(() => assertDarcyV2TrainingAuthorized(frozen));
});
