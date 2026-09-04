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
  const digestB = 'b'.repeat(64);
  const digestC = 'c'.repeat(64);
  const digestD = 'd'.repeat(64);
  const digestE = 'e'.repeat(64);
  const digestF = 'f'.repeat(64);

  Object.assign(filled.dataset, {
    source_uri: 'https://example.invalid/scienceqa-frozen-source',
    release_revision: 'scienceqa-frozen-revision',
    development_ids_manifest_path: 'research/multimodal-calibration/freeze/development_ids.jsonl',
    development_ids_sha256: digestA,
    development_count: 100,
    evaluation_ids_manifest_path: 'research/multimodal-calibration/freeze/evaluation_ids.jsonl',
    evaluation_ids_sha256: digestB,
    evaluation_count: 200
  });

  Object.assign(filled.model_runtime, {
    provider: 'local',
    model_id: 'example/model',
    model_revision: '0123456789abcdef',
    processor_id: 'example/processor',
    processor_revision: '0123456789abcdef',
    tokenizer_id: 'example/tokenizer',
    tokenizer_revision: '0123456789abcdef',
    inference_precision: 'float32',
    runtime_identity: 'example-runtime'
  });

  Object.assign(filled.option_score_extraction, {
    validated_against_model: true,
    prompt_template_path: 'research/multimodal-calibration/freeze/prompt.txt',
    prompt_template_sha256: digestC
  });

  Object.assign(filled.transforms, {
    implementation_path: 'research/multimodal-calibration/freeze/transforms.mjs',
    implementation_sha256: digestD
  });

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

test('checked-in manifest pins official ScienceQA source but remains fail-closed and blocked', async () => {
  const manifest = await loadManifest();
  const assessment = validateAuthorizationManifest(manifest);

  assert.equal(manifest.dataset.source_uri, 'https://github.com/lupantech/ScienceQA');
  assert.equal(manifest.dataset.release_revision, '2cbf8318e07b9ece895bb2ae605e71e38d623264');
  assert.equal(manifest.dataset.source_files.pid_splits.git_blob_sha, 'bde005092576ebebfed08087879ff774fcd75b62');
  assert.equal(manifest.dataset.source_files.problems.git_blob_sha, '3920b762556abfbfa001f298c9740c36d4e041e1');
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.length > 0);
  assert.ok(assessment.errors.some((error) => error.includes('dataset.development_ids_manifest_path is unresolved')));
  assert.ok(assessment.errors.some((error) => error.includes('model_runtime.model_id is unresolved')));
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

test('malformed digests are rejected instead of treated as frozen identities', async () => {
  const manifest = completeManifest(await loadManifest());
  manifest.dataset.evaluation_ids_sha256 = 'not-a-digest';

  const assessment = assessAuthorization(manifest);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.includes('dataset.evaluation_ids_sha256 must be a lowercase SHA-256 digest'));
});
