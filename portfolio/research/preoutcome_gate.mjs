const SHA256 = /^[0-9a-f]{64}$/;

function isSha256(value) {
  return typeof value === 'string' && SHA256.test(value);
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function gate(checks, blockers, id, passed, detail) {
  const ok = passed === true;
  checks.push({ id, passed: ok, detail });
  if (!ok) blockers.push({ id, detail });
}

export function assessNPMSSuccessorReadiness(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('NPMS successor freeze must be an object');
  }
  const checks = [];
  const blockers = [];
  const source = config.successor_source ?? {};
  const data = config.data ?? {};
  const mechanism = config.mechanism ?? {};
  const evaluation = config.evaluation ?? {};

  gate(checks, blockers, 'protocol_identity', config.protocol_id === 'NPMS-BEYOND-PARAMETERS-V1' && config.protocol_state === 'PREOUTCOME_FREEZE', 'NPMS successor protocol identity/state must remain frozen');
  gate(checks, blockers, 'negative_control_lineage', config.base_lineage?.current_mechanism_verdict === 'PARAMETER_CONFOUNDED_OR_NON_UNIQUE' && isSha256(config.base_lineage?.recovered_atlas_archive_sha256) && isSha256(config.base_lineage?.adverse_control_archive_sha256), 'the parameter-confounded/non-unique precursor and its archive identities must remain explicit');
  gate(checks, blockers, 'successor_source', isSha256(source.source_sha256), 'successor implementation/source hash must be pinned');
  gate(checks, blockers, 'environment', isSha256(source.environment_lock_sha256) && nonempty(source.hardware_identity), 'environment and hardware identity must be frozen');
  gate(checks, blockers, 'dataset_identity', nonempty(data.dataset_or_generator_id) && isSha256(data.dataset_sha256), 'dataset/generator identity and hash must be pinned');
  gate(checks, blockers, 'split_manifest', isSha256(data.split_manifest_sha256) && data.train_validation_test_frozen === true && data.held_out_outcomes_sealed === true, 'chronological/held-out split identity must be frozen and outcomes sealed');
  gate(checks, blockers, 'memory_spectrum_definition', nonempty(mechanism.memory_spectrum_definition), 'memory-spectrum quantity must be defined operationally');
  gate(checks, blockers, 'target_definition', nonempty(mechanism.behavior_or_intervention_target), 'behavior/intervention target must be defined before outcomes');
  gate(checks, blockers, 'parameter_control', nonempty(mechanism.coordinate_invariant_parameter_control), 'coordinate-invariant parameter control must be frozen');
  gate(checks, blockers, 'state_space_control', nonempty(mechanism.state_space_control), 'strong state-space control must be frozen');
  gate(checks, blockers, 'spectral_control', nonempty(mechanism.spectral_control), 'strong non-NPMS spectral control must be frozen');
  gate(checks, blockers, 'primary_metric', nonempty(evaluation.primary_metric) && nonempty(evaluation.primary_comparison), 'one primary held-out metric and comparison must be frozen');
  gate(checks, blockers, 'secondary_metrics', Array.isArray(evaluation.mandatory_secondary_metrics) && evaluation.mandatory_secondary_metrics.length > 0, 'mandatory secondary metrics must be frozen');
  gate(checks, blockers, 'success_threshold', positiveNumber(evaluation.success_threshold), 'material primary success threshold must be positive and frozen');
  gate(checks, blockers, 'regression_guardrail', positiveNumber(evaluation.material_regression_guardrail), 'material adverse-regression guardrail must be positive and frozen');
  gate(checks, blockers, 'uncertainty', nonempty(evaluation.uncertainty_method), 'paired/held-out uncertainty method must be frozen');
  gate(checks, blockers, 'seed_rule', nonempty(evaluation.seeds_or_determinism_rule), 'seed or determinism rule must be frozen');
  gate(checks, blockers, 'compute_cap', nonempty(evaluation.compute_cap), 'compute cap must be frozen');
  gate(checks, blockers, 'raw_retention', nonempty(evaluation.raw_output_retention), 'raw output retention contract must be frozen');
  gate(checks, blockers, 'evaluation_script', isSha256(evaluation.evaluation_script_sha256), 'evaluation script hash must be pinned');

  const prerequisitesClosed = blockers.length === 0;
  gate(checks, blockers, 'authorization', config.evaluation_authorized === true, 'evaluation_authorized must be explicitly set true only after every pre-outcome gate closes');

  return {
    protocol_id: config.protocol_id ?? null,
    prerequisites_closed: prerequisitesClosed,
    evaluation_authorized: config.evaluation_authorized === true,
    ready_for_evaluation: prerequisitesClosed && config.evaluation_authorized === true,
    blocker_count: blockers.length,
    blockers,
    checks,
  };
}

