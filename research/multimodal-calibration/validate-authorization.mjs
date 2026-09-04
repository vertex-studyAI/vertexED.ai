import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA256_RE = /^[a-f0-9]{64}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isFinitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function requireCondition(errors, condition, message) {
  if (!condition) errors.push(message);
}

function requireSha256(errors, value, field) {
  requireCondition(errors, typeof value === 'string' && SHA256_RE.test(value), `${field} must be a lowercase SHA-256 digest`);
}

export function assessAuthorization(manifest) {
  const errors = [];

  requireCondition(errors, manifest?.schema_version === 'multimodal-calibration.authorization.v1', 'schema_version must be multimodal-calibration.authorization.v1');
  requireCondition(errors, manifest?.protocol_id === 'MULTIMODAL-CALIBRATION-SCIENCEQA-20260904', 'protocol_id does not match the frozen protocol');
  requireCondition(errors, manifest?.results_status === 'NOT_RUN', 'results_status must remain NOT_RUN before authorization');

  const dataset = manifest?.dataset ?? {};
  requireCondition(errors, isNonEmptyString(dataset.source_uri), 'dataset.source_uri is unresolved');
  requireCondition(errors, isNonEmptyString(dataset.release_revision), 'dataset.release_revision is unresolved');
  requireCondition(errors, isNonEmptyString(dataset.development_ids_manifest_path), 'dataset.development_ids_manifest_path is unresolved');
  requireSha256(errors, dataset.development_ids_sha256, 'dataset.development_ids_sha256');
  requireCondition(errors, isPositiveInteger(dataset.development_count), 'dataset.development_count must be a positive integer');
  requireCondition(errors, isNonEmptyString(dataset.evaluation_ids_manifest_path), 'dataset.evaluation_ids_manifest_path is unresolved');
  requireSha256(errors, dataset.evaluation_ids_sha256, 'dataset.evaluation_ids_sha256');
  requireCondition(errors, isPositiveInteger(dataset.evaluation_count), 'dataset.evaluation_count must be a positive integer');
  requireCondition(errors, isNonEmptyString(dataset.malformed_record_exclusion_rule), 'dataset.malformed_record_exclusion_rule must be frozen');
  requireCondition(errors, dataset.temperature_fit_uses_development_only === true, 'temperature fitting must use development records only');

  const model = manifest?.model_runtime ?? {};
  for (const field of ['provider', 'model_id', 'model_revision', 'processor_id', 'processor_revision', 'tokenizer_id', 'tokenizer_revision', 'inference_precision', 'runtime_identity']) {
    requireCondition(errors, isNonEmptyString(model[field]), `model_runtime.${field} is unresolved`);
  }

  const scoring = manifest?.option_score_extraction ?? {};
  requireCondition(errors, scoring.procedure_frozen === true, 'option-score extraction procedure must be frozen');
  requireCondition(errors, scoring.validated_against_model === true, 'option-score extraction must be validated against the exact model/runtime');
  requireCondition(errors, scoring.method === 'teacher_forced_option_log_likelihood', 'option-score extraction method must remain teacher_forced_option_log_likelihood');
  requireCondition(errors, scoring.normalization === 'softmax_over_option_log_likelihoods', 'option-score normalization must remain frozen');
  requireCondition(errors, isNonEmptyString(scoring.prompt_template_path), 'option_score_extraction.prompt_template_path is unresolved');
  requireSha256(errors, scoring.prompt_template_sha256, 'option_score_extraction.prompt_template_sha256');
  requireCondition(errors, scoring.fail_closed_if_any_option_unscorable === true, 'unscorable options must fail closed');

  const transforms = manifest?.transforms ?? {};
  requireCondition(errors, transforms.seed === 20260904, 'transform seed must remain 20260904');
  requireCondition(errors, transforms.library === 'sharp', 'transform library must remain sharp');
  requireCondition(errors, transforms.locked_library_version === '0.35.3', 'transform library version must remain 0.35.3');
  requireCondition(errors, isNonEmptyString(transforms.implementation_path), 'transforms.implementation_path is unresolved');
  requireSha256(errors, transforms.implementation_sha256, 'transforms.implementation_sha256');
  requireCondition(errors, transforms.processor_stochastic_transforms_allowed === false, 'processor stochastic transforms must remain disabled');
  for (const shift of ['S0', 'S1', 'S2', 'S3', 'S4', 'S5']) {
    requireCondition(errors, isNonEmptyString(transforms.conditions?.[shift]), `transforms.conditions.${shift} must be frozen`);
  }

  const temperature = manifest?.temperature_scaling ?? {};
  requireCondition(errors, temperature.procedure_frozen === true, 'temperature-scaling procedure must be frozen');
  requireCondition(errors, temperature.fit_set === 'development_only_clean_S0', 'temperature fit set must remain development_only_clean_S0');
  requireCondition(errors, temperature.objective === 'multiclass_negative_log_likelihood', 'temperature objective must remain multiclass_negative_log_likelihood');
  requireCondition(errors, temperature.optimizer === 'deterministic_bounded_scalar_search', 'temperature optimizer must remain deterministic_bounded_scalar_search');
  requireCondition(errors, Array.isArray(temperature.temperature_bounds) && temperature.temperature_bounds.length === 2 && temperature.temperature_bounds[0] === 0.05 && temperature.temperature_bounds[1] === 20, 'temperature bounds must remain [0.05, 20.0]');
  requireCondition(errors, temperature.stopping_tolerance === 1e-8, 'temperature stopping tolerance must remain 1e-8');
  requireCondition(errors, temperature.max_iterations === 500, 'temperature max_iterations must remain 500');
  requireSha256(errors, temperature.fit_set_sha256, 'temperature_scaling.fit_set_sha256');
  requireCondition(errors, isFinitePositive(temperature.fitted_temperature), 'temperature_scaling.fitted_temperature is unresolved');
  requireSha256(errors, temperature.fitting_log_sha256, 'temperature_scaling.fitting_log_sha256');

  const stats = manifest?.statistics ?? {};
  requireCondition(errors, stats.ece_equal_width_bins === 15, 'ECE bin count must remain 15');
  requireCondition(errors, stats.bootstrap_seed === 20260904, 'bootstrap seed must remain 20260904');
  requireCondition(errors, stats.bootstrap_replicates === 5000, 'bootstrap replicate count must remain 5000');
  requireCondition(errors, stats.bootstrap_interval === 0.95, 'bootstrap interval must remain 0.95');
  requireCondition(errors, stats.paired_record_level_bootstrap === true, 'bootstrap must remain paired at record level');
  requireCondition(errors, stats.shift_aggregate_rule === 'arithmetic_mean_over_S1_through_S5_per_metric', 'shift aggregate rule drifted');
  requireCondition(errors, stats.target_selective_risk === 0.2, 'target selective risk must remain 0.2');
  requireCondition(errors, stats.calibration_warning_rule?.minimum_relative_worsening === 0.1, 'calibration-warning relative worsening threshold must remain 0.1');
  requireCondition(errors, stats.calibration_warning_rule?.minimum_primary_calibration_metrics_meeting_threshold === 2, 'calibration-warning primary metric count must remain 2');
  requireCondition(errors, stats.calibration_warning_rule?.required_aurc_relative_worsening === 0.1, 'calibration-warning AURC threshold must remain 0.1');
  requireCondition(errors, stats.calibration_warning_rule?.maximum_absolute_accuracy_drop_percentage_points === 5, 'calibration-warning accuracy drop ceiling must remain 5 percentage points');
  requireCondition(errors, stats.temperature_shift_robustness_rule?.minimum_shift_mean_brier_relative_improvement === 0.05, 'temperature Brier improvement threshold must remain 0.05');
  requireCondition(errors, stats.temperature_shift_robustness_rule?.minimum_shift_mean_nll_relative_improvement === 0.05, 'temperature NLL improvement threshold must remain 0.05');
  requireCondition(errors, stats.temperature_shift_robustness_rule?.maximum_any_shift_brier_relative_worsening === 0.02, 'temperature per-shift Brier worsening ceiling must remain 0.02');
  requireCondition(errors, stats.temperature_shift_robustness_rule?.maximum_any_shift_nll_relative_worsening === 0.02, 'temperature per-shift NLL worsening ceiling must remain 0.02');

  const env = manifest?.environment ?? {};
  requireCondition(errors, env.node_engine === '>=22.22.0 <23', 'environment.node_engine must match the repository engine');
  requireCondition(errors, env.package_manager === 'npm@10.9.8', 'environment.package_manager must match the repository package manager');
  requireCondition(errors, env.package_lock_path === 'package-lock.json', 'environment.package_lock_path must remain package-lock.json');
  requireSha256(errors, env.package_lock_sha256, 'environment.package_lock_sha256');
  requireCondition(errors, isNonEmptyString(env.execution_image_or_host_identity), 'environment.execution_image_or_host_identity is unresolved');

  const artifacts = manifest?.artifacts ?? {};
  requireCondition(errors, artifacts.non_overwriting_run_root === 'research/multimodal-calibration/retained/<run_id>', 'artifact run root drifted');
  requireCondition(errors, artifacts.checksum_algorithm === 'SHA-256', 'artifact checksum algorithm must remain SHA-256');
  requireCondition(errors, artifacts.overwrite_existing_run === false, 'artifact runs must be non-overwriting');
  const requiredArtifactPaths = [
    'dataset/development_ids.jsonl',
    'dataset/evaluation_ids.jsonl',
    'model/identity.json',
    'calibration/temperature_fit.json',
    'rows/example_shift_method.jsonl',
    'metrics/aggregate.json',
    'metrics/bootstrap.json',
    'logs/stdout.log',
    'logs/stderr.log',
    'execution/command.txt',
    'CHECKSUMS.sha256'
  ];
  requireCondition(errors, Array.isArray(artifacts.required_paths) && requiredArtifactPaths.every((entry) => artifacts.required_paths.includes(entry)), 'artifact destination list is incomplete');

  const attestation = manifest?.pre_outcome_attestation ?? {};
  requireCondition(errors, attestation.evaluation_metrics_inspected === false, 'evaluation metrics must remain uninspected before authorization');
  requireCondition(errors, attestation.evaluation_outputs_generated === false, 'evaluation outputs must remain ungenerated before authorization');
  requireCondition(errors, attestation.choices_selected_after_evaluation_outcomes === false, 'manifest choices cannot be selected after evaluation outcomes');
  requireCondition(errors, isNonEmptyString(attestation.statement), 'pre-outcome attestation statement is required');

  return {
    authorized: errors.length === 0,
    errors
  };
}

