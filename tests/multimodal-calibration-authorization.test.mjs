import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {
  assessAuthorization,
  validateAuthorizationManifest
} from '../research/multimodal-calibration/validate-authorization.mjs';

const manifestPath = new URL('../research/multimodal-calibration/AUTHORIZATION_MANIFEST.json', import.meta.url);

async function loadManifest() {
  return JSON.parse(await fs.readFile(manifestPath, 'utf8'));
}

function completeManifest(manifest) {
  const filled = structuredClone(manifest);
  const digestA = 'a'.repeat(64);
  const digestE = 'e'.repeat(64);
  const digestF = 'f'.repeat(64);

  filled.model_runtime.runtime_identity = 'example-runtime@immutable-build-1';
  filled.option_score_extraction.validated_against_model = true;

  Object.assign(filled.temperature_scaling, {
    fit_set_sha256: digestA,
    fitted_temperature: 1.25,
    fitting_log_sha256: digestE
  });

  Object.assign(filled.environment, {
    package_lock_sha256: digestF,
    execution_image_or_host_identity: 'ghcr.io/example/multimodal-calibration@sha256:' + digestA
  });

  filled.status = 'AUTHORIZED';
  filled.execution_authorized = true;
  return filled;
}

test('checked-in manifest binds the exact ScienceQA and model-family freezes but remains fail-closed and blocked', async () => {
  const manifest = await loadManifest();
  const assessment = validateAuthorizationManifest(manifest);

  assert.equal(manifest.dataset.source_uri, 'https://github.com/lupantech/ScienceQA');
  assert.equal(manifest.dataset.release_revision, '2cbf8318e07b9ece895bb2ae605e71e38d623264');
  assert.equal(manifest.dataset.source_files.pid_splits.git_blob_sha, 'bde005092576ebebfed08087879ff774fcd75b62');
  assert.equal(manifest.dataset.source_files.problems.git_blob_sha, '3920b762556abfbfa001f298c9740c36d4e041e1');
  assert.equal(manifest.dataset.freeze_receipt_sha256, '39078814f97c3c120f8c76ac5ac7a312e0e036cf6c027e47ffcf51676287b736');
  assert.equal(manifest.dataset.development_count, 2097);
  assert.equal(manifest.dataset.development_ids_sha256, '84846b05bc8c04c13f026bdd69e7f0fdba9dd884f900615dd4db8754e6179698');
  assert.equal(manifest.dataset.evaluation_count, 2017);
  assert.equal(manifest.dataset.evaluation_ids_sha256, '656886545f24857c86718443aac5270c50e64ae4665dae96df3f373ff799fa8a');

  assert.equal(manifest.model_runtime.provider, 'huggingface_transformers_local');
  assert.equal(manifest.model_runtime.model_id, 'Qwen/Qwen2.5-VL-3B-Instruct');
  assert.equal(manifest.model_runtime.model_revision, '243fd99abe513d2a02a98274ea34c07e8f961b0f');
  assert.equal(manifest.model_runtime.identity_freeze_sha256, '7fe2877fb942e82de6ebc58768bfad2c00b2edc02722f371a10f417e34fbc892');

  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.length > 0);
  assert.ok(!assessment.errors.some((error) => error.startsWith('dataset.')));
  assert.ok(assessment.errors.includes('model_runtime.runtime_identity is unresolved'));
  assert.ok(!assessment.errors.some((error) => error.includes('model_runtime.model_id is unresolved')));
  assert.ok(assessment.errors.some((error) => error.includes('fitted_temperature is unresolved')));
  assert.ok(assessment.errors.some((error) => error.includes('package_lock_sha256')));
});

test('an incomplete manifest cannot declare execution authorization', async () => {
  const manifest = await loadManifest();
  manifest.status = 'AUTHORIZED';
  manifest.execution_authorized = true;

  assert.throws(
    () => validateAuthorizationManifest(manifest),
    /authorization manifest fails closed/
  );
});

test('authorization becomes possible only when every frozen gate is concrete', async () => {
  const manifest = completeManifest(await loadManifest());
  const assessment = validateAuthorizationManifest(manifest);

  assert.equal(assessment.authorized, true);
  assert.deepEqual(assessment.errors, []);
});

test('outcome access permanently blocks pre-outcome authorization state', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.pre_outcome_attestation.evaluation_metrics_inspected = true;

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.includes('evaluation metrics must remain uninspected before authorization'));

  assert.throws(
    () => validateAuthorizationManifest(manifest),
    /authorization manifest fails closed/
  );
});

test('exact dataset receipt, manifest paths, counts and digests cannot drift', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.dataset.freeze_receipt_sha256 = '0'.repeat(64);
  manifest.dataset.development_ids_manifest_path = 'dataset/dev-posthoc.jsonl';
  manifest.dataset.development_count += 1;
  manifest.dataset.evaluation_ids_sha256 = '1'.repeat(64);

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.some((error) => error.startsWith('dataset.freeze_receipt_sha256 must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('dataset.development_ids_manifest_path must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('dataset.development_count must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('dataset.evaluation_ids_sha256 must remain')));
});

test('ScienceQA repository and source-blob identities cannot drift', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.dataset.release_revision = 'main';
  manifest.dataset.source_files.problems.git_blob_sha = '0'.repeat(40);

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.some((error) => error.startsWith('dataset.release_revision must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('dataset.source_files.problems.git_blob_sha must remain')));
});

test('frozen prompt, scorer, transform and shift definitions are authorization-bound', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.option_score_extraction.prompt_template_sha256 = '0'.repeat(64);
  manifest.option_score_extraction.implementation_sha256 = '1'.repeat(64);
  manifest.transforms.implementation_sha256 = '2'.repeat(64);
  manifest.transforms.conditions.S3 = 'gaussian_blur_sigma_3.0';

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.some((error) => error.startsWith('option_score_extraction.prompt_template_sha256 must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('option_score_extraction.implementation_sha256 must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('transforms.implementation_sha256 must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('transforms.conditions.S3 must remain')));
});

test('frozen model-family identity and immutable revisions cannot drift', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.model_runtime.identity_freeze_sha256 = '0'.repeat(64);
  manifest.model_runtime.model_revision = 'main';
  manifest.model_runtime.processor_revision = 'latest';
  manifest.model_runtime.tokenizer_id = 'different/tokenizer';
  manifest.model_runtime.inference_precision = 'float16';

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.identity_freeze_sha256 must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.model_revision must remain')));
  assert.ok(assessment.errors.includes('model_runtime.model_revision must be an immutable revision, not a floating ref'));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.processor_revision must remain')));
  assert.ok(assessment.errors.includes('model_runtime.processor_revision must be an immutable revision, not a floating ref'));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.tokenizer_id must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.inference_precision must remain')));
});

test('artifact contract rejects silent additions or destination drift', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.artifacts.required_paths.push('metrics/posthoc-rescue.json');

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.includes('artifact destination list must exactly match the frozen non-overwriting contract'));
});
