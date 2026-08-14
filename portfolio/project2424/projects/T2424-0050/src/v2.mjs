import { createHash } from 'node:crypto';

import {
  harmonicMean,
  linearPressureBaseline,
  meanAbsoluteError,
  solveSteadyDarcy1D,
  validatePermeability,
} from './core.mjs';

export const DARCY_V2_PROTOCOL_ID = 'DARCY-FREEZE-001 / darcy-operator-ood-v2';
export const DARCY_V2_GRID_CELLS = 128;
export const DARCY_V2_PRIMARY_BLOCKS = 8;
export const DARCY_V2_BLOCK_ABLATIONS = Object.freeze([4, 8, 16, 32]);

export const DARCY_V2_SPLITS = Object.freeze({
  train: Object.freeze({ start: 0, count: 4096, family: 'id' }),
  validation: Object.freeze({ start: 100000, count: 512, family: 'id' }),
  id_test: Object.freeze({ start: 200000, count: 1024, family: 'id' }),
  ood_a: Object.freeze({ start: 300000, count: 512, family: 'ood_a' }),
  ood_b: Object.freeze({ start: 310000, count: 512, family: 'ood_b' }),
  ood_c: Object.freeze({ start: 320000, count: 512, family: 'ood_c' }),
  ood_d: Object.freeze({ start: 330000, count: 512, family: 'ood_d' }),
  ood_e: Object.freeze({ start: 340000, count: 512, family: 'ood_e' }),
});

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function integer(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number)) throw new TypeError(`${label} must be an integer`);
  return number;
}

function positiveInteger(value, label) {
  const number = integer(value, label);
  if (number <= 0) throw new RangeError(`${label} must be > 0`);
  return number;
}

function clamp(value, lower, upper) {
  return Math.max(lower, Math.min(upper, value));
}

function uniform(random, lower, upper) {
  return lower + (upper - lower) * random();
}

function uniformInteger(random, lowerInclusive, upperInclusive) {
  return lowerInclusive + Math.floor(random() * (upperInclusive - lowerInclusive + 1));
}

/** Deterministic 32-bit stream. Seed zero is valid because the frozen train split starts at zero. */
export function createCounterRandom(seedInput) {
  const seed = integer(seedInput, 'seed');
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createNormalSampler(random) {
  let spare = null;
  return () => {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return value;
    }
    let u1 = 0;
    while (u1 <= Number.EPSILON) u1 = random();
    const u2 = random();
    const radius = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;
    spare = radius * Math.sin(angle);
    return radius * Math.cos(angle);
  };
}

function sampleMisalignedBoundaries(random, segmentCount, cellCount, blockCount) {
  const boundaryCount = segmentCount - 1;
  const blockSize = cellCount / blockCount;
  const boundaries = new Set();
  let attempts = 0;
  while (boundaries.size < boundaryCount) {
    attempts += 1;
    if (attempts > 10000) throw new Error('unable to sample unique misaligned boundaries');
    const continuous = random();
    const snapped = clamp(Math.round(continuous * cellCount), 1, cellCount - 1);
    if (snapped % blockSize === 0) continue;
    boundaries.add(snapped);
  }
  return [...boundaries].sort((a, b) => a - b);
}

function sampleSmoothParameters(random, { ell, sigma, mu = [-0.25, 0.25] }) {
  return {
    ell: uniform(random, ell[0], ell[1]),
    sigma: uniform(random, sigma[0], sigma[1]),
    mu: Array.isArray(mu) ? uniform(random, mu[0], mu[1]) : finite(mu, 'mu'),
  };
}

/**
 * Resolve every stochastic generator parameter before any field/solver output is evaluated.
 * This is intentionally outcome-free and is the basis of the frozen split manifest.
 */
