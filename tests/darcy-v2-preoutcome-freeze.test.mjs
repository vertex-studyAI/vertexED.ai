import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const configUrl = new URL('../portfolio/project2424/projects/T2424-0050/v2-freeze-config.json', import.meta.url);
const config = JSON.parse(await readFile(configUrl, 'utf8'));

test('Darcy v2 remains pre-outcome and training-disabled', () => {
  assert.equal(config.protocol_id, 'DARCY-FREEZE-001 / darcy-operator-ood-v2');
  assert.equal(config.outcome_state, 'EXPERIMENT_NOT_YET_RUN');
  assert.equal(config.training_authorized, false);
});

test('Darcy v2 generator ambiguities are frozen before learned training', () => {
  assert.equal(config.generator.covariance_interpretation_status, 'APPROVED_PRE_OUTCOME_2026_08_23');
  assert.match(config.unresolved_pretraining_blockers.covariance_interpretation_approval, /^APPROVED_2026_08_23_/);
  assert.equal(config.generator.ood_d_global_offset_status, 'APPROVED_PRE_OUTCOME_2026_08_23');
  assert.equal(config.generator.ood_d_global_offset_current, 0);
  assert.match(config.unresolved_pretraining_blockers.ood_d_global_offset_interpretation_approval, /^APPROVED_2026_08_23_/);
});

test('Darcy v2 cannot become training-authorized while learned baselines or runtime identity are missing', () => {
  const blockers = config.unresolved_pretraining_blockers;
  assert.equal(blockers.learned_environment_lock, null);
  assert.equal(blockers.hardware_identity, null);
  assert.equal(blockers.B3_implementation_sha, null);
  assert.equal(blockers.B4_implementation_sha, null);
  assert.equal(config.systems.B3.state, 'BLOCKED_IMPLEMENTATION');
  assert.equal(config.systems.B4.state, 'BLOCKED_IMPLEMENTATION');
  assert.equal(config.training_authorized, false);
});

test('Darcy v2 keeps test/OOD data out of learned-model selection', () => {
  assert.equal(config.learned_model_freeze.test_or_ood_for_selection, false);
  assert.deepEqual(config.learned_model_freeze.training_seeds, [41, 73, 109]);
  assert.equal(config.systems.B2.test_or_ood_for_selection, false);
  assert.ok(config.unresolved_pretraining_blockers.split_manifest_sha256);
});
