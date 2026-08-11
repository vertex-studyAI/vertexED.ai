function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function positiveNumber(value, label) {
  const number = finiteNumber(value, label);
  if (number <= 0) throw new RangeError(`${label} must be > 0`);
  return number;
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new RangeError(`${label} must be a positive integer`);
  return number;
}

export function validatePermeability(permeability) {
  if (!Array.isArray(permeability) || permeability.length < 2) {
    throw new TypeError('permeability must be an array with at least two cells');
  }
  return permeability.map((value, index) => positiveNumber(value, `permeability[${index}]`));
}

export function harmonicMean(values) {
  if (!Array.isArray(values) || values.length === 0) throw new TypeError('values must be a non-empty array');
  const normalized = values.map((value, index) => positiveNumber(value, `values[${index}]`));
  return normalized.length / normalized.reduce((sum, value) => sum + 1 / value, 0);
}

export function solveSteadyDarcy1D(permeabilityInput, options = {}) {
  const permeability = validatePermeability(permeabilityInput);
  const leftPressure = finiteNumber(options.leftPressure ?? 1, 'leftPressure');
  const rightPressure = finiteNumber(options.rightPressure ?? 0, 'rightPressure');
  if (leftPressure === rightPressure) throw new RangeError('boundary pressures must differ');

  const cellWidth = 1 / permeability.length;
  const cellResistance = permeability.map((value) => cellWidth / value);
  const totalResistance = cellResistance.reduce((sum, value) => sum + value, 0);
  const pressureDrop = leftPressure - rightPressure;
  const flux = pressureDrop / totalResistance;
  const pressure = [leftPressure];
  let cumulativeResistance = 0;
  for (const resistance of cellResistance) {
    cumulativeResistance += resistance;
    pressure.push(leftPressure - flux * cumulativeResistance);
  }
  pressure[pressure.length - 1] = rightPressure;

  return {
    permeability,
    pressure,
    flux,
    totalResistance,
    cellResistance,
    cellWidth,
    leftPressure,
    rightPressure,
  };
}

export function compressPermeability(permeabilityInput, blockCountInput) {
  const permeability = validatePermeability(permeabilityInput);
  const blockCount = positiveInteger(blockCountInput, 'blockCount');
  if (blockCount > permeability.length) throw new RangeError('blockCount cannot exceed permeability cell count');
  if (permeability.length % blockCount !== 0) {
    throw new RangeError('permeability cell count must be divisible by blockCount');
  }
  const blockSize = permeability.length / blockCount;
  const latent = [];
  for (let block = 0; block < blockCount; block += 1) {
    const values = permeability.slice(block * blockSize, (block + 1) * blockSize);
    latent.push(harmonicMean(values));
  }
  return { latent, blockCount, blockSize, originalCellCount: permeability.length };
}

export function expandLatent(latentInput, blockSizeInput) {
  const latent = validatePermeability(latentInput);
  const blockSize = positiveInteger(blockSizeInput, 'blockSize');
  return latent.flatMap((value) => Array(blockSize).fill(value));
}

export function latentDarcySurrogate(permeabilityInput, blockCount, options = {}) {
  const compressed = compressPermeability(permeabilityInput, blockCount);
  const reconstructed = expandLatent(compressed.latent, compressed.blockSize);
  const solution = solveSteadyDarcy1D(reconstructed, options);
  return { ...solution, latent: compressed.latent, blockCount: compressed.blockCount, blockSize: compressed.blockSize };
}

export function linearPressureBaseline(cellCountInput, options = {}) {
  const cellCount = positiveInteger(cellCountInput, 'cellCount');
  const leftPressure = finiteNumber(options.leftPressure ?? 1, 'leftPressure');
  const rightPressure = finiteNumber(options.rightPressure ?? 0, 'rightPressure');
  const pressure = Array.from({ length: cellCount + 1 }, (_, index) =>
    leftPressure + (rightPressure - leftPressure) * (index / cellCount));
  return { pressure, leftPressure, rightPressure };
}

