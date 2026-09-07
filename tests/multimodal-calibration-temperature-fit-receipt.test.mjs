import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  assessTemperatureFitReceipt,
  verifyTemperatureFitReceipt,
} from '../research/multimodal-calibration/verify-temperature-fit-receipt.mjs';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function buildFixture() {
  const receipt = {
    schema_version: 'multimodal-calibration.temperature-fit-freeze.v1',
    protocol_id: 'TEST-PROTOCOL',
    scope: 'PRE_OUTCOME_DEVELOPMENT_ONLY',
    fit_set: 'development_only_clean_S0',
    fit_set_sha256: 'a'.repeat(64),
    development_ids_sha256: 'b'.repeat(64),
    authorization_manifest_sha256: 'c'.repeat(64),
    input_count: 3,
    objective: 'multiclass_negative_log_likelihood',
    optimizer: 'deterministic_bounded_scalar_search',
    search_space: 'log_temperature',
    temperature_bounds: [0.05, 20],
    stopping_tolerance: 1e-8,
    max_iterations: 500,
    iterations: 42,
    converged: true,
    fitted_temperature: 1.25,
    fitted_nll: 0.4,
    evaluation_rows_consumed: false,
    shifted_rows_consumed: false,
  };
  const receiptBytes = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`);
  const manifest = {
    protocol_id: 'TEST-PROTOCOL',
    dataset: {
      development_count: 3,
      development_ids_sha256: 'b'.repeat(64),
    },
    temperature_scaling: {
      fit_set: 'development_only_clean_S0',
      objective: 'multiclass_negative_log_likelihood',
      optimizer: 'deterministic_bounded_scalar_search',
      temperature_bounds: [0.05, 20],
      stopping_tolerance: 1e-8,
      max_iterations: 500,
      fit_set_sha256: 'a'.repeat(64),
      fitted_temperature: 1.25,
      fitting_log_sha256: sha256(receiptBytes),
    },
  };
  return { manifest, receipt, receiptBytes };
}

test('accepts an exact pre-outcome receipt bound to the authorization manifest', () => {
  const fx = buildFixture();
  const assessment = assessTemperatureFitReceipt(fx);
  assert.equal(assessment.ok, true);
  assert.deepEqual(assessment.errors, []);
});

test('rejects fit-set, temperature, procedure, and receipt-byte drift', () => {
  const fitDrift = buildFixture();
  fitDrift.manifest.temperature_scaling.fit_set_sha256 = 'd'.repeat(64);
  assert.match(assessTemperatureFitReceipt(fitDrift).errors.join('\n'), /fit_set_sha256/);

  const tempDrift = buildFixture();
  tempDrift.manifest.temperature_scaling.fitted_temperature = 1.5;
  assert.match(assessTemperatureFitReceipt(tempDrift).errors.join('\n'), /fitted_temperature/);

  const procedureDrift = buildFixture();
  procedureDrift.manifest.temperature_scaling.temperature_bounds = [0.1, 20];
  assert.match(assessTemperatureFitReceipt(procedureDrift).errors.join('\n'), /temperature_bounds/);

  const byteDrift = buildFixture();
  byteDrift.receiptBytes = Buffer.concat([byteDrift.receiptBytes, Buffer.from('\n')]);
  assert.match(assessTemperatureFitReceipt(byteDrift).errors.join('\n'), /receipt SHA-256/);
});

test('rejects outcome leakage and incomplete fitting', () => {
  const evalLeak = buildFixture();
  evalLeak.receipt.evaluation_rows_consumed = true;
  assert.match(assessTemperatureFitReceipt(evalLeak).errors.join('\n'), /evaluation-row consumption/);

  const shiftedLeak = buildFixture();
  shiftedLeak.receipt.shifted_rows_consumed = true;
  assert.match(assessTemperatureFitReceipt(shiftedLeak).errors.join('\n'), /shifted-row consumption/);

  const unconverged = buildFixture();
  unconverged.receipt.converged = false;
  assert.match(assessTemperatureFitReceipt(unconverged).errors.join('\n'), /did not converge/);
});

test('file verifier returns only verified pre-outcome identity fields', async (t) => {
  const fx = buildFixture();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'temperature-receipt-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const authorizationManifestPath = path.join(root, 'AUTHORIZATION_MANIFEST.json');
  const receiptPath = path.join(root, 'temperature_fit.json');
  await fs.writeFile(authorizationManifestPath, `${JSON.stringify(fx.manifest, null, 2)}\n`);
  await fs.writeFile(receiptPath, fx.receiptBytes);

  const result = await verifyTemperatureFitReceipt({ authorizationManifestPath, receiptPath });
  assert.equal(result.status, 'VERIFIED_PRE_OUTCOME_TEMPERATURE_FIT');
  assert.equal(result.protocol_id, 'TEST-PROTOCOL');
  assert.equal(result.fit_set_sha256, 'a'.repeat(64));
  assert.equal(result.fitting_log_sha256, sha256(fx.receiptBytes));
  assert.equal(result.fitted_temperature, 1.25);
  assert.equal(result.input_count, 3);
});
