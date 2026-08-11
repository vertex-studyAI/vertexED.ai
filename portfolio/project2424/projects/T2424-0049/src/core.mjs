function finiteArray(values, label, minimumLength = 2) {
  if (!Array.isArray(values) || values.length < minimumLength) {
    throw new TypeError(`${label} must be an array with at least ${minimumLength} values`);
  }
  const normalized = values.map(Number);
  if (normalized.some((value) => !Number.isFinite(value))) {
    throw new TypeError(`${label} must contain only finite numbers`);
  }
  return normalized;
}

function positiveInteger(value, label, minimum = 1) {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized < minimum) {
    throw new RangeError(`${label} must be an integer >= ${minimum}`);
  }
  return normalized;
}

export function initialSaturation(length = 32, phase = 0) {
  const n = positiveInteger(length, 'length', 8);
  if (n % 2 !== 0) throw new RangeError('length must be even');
  const p = Number(phase);
  if (!Number.isFinite(p)) throw new TypeError('phase must be finite');
  return Array.from({ length: n }, (_, index) =>
    0.5
      + 0.28 * Math.sin((2 * Math.PI * index) / n + p)
      + 0.12 * Math.sin((4 * Math.PI * index) / n - 0.3 + 0.5 * p));
}

export function permeabilityProfile(length = 32, phase = 0) {
  const n = positiveInteger(length, 'length', 8);
  const p = Number(phase);
  if (!Number.isFinite(p)) throw new TypeError('phase must be finite');
  return Array.from({ length: n }, (_, index) =>
    1
      + 0.3 * Math.sin((2 * Math.PI * index) / n + p)
      + 0.15 * Math.cos((6 * Math.PI * index) / n - p));
}

export function stepPorousState(saturation, permeability, alpha = 0.08) {
  const state = finiteArray(saturation, 'saturation', 4);
  const k = finiteArray(permeability, 'permeability', 4);
  if (state.length !== k.length) throw new RangeError('saturation and permeability lengths must match');
  if (k.some((value) => value <= 0)) throw new RangeError('permeability must be strictly positive');
  const step = Number(alpha);
  if (!Number.isFinite(step) || step < 0 || step > 0.2) {
    throw new RangeError('alpha must be between 0 and 0.2');
  }

  const n = state.length;
  return state.map((value, index) => {
    const left = (index - 1 + n) % n;
    const right = (index + 1) % n;
    const kLeft = (2 * k[index] * k[left]) / (k[index] + k[left]);
    const kRight = (2 * k[index] * k[right]) / (k[index] + k[right]);
    return value + step * (
      kLeft * (state[left] - value)
      + kRight * (state[right] - value)
    );
  });
}

export function encodeLatent(saturation, blockSize = 2) {
  const state = finiteArray(saturation, 'saturation', 4);
  const block = positiveInteger(blockSize, 'blockSize');
  if (state.length % block !== 0) throw new RangeError('blockSize must divide saturation length');
  const latent = [];
  for (let offset = 0; offset < state.length; offset += block) {
    let total = 0;
    for (let index = 0; index < block; index += 1) total += state[offset + index];
    latent.push(total / block);
  }
  return latent;
}

export function periodicLaplacian(latent) {
  const values = finiteArray(latent, 'latent', 3);
  const n = values.length;
  return values.map((value, index) =>
    values[(index - 1 + n) % n] - 2 * value + values[(index + 1) % n]);
}

function validatePair(pair) {
  if (!pair || typeof pair !== 'object') throw new TypeError('pair must be an object');
  const current = finiteArray(pair.current, 'pair.current', 3);
  const next = finiteArray(pair.next, 'pair.next', 3);
  if (current.length !== next.length) throw new RangeError('pair current/next lengths must match');
  return { current, next };
}

export function fitLatentTransitionCoefficient(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) throw new TypeError('pairs must be a non-empty array');
  let numerator = 0;
  let denominator = 0;
  for (const rawPair of pairs) {
    const { current, next } = validatePair(rawPair);
    const laplacian = periodicLaplacian(current);
    for (let index = 0; index < current.length; index += 1) {
      const delta = next[index] - current[index];
      numerator += laplacian[index] * delta;
      denominator += laplacian[index] ** 2;
    }
  }
  if (denominator <= 1e-18) return 0;
  return numerator / denominator;
}

export function predictLatent(current, coefficient) {
  const latent = finiteArray(current, 'current', 3);
  const beta = Number(coefficient);
  if (!Number.isFinite(beta)) throw new TypeError('coefficient must be finite');
  const laplacian = periodicLaplacian(latent);
  return latent.map((value, index) => value + beta * laplacian[index]);
}

export function rmse(actual, predicted) {
  const left = finiteArray(actual, 'actual', 1);
  const right = finiteArray(predicted, 'predicted', 1);
  if (left.length !== right.length) throw new RangeError('actual and predicted lengths must match');
  const mse = left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0) / left.length;
  return Math.sqrt(mse);
}

