import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import test from 'node:test';

import { assessAuthorization } from '../research/multimodal-calibration/validate-authorization.mjs';

const manifestUrl = new URL('../research/multimodal-calibration/AUTHORIZATION_MANIFEST.json', import.meta.url);
const freezeUrl = new URL('../research/multimodal-calibration/MODEL_RUNTIME_FREEZE_20260905.json', import.meta.url);
const EXPECTED_FREEZE_SHA256 = '7fe2877fb942e82de6ebc58768bfad2c00b2edc02722f371a10f417e34fbc892';
const EXPECTED_REVISION = '243fd99abe513d2a02a98274ea34c07e8f961b0f';

async function load() {
  const [manifestText, freezeBytes] = await Promise.all([
    fs.readFile(manifestUrl, 'utf8'),
    fs.readFile(freezeUrl)
  ]);
  return {
    manifest: JSON.parse(manifestText),
    freeze: JSON.parse(freezeBytes.toString('utf8')),
    freezeBytes
  };
}

test('model-family freeze is content-addressed and pre-outcome', async () => {
  const { manifest, freeze, freezeBytes } = await load();
  const digest = crypto.createHash('sha256').update(freezeBytes).digest('hex');

  assert.equal(digest, EXPECTED_FREEZE_SHA256);
  assert.equal(manifest.model_runtime.identity_freeze_sha256, EXPECTED_FREEZE_SHA256);
  assert.equal(manifest.model_runtime.identity_freeze_path, 'research/multimodal-calibration/MODEL_RUNTIME_FREEZE_20260905.json');

  assert.equal(freeze.provider, 'huggingface_transformers_local');
  assert.equal(freeze.model.id, 'Qwen/Qwen2.5-VL-3B-Instruct');
  assert.equal(freeze.model.revision, EXPECTED_REVISION);
  assert.equal(freeze.processor.revision, EXPECTED_REVISION);
  assert.equal(freeze.tokenizer.revision, EXPECTED_REVISION);
  assert.equal(freeze.inference_precision, 'bfloat16_model_float32_option_logprob_accumulation');

  assert.equal(manifest.model_runtime.provider, freeze.provider);
  assert.equal(manifest.model_runtime.model_id, freeze.model.id);
  assert.equal(manifest.model_runtime.model_revision, freeze.model.revision);
  assert.equal(manifest.model_runtime.processor_id, freeze.processor.id);
  assert.equal(manifest.model_runtime.processor_revision, freeze.processor.revision);
  assert.equal(manifest.model_runtime.tokenizer_id, freeze.tokenizer.id);
  assert.equal(manifest.model_runtime.tokenizer_revision, freeze.tokenizer.revision);
  assert.equal(manifest.model_runtime.inference_precision, freeze.inference_precision);

  assert.equal(freeze.runtime_identity, null);
  assert.equal(freeze.option_scorer_validated_against_runtime, false);
  assert.equal(freeze.evaluation_outcomes_accessed, false);
  assert.equal(freeze.execution_authorized, false);
  assert.equal(manifest.execution_authorized, false);
  assert.equal(manifest.status, 'NOT_AUTHORIZED');
  assert.equal(manifest.results_status, 'NOT_RUN');
});

test('checked-in authorization now blocks only on runtime/model-validation and later gates, not model-family identity', async () => {
  const { manifest } = await load();
  const assessment = assessAuthorization(manifest);

  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.includes('model_runtime.runtime_identity is unresolved'));
  assert.ok(assessment.errors.includes('option-score extraction must be validated against the exact model/runtime'));
  assert.ok(!assessment.errors.some((error) => error.startsWith('model_runtime.provider must remain')));
  assert.ok(!assessment.errors.some((error) => error.startsWith('model_runtime.model_id must remain')));
  assert.ok(!assessment.errors.some((error) => error.startsWith('model_runtime.model_revision must remain')));
  assert.ok(!assessment.errors.some((error) => error.startsWith('model_runtime.processor_revision must remain')));
  assert.ok(!assessment.errors.some((error) => error.startsWith('model_runtime.tokenizer_revision must remain')));
  assert.ok(!assessment.errors.some((error) => error.startsWith('model_runtime.inference_precision must remain')));
});

test('model/provider/revision/precision or freeze-receipt drift fails closed', async () => {
  const { manifest } = await load();
  const tampered = structuredClone(manifest);

  tampered.model_runtime.identity_freeze_sha256 = '0'.repeat(64);
  tampered.model_runtime.provider = 'remote_api';
  tampered.model_runtime.model_revision = 'main';
  tampered.model_runtime.processor_revision = '1'.repeat(40);
  tampered.model_runtime.tokenizer_revision = '2'.repeat(40);
  tampered.model_runtime.inference_precision = 'float16';

  const assessment = assessAuthorization(tampered);
  assert.equal(assessment.authorized, false);
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.identity_freeze_sha256 must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.provider must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.model_revision must remain')));
  assert.ok(assessment.errors.includes('model_runtime.model_revision must be an immutable revision, not a floating ref'));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.processor_revision must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.tokenizer_revision must remain')));
  assert.ok(assessment.errors.some((error) => error.startsWith('model_runtime.inference_precision must remain')));
});
