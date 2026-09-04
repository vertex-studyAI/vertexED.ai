import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA256_RE = /^[a-f0-9]{64}$/;
const FLOATING_REVISION_RE = /^(?:head|main|master|latest|stable|dev|development|trunk)$/i;

const FROZEN = Object.freeze({
  schemaVersion: 'multimodal-calibration.authorization.v1',
  protocolId: 'MULTIMODAL-CALIBRATION-SCIENCEQA-20260904',
  protocolPath: 'research/multimodal-calibration/PROTOCOL_20260904.md',
  protocolFrozenDate: '2026-09-04',
  dataset: Object.freeze({
    sourceUri: 'https://github.com/lupantech/ScienceQA',
    releaseRevision: '2cbf8318e07b9ece895bb2ae605e71e38d623264',
    pidSplitsPath: 'data/scienceqa/pid_splits.json',
    pidSplitsBlob: 'bde005092576ebebfed08087879ff774fcd75b62',
    problemsPath: 'data/scienceqa/problems.json',
    problemsBlob: '3920b762556abfbfa001f298c9740c36d4e041e1',
    freezeReceiptPath: 'research/multimodal-calibration/DATASET_FREEZE.json',
    freezeReceiptSha256: '39078814f97c3c120f8c76ac5ac7a312e0e036cf6c027e47ffcf51676287b736',
    developmentManifestPath: 'dataset/development_ids.jsonl',
    developmentSha256: '84846b05bc8c04c13f026bdd69e7f0fdba9dd884f900615dd4db8754e6179698',
    developmentCount: 2097,
    evaluationManifestPath: 'dataset/evaluation_ids.jsonl',
    evaluationSha256: '656886545f24857c86718443aac5270c50e64ae4665dae96df3f373ff799fa8a',
    evaluationCount: 2017
  }),
  model: Object.freeze({
    identityFreezePath: 'research/multimodal-calibration/MODEL_RUNTIME_FREEZE_20260905.json',
    identityFreezeSha256: '7fe2877fb942e82de6ebc58768bfad2c00b2edc02722f371a10f417e34fbc892',
    provider: 'huggingface_transformers_local',
    modelId: 'Qwen/Qwen2.5-VL-3B-Instruct',
    modelRevision: '243fd99abe513d2a02a98274ea34c07e8f961b0f',
    processorId: 'Qwen/Qwen2.5-VL-3B-Instruct',
    processorRevision: '243fd99abe513d2a02a98274ea34c07e8f961b0f',
    tokenizerId: 'Qwen/Qwen2.5-VL-3B-Instruct',
    tokenizerRevision: '243fd99abe513d2a02a98274ea34c07e8f961b0f',
    inferencePrecision: 'bfloat16_model_float32_option_logprob_accumulation'
  }),
  scoring: Object.freeze({
    method: 'teacher_forced_option_log_likelihood',
    normalization: 'softmax_over_option_log_likelihoods',
    promptPath: 'research/multimodal-calibration/prompt-template.mjs',
    promptSha256: 'cc2c262712aa35455b24c4b4d55713c6400c43fdcf1355c95934b3c9841deab4',
    implementationPath: 'research/multimodal-calibration/option-scoring.mjs',
    implementationSha256: '6b225e1c27aefd32cb549fdc35b1379674cbd67548256f7194dfb0d82e5896f4'
  }),
  transforms: Object.freeze({
    seed: 20260904,
    library: 'sharp',
    libraryVersion: '0.35.3',
    implementationPath: 'research/multimodal-calibration/transforms.mjs',
    implementationSha256: 'db13dfe39bac853c5367f7dea9796d165542a91f6fc5b6213f8554e45acac496',
    conditions: Object.freeze({
      S0: 'clean',
      S1: 'gaussian_blur_sigma_1.0',
      S2: 'gaussian_blur_sigma_2.0',
      S3: 'gaussian_blur_sigma_4.0',
      S4: 'centered_neutral_occlusion_25_percent_area',
      S5: 'fixed_neutral_placeholder_original_dimensions'
    })
  }),
  artifactPaths: Object.freeze([
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
  ])
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
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

function requireExact(errors, actual, expected, field) {
  requireCondition(errors, actual === expected, `${field} must remain ${JSON.stringify(expected)}`);
}

function requireResolvedRevision(errors, value, field) {
  requireCondition(errors, isNonEmptyString(value), `${field} is unresolved`);
  if (isNonEmptyString(value)) {
    requireCondition(errors, !FLOATING_REVISION_RE.test(value.trim()), `${field} must be an immutable revision, not a floating ref`);
  }
}

export function assessAuthorization(manifest) {
  const errors = [];

  requireExact(errors, manifest?.schema_version, FROZEN.schemaVersion, 'schema_version');
  requireExact(errors, manifest?.protocol_id, FROZEN.protocolId, 'protocol_id');
  requireExact(errors, manifest?.protocol_path, FROZEN.protocolPath, 'protocol_path');
  requireExact(errors, manifest?.protocol_frozen_date, FROZEN.protocolFrozenDate, 'protocol_frozen_date');
  requireExact(errors, manifest?.results_status, 'NOT_RUN', 'results_status');

  const dataset = manifest?.dataset ?? {};
  requireExact(errors, dataset.source_uri, FROZEN.dataset.sourceUri, 'dataset.source_uri');
  requireExact(errors, dataset.release_revision, FROZEN.dataset.releaseRevision, 'dataset.release_revision');
  requireExact(errors, dataset.source_files?.pid_splits?.path, FROZEN.dataset.pidSplitsPath, 'dataset.source_files.pid_splits.path');
  requireExact(errors, dataset.source_files?.pid_splits?.git_blob_sha, FROZEN.dataset.pidSplitsBlob, 'dataset.source_files.pid_splits.git_blob_sha');
  requireExact(errors, dataset.source_files?.problems?.path, FROZEN.dataset.problemsPath, 'dataset.source_files.problems.path');
  requireExact(errors, dataset.source_files?.problems?.git_blob_sha, FROZEN.dataset.problemsBlob, 'dataset.source_files.problems.git_blob_sha');
  requireExact(errors, dataset.freeze_receipt_path, FROZEN.dataset.freezeReceiptPath, 'dataset.freeze_receipt_path');
  requireExact(errors, dataset.freeze_receipt_sha256, FROZEN.dataset.freezeReceiptSha256, 'dataset.freeze_receipt_sha256');
  requireExact(errors, dataset.development_ids_manifest_path, FROZEN.dataset.developmentManifestPath, 'dataset.development_ids_manifest_path');
  requireExact(errors, dataset.development_ids_sha256, FROZEN.dataset.developmentSha256, 'dataset.development_ids_sha256');
  requireExact(errors, dataset.development_count, FROZEN.dataset.developmentCount, 'dataset.development_count');
  requireExact(errors, dataset.evaluation_ids_manifest_path, FROZEN.dataset.evaluationManifestPath, 'dataset.evaluation_ids_manifest_path');
  requireExact(errors, dataset.evaluation_ids_sha256, FROZEN.dataset.evaluationSha256, 'dataset.evaluation_ids_sha256');
  requireExact(errors, dataset.evaluation_count, FROZEN.dataset.evaluationCount, 'dataset.evaluation_count');
  requireCondition(errors, isNonEmptyString(dataset.malformed_record_exclusion_rule), 'dataset.malformed_record_exclusion_rule must be frozen');
  requireCondition(errors, dataset.temperature_fit_uses_development_only === true, 'temperature fitting must use development records only');

  const model = manifest?.model_runtime ?? {};
  requireExact(errors, model.identity_freeze_path, FROZEN.model.identityFreezePath, 'model_runtime.identity_freeze_path');
  requireExact(errors, model.identity_freeze_sha256, FROZEN.model.identityFreezeSha256, 'model_runtime.identity_freeze_sha256');
  requireExact(errors, model.provider, FROZEN.model.provider, 'model_runtime.provider');
  requireExact(errors, model.model_id, FROZEN.model.modelId, 'model_runtime.model_id');
  requireExact(errors, model.model_revision, FROZEN.model.modelRevision, 'model_runtime.model_revision');
  requireExact(errors, model.processor_id, FROZEN.model.processorId, 'model_runtime.processor_id');
  requireExact(errors, model.processor_revision, FROZEN.model.processorRevision, 'model_runtime.processor_revision');
  requireExact(errors, model.tokenizer_id, FROZEN.model.tokenizerId, 'model_runtime.tokenizer_id');
  requireExact(errors, model.tokenizer_revision, FROZEN.model.tokenizerRevision, 'model_runtime.tokenizer_revision');
  requireExact(errors, model.inference_precision, FROZEN.model.inferencePrecision, 'model_runtime.inference_precision');
  requireResolvedRevision(errors, model.model_revision, 'model_runtime.model_revision');
  requireResolvedRevision(errors, model.processor_revision, 'model_runtime.processor_revision');
  requireResolvedRevision(errors, model.tokenizer_revision, 'model_runtime.tokenizer_revision');
  requireCondition(errors, isNonEmptyString(model.runtime_identity), 'model_runtime.runtime_identity is unresolved');

  const scoring = manifest?.option_score_extraction ?? {};
  requireCondition(errors, scoring.procedure_frozen === true, 'option-score extraction procedure must be frozen');
  requireCondition(errors, scoring.validated_against_model === true, 'option-score extraction must be validated against the exact model/runtime');
  requireExact(errors, scoring.method, FROZEN.scoring.method, 'option_score_extraction.method');
  requireExact(errors, scoring.normalization, FROZEN.scoring.normalization, 'option_score_extraction.normalization');
  requireExact(errors, scoring.prompt_template_path, FROZEN.scoring.promptPath, 'option_score_extraction.prompt_template_path');
  requireExact(errors, scoring.prompt_template_sha256, FROZEN.scoring.promptSha256, 'option_score_extraction.prompt_template_sha256');
  requireExact(errors, scoring.implementation_path, FROZEN.scoring.implementationPath, 'option_score_extraction.implementation_path');
  requireExact(errors, scoring.implementation_sha256, FROZEN.scoring.implementationSha256, 'option_score_extraction.implementation_sha256');
  requireCondition(errors, scoring.fail_closed_if_any_option_unscorable === true, 'unscorable options must fail closed');

  const transforms = manifest?.transforms ?? {};
  requireExact(errors, transforms.seed, FROZEN.transforms.seed, 'transforms.seed');
  requireExact(errors, transforms.library, FROZEN.transforms.library, 'transforms.library');
  requireExact(errors, transforms.locked_library_version, FROZEN.transforms.libraryVersion, 'transforms.locked_library_version');
  requireExact(errors, transforms.implementation_path, FROZEN.transforms.implementationPath, 'transforms.implementation_path');
  requireExact(errors, transforms.implementation_sha256, FROZEN.transforms.implementationSha256, 'transforms.implementation_sha256');
  requireCondition(errors, transforms.processor_stochastic_transforms_allowed === false, 'processor stochastic transforms must remain disabled');
  for (const shift of Object.keys(FROZEN.transforms.conditions)) {
    requireExact(errors, transforms.conditions?.[shift], FROZEN.transforms.conditions[shift], `transforms.conditions.${shift}`);
  }

  const temperature = manifest?.temperature_scaling ?? {};
  requireCondition(errors, temperature.procedure_frozen === true, 'temperature-scaling procedure must be frozen');
  requireExact(errors, temperature.fit_set, 'development_only_clean_S0', 'temperature_scaling.fit_set');
  requireExact(errors, temperature.objective, 'multiclass_negative_log_likelihood', 'temperature_scaling.objective');
  requireExact(errors, temperature.optimizer, 'deterministic_bounded_scalar_search', 'temperature_scaling.optimizer');
  requireCondition(errors, Array.isArray(temperature.temperature_bounds) && temperature.temperature_bounds.length === 2 && temperature.temperature_bounds[0] === 0.05 && temperature.temperature_bounds[1] === 20, 'temperature bounds must remain [0.05, 20.0]');
  requireExact(errors, temperature.stopping_tolerance, 1e-8, 'temperature_scaling.stopping_tolerance');
  requireExact(errors, temperature.max_iterations, 500, 'temperature_scaling.max_iterations');
  requireSha256(errors, temperature.fit_set_sha256, 'temperature_scaling.fit_set_sha256');
  requireCondition(errors, isFinitePositive(temperature.fitted_temperature), 'temperature_scaling.fitted_temperature is unresolved');
  requireSha256(errors, temperature.fitting_log_sha256, 'temperature_scaling.fitting_log_sha256');

  const stats = manifest?.statistics ?? {};
  requireExact(errors, stats.ece_equal_width_bins, 15, 'statistics.ece_equal_width_bins');
  requireExact(errors, stats.bootstrap_seed, 20260904, 'statistics.bootstrap_seed');
  requireExact(errors, stats.bootstrap_replicates, 5000, 'statistics.bootstrap_replicates');
  requireExact(errors, stats.bootstrap_interval, 0.95, 'statistics.bootstrap_interval');
  requireCondition(errors, stats.paired_record_level_bootstrap === true, 'bootstrap must remain paired at record level');
  requireExact(errors, stats.shift_aggregate_rule, 'arithmetic_mean_over_S1_through_S5_per_metric', 'statistics.shift_aggregate_rule');
  requireExact(errors, stats.target_selective_risk, 0.2, 'statistics.target_selective_risk');
  requireExact(errors, stats.calibration_warning_rule?.minimum_relative_worsening, 0.1, 'statistics.calibration_warning_rule.minimum_relative_worsening');
  requireExact(errors, stats.calibration_warning_rule?.minimum_primary_calibration_metrics_meeting_threshold, 2, 'statistics.calibration_warning_rule.minimum_primary_calibration_metrics_meeting_threshold');
  requireExact(errors, stats.calibration_warning_rule?.required_aurc_relative_worsening, 0.1, 'statistics.calibration_warning_rule.required_aurc_relative_worsening');
  requireExact(errors, stats.calibration_warning_rule?.maximum_absolute_accuracy_drop_percentage_points, 5, 'statistics.calibration_warning_rule.maximum_absolute_accuracy_drop_percentage_points');
  requireExact(errors, stats.temperature_shift_robustness_rule?.minimum_shift_mean_brier_relative_improvement, 0.05, 'statistics.temperature_shift_robustness_rule.minimum_shift_mean_brier_relative_improvement');
  requireExact(errors, stats.temperature_shift_robustness_rule?.minimum_shift_mean_nll_relative_improvement, 0.05, 'statistics.temperature_shift_robustness_rule.minimum_shift_mean_nll_relative_improvement');
  requireExact(errors, stats.temperature_shift_robustness_rule?.maximum_any_shift_brier_relative_worsening, 0.02, 'statistics.temperature_shift_robustness_rule.maximum_any_shift_brier_relative_worsening');
  requireExact(errors, stats.temperature_shift_robustness_rule?.maximum_any_shift_nll_relative_worsening, 0.02, 'statistics.temperature_shift_robustness_rule.maximum_any_shift_nll_relative_worsening');

  const env = manifest?.environment ?? {};
  requireExact(errors, env.node_engine, '>=22.22.0 <23', 'environment.node_engine');
  requireExact(errors, env.package_manager, 'npm@10.9.8', 'environment.package_manager');
  requireExact(errors, env.package_lock_path, 'package-lock.json', 'environment.package_lock_path');
  requireSha256(errors, env.package_lock_sha256, 'environment.package_lock_sha256');
  requireCondition(errors, isNonEmptyString(env.execution_image_or_host_identity), 'environment.execution_image_or_host_identity is unresolved');

  const artifacts = manifest?.artifacts ?? {};
  requireExact(errors, artifacts.non_overwriting_run_root, 'research/multimodal-calibration/retained/<run_id>', 'artifacts.non_overwriting_run_root');
  requireExact(errors, artifacts.checksum_algorithm, 'SHA-256', 'artifacts.checksum_algorithm');
  requireCondition(errors, artifacts.overwrite_existing_run === false, 'artifact runs must be non-overwriting');
  requireCondition(
    errors,
    Array.isArray(artifacts.required_paths) && JSON.stringify(artifacts.required_paths) === JSON.stringify(FROZEN.artifactPaths),
    'artifact destination list must exactly match the frozen non-overwriting contract'
  );

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
  } else if (manifest.execution_authorized !== false || manifest.status !== 'NOT_AUTHORIZED') {
    throw new Error('incomplete authorization manifest must remain NOT_AUTHORIZED with execution_authorized=false');
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