export function assessEigenReplicationReadiness(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('Eigen-JEPA replication freeze must be an object');
  }
  const checks = [];
  const blockers = [];
  const source = config.source ?? {};
  const datasets = config.datasets ?? {};
  const methods = config.methods ?? {};
  const evaluation = config.evaluation ?? {};

  gate(checks, blockers, 'protocol_identity', config.protocol_id === 'EIGEN-JEPA-MULTIDATASET-V1' && config.protocol_state === 'PREOUTCOME_FREEZE', 'Eigen-JEPA successor protocol identity/state must remain frozen');
  gate(checks, blockers, 'mixed_negative_lineage', config.base_lineage?.current_verdict === 'REPRODUCED_REAL_DATA_MIXED_NEGATIVE' && isSha256(config.base_lineage?.recovered_archive_sha256), 'current mixed/negative lineage and archive identity must remain explicit');
  gate(checks, blockers, 'implementation', isSha256(source.implementation_sha256), 'successor implementation hash must be pinned');
  gate(checks, blockers, 'environment', isSha256(source.environment_lock_sha256) && nonempty(source.hardware_identity), 'environment and hardware identity must be frozen');
  gate(checks, blockers, 'dataset_manifest', isSha256(datasets.dataset_manifest_sha256) && datasets.minimum_distinct_real_datasets >= 2 && datasets.at_least_one_additional_dataset_beyond_fama_french === true, 'at least two real datasets including one new universe must be pinned');
  gate(checks, blockers, 'chronological_splits', isSha256(datasets.chronological_split_manifest_sha256) && datasets.no_random_temporal_leakage === true, 'chronological split manifest must be pinned with no random temporal leakage');

  const requiredBaselines = ['PERSISTENCE', 'RAW_MATRIX_RIDGE', 'LOG_MATRIX_RIDGE', 'CHOLESKY_RIDGE'];
  gate(checks, blockers, 'baseline_family', Array.isArray(methods.mandatory_baselines) && requiredBaselines.every((name) => methods.mandatory_baselines.includes(name)), 'all strong direct baseline families must remain included');
  gate(checks, blockers, 'preprocessing', nonempty(methods.preprocessing_rule) && nonempty(methods.shrinkage_rule), 'preprocessing and covariance shrinkage rules must be frozen');
  gate(checks, blockers, 'temporal_geometry', positiveNumber(methods.block_length) && positiveNumber(methods.context_length), 'block and context lengths must be frozen');
  gate(checks, blockers, 'selection_rule', nonempty(methods.regularization_selection_rule), 'regularization-selection rule must be frozen without test access');
  gate(checks, blockers, 'parameter_budget', nonempty(methods.parameter_budget_rule), 'candidate/direct baseline budget/reporting rule must be frozen');

  const mandatoryMetrics = ['MATRIX_MSE', 'LOG_DISTANCE', 'EIGENVALUE_MSE', 'SUBSPACE_DISTANCE'];
  gate(checks, blockers, 'primary_metric', nonempty(evaluation.primary_metric) && mandatoryMetrics.includes(evaluation.primary_metric), 'one primary metric from the mandatory panel must be frozen before execution');
  gate(checks, blockers, 'full_metric_panel', Array.isArray(evaluation.mandatory_secondary_metrics) && mandatoryMetrics.every((metric) => evaluation.mandatory_secondary_metrics.includes(metric)), 'the complete four-metric panel must be reported regardless of outcome');
  gate(checks, blockers, 'strongest_baseline_rule', nonempty(evaluation.strongest_direct_baseline_selection_rule), 'strongest direct baseline selection rule must be frozen');
  gate(checks, blockers, 'primary_improvement', positiveNumber(evaluation.material_primary_improvement_threshold), 'material primary improvement threshold must be positive and frozen');
  gate(checks, blockers, 'secondary_guardrail', positiveNumber(evaluation.secondary_regression_guardrail), 'mandatory secondary-metric regression guardrail must be positive and frozen');
  gate(checks, blockers, 'paired_uncertainty', nonempty(evaluation.paired_uncertainty_method), 'paired target-level uncertainty method must be frozen');
  gate(checks, blockers, 'seed_rule', nonempty(evaluation.stochastic_seed_rule) && evaluation.deterministic_baseline_seed_replication_forbidden === true, 'stochastic seed rule must be frozen and fake deterministic seed replication forbidden');
  gate(checks, blockers, 'compute_cap', nonempty(evaluation.compute_cap), 'compute/runtime cap must be frozen');
  gate(checks, blockers, 'raw_retention', nonempty(evaluation.raw_output_retention), 'raw output retention contract must be frozen');
  gate(checks, blockers, 'evaluation_script', isSha256(evaluation.evaluation_script_sha256), 'evaluation script hash must be pinned');

  const prerequisitesClosed = blockers.length === 0;
  gate(checks, blockers, 'authorization', config.evaluation_authorized === true, 'evaluation_authorized must be explicitly set true only after every pre-outcome gate closes');

  return {
    protocol_id: config.protocol_id ?? null,
    prerequisites_closed: prerequisitesClosed,
    evaluation_authorized: config.evaluation_authorized === true,
    ready_for_evaluation: prerequisitesClosed && config.evaluation_authorized === true,
    blocker_count: blockers.length,
    blockers,
    checks,
  };
}

export function assertEvaluationAuthorized(assessment) {
  if (!assessment?.ready_for_evaluation) {
    const ids = assessment?.blockers?.map(({ id }) => id).join(', ') ?? '';
    throw new Error(`RESEARCH_EVALUATION_BLOCKED${ids ? `: ${ids}` : ''}`);
  }
  return assessment;
}