export function validateAuthorizationManifest(manifest) {
  const assessment = assessAuthorization(manifest);
  const declaredAuthorized = manifest?.execution_authorized === true || manifest?.status === 'AUTHORIZED';

  if (declaredAuthorized && !assessment.authorized) {
    throw new Error(`authorization manifest fails closed:\n- ${assessment.errors.join('\n- ')}`);
  }

  if (assessment.authorized) {
    if (manifest.execution_authorized !== true || manifest.status !== 'AUTHORIZED') {
      throw new Error('all authorization gates are complete but manifest is not explicitly AUTHORIZED');
    }
  } else {
    if (manifest.execution_authorized !== false || manifest.status !== 'NOT_AUTHORIZED') {
      throw new Error('incomplete authorization manifest must remain NOT_AUTHORIZED with execution_authorized=false');
    }
  }

  return assessment;
}

export async function loadAndValidateAuthorizationManifest(manifestPath) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  return validateAuthorizationManifest(manifest);
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  const manifestPath = process.argv[2] ?? path.join(path.dirname(thisFile), 'AUTHORIZATION_MANIFEST.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const assessment = validateAuthorizationManifest(manifest);
  if (assessment.authorized) {
    console.log('MULTIMODAL_CALIBRATION_AUTHORIZATION=AUTHORIZED');
  } else {
    console.log('MULTIMODAL_CALIBRATION_AUTHORIZATION=BLOCKED');
    for (const error of assessment.errors) console.log(`BLOCKER: ${error}`);
  }
}
