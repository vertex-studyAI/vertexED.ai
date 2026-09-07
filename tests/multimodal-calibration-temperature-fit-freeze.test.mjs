import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { freezeTemperatureFit } from '../research/multimodal-calibration/freeze-temperature-fit.mjs';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function jsonl(rows) {
  return Buffer.from(`${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
}

function developmentRows() {
  return [
    { id: 'a', source_split: 'val', image: 'a.png' },
    { id: 'b', source_split: 'val', image: 'b.png' },
    { id: 'c', source_split: 'val', image: 'c.png' },
  ];
}

function fitRows() {
  return [
    { id: 'a', split: 'development', condition: 'S0', option_log_likelihoods: [4, 0], correct_option_index: 0 },
    { id: 'b', split: 'development', condition: 'S0', option_log_likelihoods: [0, 5], correct_option_index: 1 },
    { id: 'c', split: 'development', condition: 'S0', option_log_likelihoods: [3, -2], correct_option_index: 0 },
  ];
}

function authorizationManifest(developmentBytes, overrides = {}) {
  return {
    schema_version: 'multimodal-calibration.authorization.v1',
    protocol_id: 'TEST-PROTOCOL',
    dataset: {
      development_count: 3,
      development_ids_sha256: sha256(developmentBytes),
      ...(overrides.dataset ?? {}),
    },
    temperature_scaling: {
      procedure_frozen: true,
      fit_set: 'development_only_clean_S0',
      objective: 'multiclass_negative_log_likelihood',
      optimizer: 'deterministic_bounded_scalar_search',
      temperature_bounds: [0.05, 20],
      stopping_tolerance: 1e-8,
      max_iterations: 500,
      ...(overrides.temperature_scaling ?? {}),
    },
  };
}

async function fixture(t, { development = developmentRows(), fit = fitRows(), overrides = {} } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'temperature-freeze-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const developmentBytes = jsonl(development);
  const fitBytes = jsonl(fit);
  const authorization = authorizationManifest(developmentBytes, overrides);
  const paths = {
    developmentManifestPath: path.join(root, 'development_ids.jsonl'),
    fitSetPath: path.join(root, 'fit.jsonl'),
    authorizationManifestPath: path.join(root, 'AUTHORIZATION_MANIFEST.json'),
    outputPath: path.join(root, 'temperature_fit.json'),
  };
  await Promise.all([
    fs.writeFile(paths.developmentManifestPath, developmentBytes),
    fs.writeFile(paths.fitSetPath, fitBytes),
    fs.writeFile(paths.authorizationManifestPath, `${JSON.stringify(authorization, null, 2)}\n`),
  ]);
  return { ...paths, developmentBytes, fitBytes };
}

test('freezes a development-only temperature fit with exact provenance hashes', async (t) => {
  const fx = await fixture(t);
  const result = await freezeTemperatureFit(fx);
  const receiptBytes = await fs.readFile(fx.outputPath);
  const receipt = JSON.parse(receiptBytes.toString('utf8'));

  assert.equal(result.fit_set_sha256, sha256(fx.fitBytes));
  assert.equal(result.development_ids_sha256, sha256(fx.developmentBytes));
  assert.equal(result.fitting_log_sha256, sha256(receiptBytes));
  assert.equal(result.input_count, 3);
  assert.equal(result.fitted_temperature, 0.05);
  assert.equal(receipt.scope, 'PRE_OUTCOME_DEVELOPMENT_ONLY');
  assert.equal(receipt.evaluation_rows_consumed, false);
  assert.equal(receipt.shifted_rows_consumed, false);
  assert.equal(receipt.fitting_log_sha256, undefined);
});

test('rejects a development manifest whose exact bytes do not match the frozen digest', async (t) => {
  const fx = await fixture(t);
  const changed = Buffer.from(`${fx.developmentBytes.toString('utf8').trimEnd()}\n\n`);
  await fs.writeFile(fx.developmentManifestPath, changed);

  await assert.rejects(() => freezeTemperatureFit(fx), /development manifest SHA-256 mismatch/);
});

test('rejects partial, extra, or reordered fit sets', async (t) => {
  const partial = await fixture(t, { fit: fitRows().slice(0, 2) });
  await assert.rejects(() => freezeTemperatureFit(partial), /temperature fit-set count mismatch/);

  const reordered = await fixture(t, { fit: [fitRows()[1], fitRows()[0], fitRows()[2]] });
  await assert.rejects(() => freezeTemperatureFit(reordered), /identity\/order mismatch/);
});

test('rejects evaluation or shifted rows even when their ids match the development freeze', async (t) => {
  const evaluation = fitRows();
  evaluation[1] = { ...evaluation[1], split: 'evaluation' };
  const fxEval = await fixture(t, { fit: evaluation });
  await assert.rejects(() => freezeTemperatureFit(fxEval), /not from the frozen development split/);

  const shifted = fitRows();
  shifted[1] = { ...shifted[1], condition: 'S3' };
  const fxShift = await fixture(t, { fit: shifted });
  await assert.rejects(() => freezeTemperatureFit(fxShift), /not clean S0/);
});

test('rejects frozen-procedure drift instead of silently changing optimization semantics', async (t) => {
  const fx = await fixture(t, {
    overrides: { temperature_scaling: { optimizer: 'stochastic_optimizer' } },
  });
  await assert.rejects(() => freezeTemperatureFit(fx), /unexpected temperature optimizer/);
});

test('refuses to overwrite an existing fit receipt', async (t) => {
  const fx = await fixture(t);
  await freezeTemperatureFit(fx);
  await assert.rejects(() => freezeTemperatureFit(fx), /EEXIST/);
});