export function resolveV2CaseSpec(splitNameInput, seedInput) {
  const splitName = String(splitNameInput);
  const split = DARCY_V2_SPLITS[splitName];
  if (!split) throw new RangeError(`unknown Darcy v2 split: ${splitName}`);
  const seed = integer(seedInput, 'seed');
  if (seed < split.start || seed >= split.start + split.count) {
    throw new RangeError(`seed ${seed} is outside frozen ${splitName} range`);
  }

  const random = createCounterRandom(seed);
  const base = {
    split: splitName,
    family: split.family,
    seed,
    cellCount: DARCY_V2_GRID_CELLS,
    primaryBlockCount: DARCY_V2_PRIMARY_BLOCKS,
  };

  if (split.family === 'id') {
    return {
      ...base,
      generator: 'periodic_squared_exponential_fourier_v1',
      clipLogK: [-4, 4],
      ...sampleSmoothParameters(random, { ell: [0.08, 0.20], sigma: [0.5, 1.25] }),
    };
  }
  if (split.family === 'ood_a') {
    return {
      ...base,
      generator: 'periodic_squared_exponential_fourier_v1',
      clipLogK: [-4, 4],
      ...sampleSmoothParameters(random, { ell: [0.02, 0.05], sigma: [0.5, 1.25] }),
    };
  }
  if (split.family === 'ood_b') {
    return {
      ...base,
      generator: 'periodic_squared_exponential_fourier_v1',
      clipLogK: [-4, 4],
      ...sampleSmoothParameters(random, { ell: [0.30, 0.50], sigma: [0.5, 1.25] }),
    };
  }
  if (split.family === 'ood_c') {
    const segmentCount = uniformInteger(random, 3, 8);
    const boundaries = sampleMisalignedBoundaries(
      random,
      segmentCount,
      DARCY_V2_GRID_CELLS,
      DARCY_V2_PRIMARY_BLOCKS,
    );
    const segmentLogK = Array.from({ length: segmentCount }, () => uniform(random, -3, 3));
    return {
      ...base,
      generator: 'misaligned_piecewise_constant_v1',
      clipLogK: null,
      segmentCount,
      boundaries,
      segmentLogK,
    };
  }
  if (split.family === 'ood_d') {
    return {
      ...base,
      generator: 'periodic_squared_exponential_fourier_v1',
      clipLogK: [-6, 6],
      ...sampleSmoothParameters(random, { ell: [0.05, 0.20], sigma: [1.5, 2.0], mu: 0 }),
    };
  }
  if (split.family === 'ood_e') {
    const smooth = sampleSmoothParameters(random, { ell: [0.08, 0.20], sigma: [0.5, 1.25] });
    const segmentCount = uniformInteger(random, 2, 5);
    const boundaries = sampleMisalignedBoundaries(
      random,
      segmentCount,
      DARCY_V2_GRID_CELLS,
      DARCY_V2_PRIMARY_BLOCKS,
    );
    const segmentLogOffsets = Array.from({ length: segmentCount }, () => uniform(random, -2, 2));
    return {
      ...base,
      generator: 'smooth_times_misaligned_piecewise_v1',
      clipLogK: [-6, 6],
      ...smooth,
      segmentCount,
      boundaries,
      segmentLogOffsets,
    };
  }
  throw new Error(`unimplemented frozen family: ${split.family}`);
}

function periodicSquaredExponentialEigenvalues(cellCount, ellInput) {
  const ell = finite(ellInput, 'ell');
  if (ell <= 0) throw new RangeError('ell must be > 0');
  const covariance = Array.from({ length: cellCount }, (_, offset) => {
    const phase = Math.PI * offset / cellCount;
    return Math.exp((-2 * Math.sin(phase) ** 2) / (ell ** 2));
  });
  const eigenvalues = [];
  for (let mode = 0; mode < cellCount; mode += 1) {
    let value = 0;
    for (let offset = 0; offset < cellCount; offset += 1) {
      value += covariance[offset] * Math.cos((2 * Math.PI * mode * offset) / cellCount);
    }
    if (value < -1e-9) throw new Error(`periodic SE covariance lost PSD at mode ${mode}: ${value}`);
    eigenvalues.push(Math.max(0, value));
  }
  return eigenvalues;
}