export function meanAbsoluteError(actual, predicted) {
  if (!Array.isArray(actual) || !Array.isArray(predicted) || actual.length !== predicted.length || actual.length === 0) {
    throw new TypeError('actual and predicted must be non-empty arrays of equal length');
  }
  let total = 0;
  for (let index = 0; index < actual.length; index += 1) {
    total += Math.abs(finiteNumber(actual[index], `actual[${index}]`) - finiteNumber(predicted[index], `predicted[${index}]`));
  }
  return total / actual.length;
}

export function evaluateField(permeabilityInput, { blockCount = 6, leftPressure = 1, rightPressure = 0 } = {}) {
  const permeability = validatePermeability(permeabilityInput);
  const exact = solveSteadyDarcy1D(permeability, { leftPressure, rightPressure });
  const latent = latentDarcySurrogate(permeability, blockCount, { leftPressure, rightPressure });
  const baseline = linearPressureBaseline(permeability.length, { leftPressure, rightPressure });
  const baselineMae = meanAbsoluteError(exact.pressure, baseline.pressure);
  const latentMae = meanAbsoluteError(exact.pressure, latent.pressure);
  const improvement = baselineMae <= 1e-12 ? (latentMae <= 1e-12 ? 0 : -Infinity) : (baselineMae - latentMae) / baselineMae;
  return {
    baselineMae,
    latentMae,
    relativeImprovement: improvement,
    exactFlux: exact.flux,
    latentFlux: latent.flux,
    fluxRelativeError: Math.abs(latent.flux - exact.flux) / Math.abs(exact.flux),
    latent: latent.latent,
  };
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateHeterogeneousField(seedInput, { cellCount = 24, blockCount = 6 } = {}) {
  const seed = positiveInteger(seedInput, 'seed');
  const cells = positiveInteger(cellCount, 'cellCount');
  const blocks = positiveInteger(blockCount, 'blockCount');
  if (cells % blocks !== 0) throw new RangeError('cellCount must be divisible by blockCount');
  const random = mulberry32(seed);
  const blockSize = cells / blocks;
  const field = [];
  for (let block = 0; block < blocks; block += 1) {
    const logCenter = -1.15 + 2.3 * random();
    for (let local = 0; local < blockSize; local += 1) {
      const fineVariation = 0.18 * (random() - 0.5);
      field.push(Math.exp(logCenter + fineVariation));
    }
  }
  return field;
}

export function runBenchmark({ seeds = 20, cellCount = 24, blockCount = 6 } = {}) {
  const seedCount = positiveInteger(seeds, 'seeds');
  const evaluations = [];
  for (let seed = 1; seed <= seedCount; seed += 1) {
    const permeability = generateHeterogeneousField(seed, { cellCount, blockCount });
    evaluations.push({ seed, ...evaluateField(permeability, { blockCount }) });
  }
  const mean = (key) => evaluations.reduce((sum, row) => sum + row[key], 0) / evaluations.length;
  const uniform = evaluateField(Array(cellCount).fill(1.7), { blockCount });
  const summary = {
    seeds: seedCount,
    cellCount,
    blockCount,
    compressionRatio: cellCount / blockCount,
    meanBaselineMae: mean('baselineMae'),
    meanLatentMae: mean('latentMae'),
    meanRelativeImprovement: mean('relativeImprovement'),
    meanFluxRelativeError: mean('fluxRelativeError'),
    maxLatentMae: Math.max(...evaluations.map((row) => row.latentMae)),
    uniformControl: uniform,
  };
  return {
    summary,
    evaluations,
    predeclaredScreen: {
      latentPressureImprovementAtLeast65Percent: summary.meanRelativeImprovement >= 0.65,
      meanFluxRelativeErrorAtMost1Percent: summary.meanFluxRelativeError <= 0.01,
      uniformControlExact: uniform.baselineMae <= 1e-12 && uniform.latentMae <= 1e-12,
    },
  };
}
