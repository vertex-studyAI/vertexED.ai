import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fitTemperature } from './fit-temperature.mjs';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function parseJsonl(bytes, label) {
  const text = bytes.toString('utf8');
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) throw new Error(`${label} must contain at least one JSONL row`);
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`${label} contains invalid JSON at line ${index + 1}: ${error.message}`);
    }
  });
}

function validateFrozenProcedure(manifest) {
  requireObject(manifest, 'authorization manifest');
  requireObject(manifest.dataset, 'authorization manifest.dataset');
  requireObject(manifest.temperature_scaling, 'authorization manifest.temperature_scaling');

  const temperature = manifest.temperature_scaling;
  if (temperature.procedure_frozen !== true) throw new Error('temperature-scaling procedure is not frozen');
  if (temperature.fit_set !== 'development_only_clean_S0') throw new Error('unexpected temperature fit set');
  if (temperature.objective !== 'multiclass_negative_log_likelihood') throw new Error('unexpected temperature objective');
  if (temperature.optimizer !== 'deterministic_bounded_scalar_search') throw new Error('unexpected temperature optimizer');
  if (!Array.isArray(temperature.temperature_bounds) || temperature.temperature_bounds.length !== 2) {
    throw new Error('temperature_bounds must contain exactly two values');
  }
  if (!Number.isFinite(temperature.stopping_tolerance) || temperature.stopping_tolerance <= 0) {
    throw new Error('stopping_tolerance must be positive and finite');
  }
  if (!Number.isInteger(temperature.max_iterations) || temperature.max_iterations <= 0) {
    throw new Error('max_iterations must be a positive integer');
  }
  if (!Number.isInteger(manifest.dataset.development_count) || manifest.dataset.development_count <= 0) {
    throw new Error('dataset.development_count must be a positive integer');
  }
  if (typeof manifest.dataset.development_ids_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(manifest.dataset.development_ids_sha256)) {
    throw new Error('dataset.development_ids_sha256 must be a lowercase SHA-256 hex digest');
  }

  return temperature;
}

function validateDevelopmentManifest(rows, manifest) {
  if (rows.length !== manifest.dataset.development_count) {
    throw new Error(`development manifest count mismatch: expected ${manifest.dataset.development_count}, got ${rows.length}`);
  }

  const ids = [];
  const seen = new Set();
  for (const [index, row] of rows.entries()) {
    requireObject(row, `development manifest row ${index}`);
    if (typeof row.id !== 'string' || row.id.length === 0) {
      throw new Error(`development manifest row ${index}.id must be non-empty`);
    }
    if (seen.has(row.id)) throw new Error(`development manifest contains duplicate id ${row.id}`);
    if (row.source_split !== 'val') throw new Error(`development manifest row ${row.id} must come from ScienceQA val`);
    if (typeof row.image !== 'string' || row.image.length === 0) {
      throw new Error(`development manifest row ${row.id}.image must be non-empty`);
    }
    seen.add(row.id);
    ids.push(row.id);
  }
  return ids;
}

function validateFitSetAgainstDevelopment(rows, developmentIds) {
  if (rows.length !== developmentIds.length) {
    throw new Error(`temperature fit-set count mismatch: expected ${developmentIds.length}, got ${rows.length}`);
  }
  for (let index = 0; index < developmentIds.length; index += 1) {
    const row = rows[index];
    requireObject(row, `temperature fit row ${index}`);
    if (row.id !== developmentIds[index]) {
      throw new Error(`temperature fit-set identity/order mismatch at row ${index}: expected ${developmentIds[index]}, got ${row.id ?? '<missing>'}`);
    }
  }
}

export async function freezeTemperatureFit({
  fitSetPath,
  developmentManifestPath,
  authorizationManifestPath,
  outputPath,
}) {
  for (const [label, value] of Object.entries({ fitSetPath, developmentManifestPath, authorizationManifestPath, outputPath })) {
    if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} is required`);
  }

  const [fitBytes, developmentBytes, authorizationBytes] = await Promise.all([
    fs.readFile(fitSetPath),
    fs.readFile(developmentManifestPath),
    fs.readFile(authorizationManifestPath),
  ]);

  const manifest = JSON.parse(authorizationBytes.toString('utf8'));
  const procedure = validateFrozenProcedure(manifest);
  const actualDevelopmentSha = sha256(developmentBytes);
  if (actualDevelopmentSha !== manifest.dataset.development_ids_sha256) {
    throw new Error(`development manifest SHA-256 mismatch: expected ${manifest.dataset.development_ids_sha256}, got ${actualDevelopmentSha}`);
  }

  const developmentRows = parseJsonl(developmentBytes, 'development manifest');
  const developmentIds = validateDevelopmentManifest(developmentRows, manifest);
  const fitRows = parseJsonl(fitBytes, 'temperature fit set');
  validateFitSetAgainstDevelopment(fitRows, developmentIds);

  const result = fitTemperature(fitRows, {
    lower: procedure.temperature_bounds[0],
    upper: procedure.temperature_bounds[1],
    tolerance: procedure.stopping_tolerance,
    maxIterations: procedure.max_iterations,
  });

  const receipt = {
    schema_version: 'multimodal-calibration.temperature-fit-freeze.v1',
    protocol_id: manifest.protocol_id,
    scope: 'PRE_OUTCOME_DEVELOPMENT_ONLY',
    fit_set: procedure.fit_set,
    fit_set_sha256: sha256(fitBytes),
    development_ids_sha256: actualDevelopmentSha,
    authorization_manifest_sha256: sha256(authorizationBytes),
    input_count: fitRows.length,
    objective: result.objective,
    optimizer: result.optimizer,
    search_space: result.search_space,
    temperature_bounds: result.temperature_bounds,
    stopping_tolerance: result.stopping_tolerance,
    max_iterations: result.max_iterations,
    iterations: result.iterations,
    converged: result.converged,
    fitted_temperature: result.fitted_temperature,
    fitted_nll: result.fitted_nll,
    evaluation_rows_consumed: false,
    shifted_rows_consumed: false,
  };

  const receiptBytes = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, receiptBytes, { flag: 'wx' });

  return Object.freeze({
    ...receipt,
    fitting_log_sha256: sha256(receiptBytes),
    output_path: outputPath,
  });
}

function parseCliArgs(argv) {
  const value = (name) => {
    const index = argv.indexOf(name);
    if (index === -1 || !argv[index + 1] || argv[index + 1].startsWith('--')) {
      throw new Error(`missing required argument ${name}`);
    }
    return argv[index + 1];
  };
  return {
    fitSetPath: value('--fit-set'),
    developmentManifestPath: value('--development-manifest'),
    authorizationManifestPath: value('--authorization-manifest'),
    outputPath: value('--output'),
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  try {
    const result = await freezeTemperatureFit(parseCliArgs(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