/** Exact finite-grid draw from the declared periodic squared-exponential circulant covariance. */
export function samplePeriodicSquaredExponential(random, { cellCount = DARCY_V2_GRID_CELLS, ell }) {
  const cells = positiveInteger(cellCount, 'cellCount');
  if (cells % 2 !== 0) throw new RangeError('Darcy v2 Fourier sampler requires an even cell count');
  const normal = createNormalSampler(random);
  const eigenvalues = periodicSquaredExponentialEigenvalues(cells, ell);
  const coefficients = [];
  coefficients.push({ mode: 0, cosine: normal(), sine: 0 });
  for (let mode = 1; mode < cells / 2; mode += 1) {
    coefficients.push({ mode, cosine: normal(), sine: normal() });
  }
  coefficients.push({ mode: cells / 2, cosine: normal(), sine: 0 });

  return Array.from({ length: cells }, (_, index) => {
    let value = Math.sqrt(eigenvalues[0] / cells) * coefficients[0].cosine;
    for (let mode = 1; mode < cells / 2; mode += 1) {
      const coefficient = coefficients[mode];
      const amplitude = Math.sqrt((2 * eigenvalues[mode]) / cells);
      const angle = (2 * Math.PI * mode * index) / cells;
      value += amplitude * (
        coefficient.cosine * Math.cos(angle) + coefficient.sine * Math.sin(angle)
      );
    }
    const nyquist = coefficients[coefficients.length - 1];
    value += Math.sqrt(eigenvalues[cells / 2] / cells) * nyquist.cosine * (index % 2 === 0 ? 1 : -1);
    return value;
  });
}

function expandPiecewise(cellCount, boundaries, values) {
  const edges = [0, ...boundaries, cellCount];
  const output = [];
  for (let segment = 0; segment < values.length; segment += 1) {
    for (let index = edges[segment]; index < edges[segment + 1]; index += 1) {
      output.push(values[segment]);
    }
  }
  if (output.length !== cellCount) throw new Error('piecewise expansion length mismatch');
  return output;
}

function replaySpecRandomPrefix(spec) {
  // Re-resolving the case spec advances the deterministic stream by exactly the parameter draws.
  const random = createCounterRandom(spec.seed);
  const resolved = resolveV2CaseSpec(spec.split, spec.seed);
  if (stableStringify(resolved) !== stableStringify(spec)) throw new Error('case spec replay mismatch');

  // Advance a second stream by replaying the same parameter resolution mechanics.
  // The explicit branches below mirror resolveV2CaseSpec and leave `random` at the first field draw.
  if (spec.family === 'id' || spec.family === 'ood_a' || spec.family === 'ood_b') {
    random(); random(); random();
  } else if (spec.family === 'ood_d') {
    random(); random();
  } else if (spec.family === 'ood_c') {
    random(); // segment count
    const required = spec.segmentCount - 1;
    const accepted = new Set();
    const blockSize = spec.cellCount / spec.primaryBlockCount;
    while (accepted.size < required) {
      const snapped = clamp(Math.round(random() * spec.cellCount), 1, spec.cellCount - 1);
      if (snapped % blockSize !== 0) accepted.add(snapped);
    }
    for (let index = 0; index < spec.segmentCount; index += 1) random();
  } else if (spec.family === 'ood_e') {
    random(); random(); random(); // smooth ell/sigma/mu
    random(); // segment count
    const required = spec.segmentCount - 1;
    const accepted = new Set();
    const blockSize = spec.cellCount / spec.primaryBlockCount;
    while (accepted.size < required) {
      const snapped = clamp(Math.round(random() * spec.cellCount), 1, spec.cellCount - 1);
      if (snapped % blockSize !== 0) accepted.add(snapped);
    }
    for (let index = 0; index < spec.segmentCount; index += 1) random();
  }
  return random;
}

export function generateV2Permeability(splitName, seed) {
  const spec = resolveV2CaseSpec(splitName, seed);
  const random = replaySpecRandomPrefix(spec);
  let logK;

  if (spec.generator === 'periodic_squared_exponential_fourier_v1') {
    const standardized = samplePeriodicSquaredExponential(random, { cellCount: spec.cellCount, ell: spec.ell });
    logK = standardized.map((value) => spec.mu + spec.sigma * value);
  } else if (spec.generator === 'misaligned_piecewise_constant_v1') {
    logK = expandPiecewise(spec.cellCount, spec.boundaries, spec.segmentLogK);
  } else if (spec.generator === 'smooth_times_misaligned_piecewise_v1') {
    const standardized = samplePeriodicSquaredExponential(random, { cellCount: spec.cellCount, ell: spec.ell });
    const smooth = standardized.map((value) => spec.mu + spec.sigma * value);
    const offsets = expandPiecewise(spec.cellCount, spec.boundaries, spec.segmentLogOffsets);
    logK = smooth.map((value, index) => value + offsets[index]);
  } else {
    throw new Error(`unsupported v2 generator: ${spec.generator}`);
  }

  if (spec.clipLogK) logK = logK.map((value) => clamp(value, spec.clipLogK[0], spec.clipLogK[1]));
  return {
    spec,
    logK,
    permeability: logK.map((value) => Math.exp(value)),
  };
}

