import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHA256_RE = /^[a-f0-9]{64}$/;

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function requireCondition(errors, condition, message) {
  if (!condition) errors.push(message);
}

function exactNumber(a, b) {
  return Number.isFinite(a) && Number.isFinite(b) && Object.is(a, b);
}

export function assessTemperatureFitReceipt({ manifest, receipt, receiptBytes }) {
  const errors = [];
  const temperature = manifest?.temperature_scaling ?? {};
  const dataset = manifest?.dataset ?? {};

  requireCondition(errors, receipt?.schema_version === 'multimodal-calibration.temperature-fit-freeze.v1', 'receipt schema_version is invalid');
  requireCondition(errors, receipt?.protocol_id === manifest?.protocol_id, 'receipt protocol_id does not match authorization manifest');
  requireCondition(errors, receipt?.scope === 'PRE_OUTCOME_DEVELOPMENT_ONLY', 'receipt scope must remain PRE_OUTCOME_DEVELOPMENT_ONLY');
  requireCondition(errors, receipt?.fit_set === 'development_only_clean_S0', 'receipt fit_set is invalid');
  requireCondition(errors, typeof receipt?.fit_set_sha256 === 'string' && SHA256_RE.test(receipt.fit_set_sha256), 'receipt fit_set_sha256 is invalid');
  requireCondition(errors, receipt?.fit_set_sha256 === temperature.fit_set_sha256, 'receipt fit_set_sha256 does not match authorization manifest');
  requireCondition(errors, receipt?.development_ids_sha256 === dataset.development_ids_sha256, 'receipt development_ids_sha256 does not match frozen development manifest');
  requireCondition(errors, receipt?.input_count === dataset.development_count, 'receipt input_count does not match frozen development count');
  requireCondition(errors, receipt?.objective === temperature.objective, 'receipt objective does not match frozen procedure');
  requireCondition(errors, receipt?.optimizer === temperature.optimizer, 'receipt optimizer does not match frozen procedure');
  requireCondition(errors, receipt?.search_space === 'log_temperature', 'receipt search_space must remain log_temperature');
  requireCondition(
    errors,
    Array.isArray(receipt?.temperature_bounds)
      && Array.isArray(temperature.temperature_bounds)
      && receipt.temperature_bounds.length === 2
      && temperature.temperature_bounds.length === 2
      && exactNumber(receipt.temperature_bounds[0], temperature.temperature_bounds[0])
      && exactNumber(receipt.temperature_bounds[1], temperature.temperature_bounds[1]),
    'receipt temperature_bounds do not match frozen procedure',
  );
  requireCondition(errors, exactNumber(receipt?.stopping_tolerance, temperature.stopping_tolerance), 'receipt stopping_tolerance does not match frozen procedure');
  requireCondition(errors, receipt?.max_iterations === temperature.max_iterations, 'receipt max_iterations does not match frozen procedure');
  requireCondition(errors, receipt?.converged === true, 'temperature fitting did not converge');
  requireCondition(errors, Number.isInteger(receipt?.iterations) && receipt.iterations >= 0 && receipt.iterations <= temperature.max_iterations, 'receipt iterations are invalid');
  requireCondition(errors, Number.isFinite(receipt?.fitted_temperature) && receipt.fitted_temperature > 0, 'receipt fitted_temperature must be positive and finite');
  requireCondition(errors, exactNumber(receipt?.fitted_temperature, temperature.fitted_temperature), 'receipt fitted_temperature does not match authorization manifest');
  requireCondition(errors, Number.isFinite(receipt?.fitted_nll) && receipt.fitted_nll >= 0, 'receipt fitted_nll must be finite and non-negative');
  requireCondition(errors, receipt?.evaluation_rows_consumed === false, 'receipt indicates evaluation-row consumption');
  requireCondition(errors, receipt?.shifted_rows_consumed === false, 'receipt indicates shifted-row consumption');
  requireCondition(errors, Buffer.isBuffer(receiptBytes), 'receiptBytes must be exact file bytes');
  if (Buffer.isBuffer(receiptBytes)) {
    const digest = sha256(receiptBytes);
    requireCondition(errors, digest === temperature.fitting_log_sha256, 'receipt SHA-256 does not match temperature_scaling.fitting_log_sha256');
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export async function verifyTemperatureFitReceipt({ authorizationManifestPath, receiptPath }) {
  if (typeof authorizationManifestPath !== 'string' || authorizationManifestPath.length === 0) {
    throw new Error('authorizationManifestPath is required');
  }
  if (typeof receiptPath !== 'string' || receiptPath.length === 0) {
    throw new Error('receiptPath is required');
  }

  const [manifestBytes, receiptBytes] = await Promise.all([
    fs.readFile(authorizationManifestPath),
    fs.readFile(receiptPath),
  ]);
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const receipt = JSON.parse(receiptBytes.toString('utf8'));
  const assessment = assessTemperatureFitReceipt({ manifest, receipt, receiptBytes });
  if (!assessment.ok) {
    throw new Error(`temperature fit receipt verification failed:\n- ${assessment.errors.join('\n- ')}`);
  }
  return Object.freeze({
    schema_version: 'multimodal-calibration.temperature-fit-verification.v1',
    status: 'VERIFIED_PRE_OUTCOME_TEMPERATURE_FIT',
    protocol_id: manifest.protocol_id,
    fit_set_sha256: receipt.fit_set_sha256,
    fitting_log_sha256: sha256(receiptBytes),
    fitted_temperature: receipt.fitted_temperature,
    input_count: receipt.input_count,
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
    authorizationManifestPath: value('--authorization-manifest'),
    receiptPath: value('--receipt'),
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  try {
    const result = await verifyTemperatureFitReceipt(parseCliArgs(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