export function makeTrajectoryPairs({ phase = 0, steps = 10, alpha = 0.08, length = 32 } = {}) {
  const count = positiveInteger(steps, 'steps');
  let state = initialSaturation(length, phase);
  const permeability = permeabilityProfile(length, 0.25 * Number(phase));
  const pairs = [];
  let maxMassDrift = 0;
  for (let step = 0; step < count; step += 1) {
    const currentMass = state.reduce((sum, value) => sum + value, 0);
    const nextState = stepPorousState(state, permeability, alpha);
    const nextMass = nextState.reduce((sum, value) => sum + value, 0);
    maxMassDrift = Math.max(maxMassDrift, Math.abs(nextMass - currentMass));
    pairs.push({ current: encodeLatent(state), next: encodeLatent(nextState) });
    state = nextState;
  }
  return { pairs, maxMassDrift };
}

export function evaluatePairs(coefficient, pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) throw new TypeError('pairs must be a non-empty array');
  const baselineErrors = [];
  const predictorErrors = [];
  for (const rawPair of pairs) {
    const { current, next } = validatePair(rawPair);
    const prediction = predictLatent(current, coefficient);
    for (let index = 0; index < current.length; index += 1) {
      baselineErrors.push(current[index] - next[index]);
      predictorErrors.push(prediction[index] - next[index]);
    }
  }
  const baselineRmse = Math.sqrt(baselineErrors.reduce((sum, value) => sum + value ** 2, 0) / baselineErrors.length);
  const predictorRmse = Math.sqrt(predictorErrors.reduce((sum, value) => sum + value ** 2, 0) / predictorErrors.length);
  const relativeImprovement = baselineRmse <= 1e-15
    ? 0
    : (baselineRmse - predictorRmse) / baselineRmse;
  return { baselineRmse, predictorRmse, relativeImprovement };
}

function collect(phases, { steps, alpha }) {
  const pairs = [];
  let maxMassDrift = 0;
  for (const phase of phases) {
    const generated = makeTrajectoryPairs({ phase, steps, alpha });
    pairs.push(...generated.pairs);
    maxMassDrift = Math.max(maxMassDrift, generated.maxMassDrift);
  }
  return { pairs, maxMassDrift };
}

export function runPorousJepaExperiment() {
  const training = collect([0.1, 0.7, 1.3, 2.0], { steps: 12, alpha: 0.08 });
  const heldOut = collect([0.4, 1.0, 1.7, 2.4], { steps: 8, alpha: 0.08 });
  const coefficient = fitLatentTransitionCoefficient(training.pairs);
  const heldOutMetrics = evaluatePairs(coefficient, heldOut.pairs);

  const zeroTraining = collect([0.1, 0.7], { steps: 4, alpha: 0 });
  const zeroHeldOut = collect([1.0, 1.7], { steps: 4, alpha: 0 });
  const zeroCoefficient = fitLatentTransitionCoefficient(zeroTraining.pairs);
  const zeroDynamicsMetrics = evaluatePairs(zeroCoefficient, zeroHeldOut.pairs);

  const gates = {
    heldOutImprovementAtLeast50Pct: heldOutMetrics.relativeImprovement >= 0.5,
    learnedCoefficientPositiveAndBounded: coefficient > 0 && coefficient < 0.1,
    conservativeMassDriftAtMost1e12: Math.max(training.maxMassDrift, heldOut.maxMassDrift) <= 1e-12,
    zeroDynamicsNoFalseGain: zeroDynamicsMetrics.predictorRmse <= 1e-12
      && Math.abs(zeroDynamicsMetrics.relativeImprovement) <= 1e-12,
  };

  return {
    project: 'T2424-0049',
    name: 'Multiphase Porous JEPA',
    protocol: {
      gridCells: 32,
      latentCells: 16,
      trainPhases: [0.1, 0.7, 1.3, 2.0],
      heldOutPhases: [0.4, 1.0, 1.7, 2.4],
      dynamicAlpha: 0.08,
      baseline: 'latent persistence',
      predictor: 'fixed pooled latent plus learned scalar periodic-Laplacian transition',
    },
    coefficient,
    heldOut: heldOutMetrics,
    zeroDynamics: { coefficient: zeroCoefficient, ...zeroDynamicsMetrics },
    maxMassDrift: Math.max(training.maxMassDrift, heldOut.maxMassDrift),
    gates,
    verdict: Object.values(gates).every(Boolean)
      ? 'PASS_SYNTHETIC_LATENT_PREDICTION_SCREEN'
      : 'NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE',
    claimBoundary: 'synthetic conservative porous-flow latent prediction with a fixed encoder and one learned scalar only; not a trained JEPA, real porous-media benchmark, neural representation result, or publication claim',
  };
}