function blockAggregate(values, method) {
  if (method === 'harmonic') return harmonicMean(values);
  if (method === 'arithmetic') return values.reduce((sum, value) => sum + value, 0) / values.length;
  if (method === 'log_mean') {
    return Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length);
  }
  throw new RangeError(`unknown block aggregation method: ${method}`);
}

export function coarsePermeabilityV2(permeabilityInput, { blockCount = DARCY_V2_PRIMARY_BLOCKS, method = 'harmonic' } = {}) {
  const permeability = validatePermeability(permeabilityInput);
  const blocks = positiveInteger(blockCount, 'blockCount');
  if (permeability.length % blocks !== 0) throw new RangeError('cell count must be divisible by blockCount');
  const blockSize = permeability.length / blocks;
  const latent = [];
  for (let block = 0; block < blocks; block += 1) {
    latent.push(blockAggregate(permeability.slice(block * blockSize, (block + 1) * blockSize), method));
  }
  return {
    method,
    blockCount: blocks,
    blockSize,
    latent,
    reconstructed: latent.flatMap((value) => Array(blockSize).fill(value)),
  };
}

export function solveCoarseV2(permeabilityInput, options = {}) {
  const coarse = coarsePermeabilityV2(permeabilityInput, options);
  return { ...coarse, ...solveSteadyDarcy1D(coarse.reconstructed) };
}

export function relativeL2(actual, predicted) {
  if (!Array.isArray(actual) || !Array.isArray(predicted) || actual.length !== predicted.length || actual.length === 0) {
    throw new TypeError('actual and predicted must be non-empty arrays of equal length');
  }
  let numerator = 0;
  let denominator = 0;
  for (let index = 0; index < actual.length; index += 1) {
    const truth = finite(actual[index], `actual[${index}]`);
    const estimate = finite(predicted[index], `predicted[${index}]`);
    numerator += (truth - estimate) ** 2;
    denominator += truth ** 2;
  }
  if (denominator <= Number.EPSILON) throw new RangeError('relative L2 denominator is zero');
  return Math.sqrt(numerator / denominator);
}

export function evaluateV2DeterministicControls(permeabilityInput, { blockCount = DARCY_V2_PRIMARY_BLOCKS } = {}) {
  const permeability = validatePermeability(permeabilityInput);
  const exact = solveSteadyDarcy1D(permeability);
  const systems = {
    M1: solveCoarseV2(permeability, { blockCount, method: 'harmonic' }),
    A1: solveCoarseV2(permeability, { blockCount, method: 'arithmetic' }),
    A2: solveCoarseV2(permeability, { blockCount, method: 'log_mean' }),
    B1: linearPressureBaseline(permeability.length),
  };
  const report = {};
  for (const [name, system] of Object.entries(systems)) {
    const pressure = system.pressure;
    report[name] = {
      pressureMae: meanAbsoluteError(exact.pressure, pressure),
      pressureRelativeL2: relativeL2(exact.pressure, pressure),
      maxPressureError: Math.max(...exact.pressure.map((value, index) => Math.abs(value - pressure[index]))),
      leftBoundaryError: Math.abs(exact.pressure[0] - pressure[0]),
      rightBoundaryError: Math.abs(exact.pressure.at(-1) - pressure.at(-1)),
      fluxRelativeError: Number.isFinite(system.flux)
        ? Math.abs(exact.flux - system.flux) / Math.abs(exact.flux)
        : null,
    };
  }
  return { exact, systems, report };
}

export function buildV2SplitManifest() {
  const cases = [];
  for (const [splitName, split] of Object.entries(DARCY_V2_SPLITS)) {
    for (let offset = 0; offset < split.count; offset += 1) {
      cases.push(resolveV2CaseSpec(splitName, split.start + offset));
    }
  }
  return {
    protocolId: DARCY_V2_PROTOCOL_ID,
    schemaVersion: 1,
    outcomeEvaluated: false,
    cellCount: DARCY_V2_GRID_CELLS,
    primaryBlockCount: DARCY_V2_PRIMARY_BLOCKS,
    cases,
  };
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function hashV2Manifest(manifest = buildV2SplitManifest()) {
  return createHash('sha256').update(stableStringify(manifest)).digest('hex');
}
