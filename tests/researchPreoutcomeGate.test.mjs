import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  assessEigenReplicationReadiness,
  assessNPMSSuccessorReadiness,
  assertEvaluationAuthorized,
} from '../portfolio/research/preoutcome_gate.mjs';

const npmsUrl = new URL('../portfolio/research/NPMS_SUCCESSOR_FREEZE_V1.json', import.meta.url);
const eigenUrl = new URL('../portfolio/research/EIGEN_JEPA_REPLICATION_FREEZE_V1.json', import.meta.url);

async function load(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

test('current NPMS successor freeze remains blocked without touching outcomes', async () => {
  const assessment = assessNPMSSuccessorReadiness(await load(npmsUrl));
  assert.equal(assessment.ready_for_evaluation, false);
  assert.equal(assessment.evaluation_authorized, false);
  const ids = new Set(assessment.blockers.map(({ id }) => id));
  for (const expected of [
    'successor_source', 'environment', 'dataset_identity', 'split_manifest',
    'memory_spectrum_definition', 'target_definition', 'parameter_control',
    'state_space_control', 'spectral_control', 'primary_metric',
    'secondary_metrics', 'success_threshold', 'regression_guardrail',
    'uncertainty', 'seed_rule', 'compute_cap', 'raw_retention',
    'evaluation_script', 'authorization',
  ]) assert.ok(ids.has(expected), `missing NPMS blocker ${expected}`);
  assert.ok(!ids.has('protocol_identity'));
  assert.ok(!ids.has('negative_control_lineage'));
  assert.throws(() => assertEvaluationAuthorized(assessment), /RESEARCH_EVALUATION_BLOCKED/);
});

test('current Eigen-JEPA replication freeze remains blocked before multi-dataset execution', async () => {
  const assessment = assessEigenReplicationReadiness(await load(eigenUrl));
  assert.equal(assessment.ready_for_evaluation, false);
  assert.equal(assessment.evaluation_authorized, false);
  const ids = new Set(assessment.blockers.map(({ id }) => id));
  for (const expected of [
    'implementation', 'environment', 'dataset_manifest', 'chronological_splits',
    'preprocessing', 'temporal_geometry', 'selection_rule', 'parameter_budget',
    'primary_metric', 'strongest_baseline_rule', 'primary_improvement',
    'secondary_guardrail', 'paired_uncertainty', 'seed_rule', 'compute_cap',
    'raw_retention', 'evaluation_script', 'authorization',
  ]) assert.ok(ids.has(expected), `missing Eigen blocker ${expected}`);
  assert.ok(!ids.has('protocol_identity'));
  assert.ok(!ids.has('mixed_negative_lineage'));
  assert.ok(!ids.has('baseline_family'));
  assert.ok(!ids.has('full_metric_panel'));
  assert.throws(() => assertEvaluationAuthorized(assessment), /RESEARCH_EVALUATION_BLOCKED/);
});

test('malformed control objects fail closed', () => {
  assert.throws(() => assessNPMSSuccessorReadiness(null), TypeError);
  assert.throws(() => assessEigenReplicationReadiness(null), TypeError);
  assert.equal(assessNPMSSuccessorReadiness({}).ready_for_evaluation, false);
  assert.equal(assessEigenReplicationReadiness({}).ready_for_evaluation, false);
});

test('synthetic NPMS freeze can close all gates without loading an outcome', async () => {
  const config = structuredClone(await load(npmsUrl));
  config.successor_source = {
    source_sha256: '1'.repeat(64),
    environment_lock_sha256: '2'.repeat(64),
    hardware_identity: 'synthetic-hardware',
  };
  config.data = {
    dataset_or_generator_id: 'synthetic-dataset',
    dataset_sha256: '3'.repeat(64),
    split_manifest_sha256: '4'.repeat(64),
    train_validation_test_frozen: true,
    held_out_outcomes_sealed: true,
  };
  config.mechanism = {
    memory_spectrum_definition: 'synthetic-spectrum-definition',
    behavior_or_intervention_target: 'synthetic-target',
    coordinate_invariant_parameter_control: 'synthetic-parameter-control',
    state_space_control: 'synthetic-state-control',
    spectral_control: 'synthetic-spectral-control',
  };
  config.evaluation = {
    primary_metric: 'synthetic-primary',
    mandatory_secondary_metrics: ['synthetic-secondary'],
    primary_comparison: 'synthetic-comparison',
    success_threshold: 0.05,
    material_regression_guardrail: 0.02,
    uncertainty_method: 'synthetic-paired-bootstrap',
    seeds_or_determinism_rule: 'synthetic-seed-rule',
    compute_cap: 'synthetic-compute-cap',
    raw_output_retention: 'synthetic-retention',
    evaluation_script_sha256: '5'.repeat(64),
  };
  config.evaluation_authorized = true;
  const assessment = assessNPMSSuccessorReadiness(config);
  assert.equal(assessment.blocker_count, 0);
  assert.equal(assessment.ready_for_evaluation, true);
  assert.equal(assertEvaluationAuthorized(assessment), assessment);
});

test('synthetic Eigen-JEPA freeze can close all gates without metric shopping', async () => {
  const config = structuredClone(await load(eigenUrl));
  config.source = {
    implementation_sha256: '1'.repeat(64),
    environment_lock_sha256: '2'.repeat(64),
    hardware_identity: 'synthetic-hardware',
  };
  config.datasets.dataset_manifest_sha256 = '3'.repeat(64);
  config.datasets.chronological_split_manifest_sha256 = '4'.repeat(64);
  config.methods.preprocessing_rule = 'synthetic-preprocessing';
  config.methods.shrinkage_rule = 'synthetic-shrinkage';
  config.methods.block_length = 20;
  config.methods.context_length = 4;
  config.methods.regularization_selection_rule = 'validation-only';
  config.methods.parameter_budget_rule = 'report-and-match-where-applicable';
  config.evaluation.primary_metric = 'MATRIX_MSE';
  config.evaluation.strongest_direct_baseline_selection_rule = 'lowest validation MATRIX_MSE among frozen direct baselines';
  config.evaluation.material_primary_improvement_threshold = 0.01;
  config.evaluation.secondary_regression_guardrail = 0.02;
  config.evaluation.paired_uncertainty_method = 'synthetic-paired-bootstrap';
  config.evaluation.stochastic_seed_rule = 'candidate only; deterministic baselines once';
  config.evaluation.compute_cap = 'synthetic-compute-cap';
  config.evaluation.raw_output_retention = 'synthetic-retention';
  config.evaluation.evaluation_script_sha256 = '5'.repeat(64);
  config.evaluation_authorized = true;
  const assessment = assessEigenReplicationReadiness(config);
  assert.equal(assessment.blocker_count, 0);
  assert.equal(assessment.ready_for_evaluation, true);
  assert.equal(assertEvaluationAuthorized(assessment), assessment);
});
