import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULTS = Object.freeze({
  lower: 0.05,
  upper: 20.0,
  tolerance: 1e-8,
  maxIterations: 500,
});

function assertFiniteNumber(value, field) {
  if (!Number.isFinite(value)) throw new TypeError(`${field} must be finite`);
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new TypeError('temperature fitting requires at least one development row');
  }

  const ids = new Set();
  return rows.map((row, index) => {
    if (!row || typeof row !== 'object') throw new TypeError(`row ${index} must be an object`);
    if (typeof row.id !== 'string' || row.id.length === 0) throw new TypeError(`row ${index}.id must be non-empty`);
    if (ids.has(row.id)) throw new Error(`duplicate development row id: ${row.id}`);
    ids.add(row.id);

    if (row.split !== 'development') {
      throw new Error(`row ${row.id} is not from the frozen development split`);
    }
    if (row.condition !== 'S0') {
      throw new Error(`row ${row.id} is not clean S0; shifted conditions cannot fit temperature`);
    }
    if (!Array.isArray(row.option_log_likelihoods) || row.option_log_likelihoods.length < 2) {
      throw new TypeError(`row ${row.id}.option_log_likelihoods must contain at least two options`);
    }
    row.option_log_likelihoods.forEach((value, optionIndex) =>
      assertFiniteNumber(value, `row ${row.id}.option_log_likelihoods[${optionIndex}]`),
    );
    if (!Number.isInteger(row.correct_option_index)
      || row.correct_option_index < 0
      || row.correct_option_index >= row.option_log_likelihoods.length) {
      throw new RangeError(`row ${row.id}.correct_option_index is out of range`);
    }

    return {
      id: row.id,
      scores: row.option_log_likelihoods.slice(),
      correct: row.correct_option_index,
    };
  });
}

function logSumExp(values) {
  const max = Math.max(...values);
  let sum = 0;
  for (const value of values) sum += Math.exp(value - max);
  return max + Math.log(sum);
}

export function multiclassNll(rows, temperature) {
  assertFiniteNumber(temperature, 'temperature');
  if (temperature <= 0) throw new RangeError('temperature must be positive');
  const normalized = validateRows(rows);
  let total = 0;
  for (const row of normalized) {
    const scaled = row.scores.map((score) => score / temperature);
    total += logSumExp(scaled) - scaled[row.correct];
  }
  return total / normalized.length;
}

function nllValidated(rows, temperature) {
  let total = 0;
  for (const row of rows) {
    const scaled = row.scores.map((score) => score / temperature);
    total += logSumExp(scaled) - scaled[row.correct];
  }
  return total / rows.length;
}

/**
 * Deterministically fit one positive scalar temperature on frozen development-only clean-S0 rows.
 * Search is performed in log-temperature space so the positive interval is treated symmetrically.
 * No evaluation/shifted row is accepted, and no stochastic optimizer state is involved.
 */
export function fitTemperature(rows, options = {}) {
  const validated = validateRows(rows);
  const lower = options.lower ?? DEFAULTS.lower;
  const upper = options.upper ?? DEFAULTS.upper;
  const tolerance = options.tolerance ?? DEFAULTS.tolerance;
  const maxIterations = options.maxIterations ?? DEFAULTS.maxIterations;

  assertFiniteNumber(lower, 'lower');
  assertFiniteNumber(upper, 'upper');
  assertFiniteNumber(tolerance, 'tolerance');
  if (!(lower > 0 && upper > lower)) throw new RangeError('temperature bounds must satisfy 0 < lower < upper');
  if (!(tolerance > 0)) throw new RangeError('tolerance must be positive');
  if (!Number.isInteger(maxIterations) || maxIterations <= 0) throw new RangeError('maxIterations must be a positive integer');

  let left = Math.log(lower);
  let right = Math.log(upper);
  const phi = (Math.sqrt(5) - 1) / 2;
  let c = right - phi * (right - left);
  let d = left + phi * (right - left);
  let fc = nllValidated(validated, Math.exp(c));
  let fd = nllValidated(validated, Math.exp(d));
  let iterations = 0;

  while ((right - left) > tolerance && iterations < maxIterations) {
    if (fc <= fd) {
      right = d;
      d = c;
      fd = fc;
      c = right - phi * (right - left);
      fc = nllValidated(validated, Math.exp(c));
    } else {
      left = c;
      c = d;
      fc = fd;
      d = left + phi * (right - left);
      fd = nllValidated(validated, Math.exp(d));
    }
    iterations += 1;
  }

  const candidates = [
    { temperature: lower, nll: nllValidated(validated, lower) },
    { temperature: upper, nll: nllValidated(validated, upper) },
    { temperature: Math.exp((left + right) / 2), nll: nllValidated(validated, Math.exp((left + right) / 2)) },
  ];
  candidates.sort((a, b) => (a.nll - b.nll) || (a.temperature - b.temperature));
  const best = candidates[0];

  return Object.freeze({
    schema_version: 'multimodal-calibration.temperature-fit.v1',
    fit_set: 'development_only_clean_S0',
    input_count: validated.length,
    objective: 'multiclass_negative_log_likelihood',
    optimizer: 'deterministic_bounded_scalar_search',
    search_space: 'log_temperature',
    temperature_bounds: [lower, upper],
    stopping_tolerance: tolerance,
    max_iterations: maxIterations,
    iterations,
    converged: (right - left) <= tolerance,
    fitted_temperature: best.temperature,
    fitted_nll: best.nll,
  });
}

export async function readJsonlRows(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`invalid JSONL at line ${index + 1}: ${error.message}`);
    }
  });
}

async function main(argv) {
  if (argv.length !== 1) {
    throw new Error('usage: node research/multimodal-calibration/fit-temperature.mjs <development-clean-s0.jsonl>');
  }
  const rows = await readJsonlRows(argv[0]);
  const result = fitTemperature(rows);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const isCli = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
