function validateAccuracy(value, label) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${label} must be finite and in [0, 1]`);
  }
}

export function validateLearningCurve(rows) {
  if (!Array.isArray(rows) || rows.length < 8) {
    throw new TypeError("learning curve must contain at least 8 rows");
  }
  let previousStep = -Infinity;
  return rows.map((row, index) => {
    if (!row || !Number.isFinite(row.step) || row.step <= previousStep) {
      throw new RangeError(`rows[${index}].step must be finite and strictly increasing`);
    }
    validateAccuracy(row.trainAccuracy, `rows[${index}].trainAccuracy`);
    validateAccuracy(row.evalAccuracy, `rows[${index}].evalAccuracy`);
    previousStep = row.step;
    return {
      step: Number(row.step),
      trainAccuracy: Number(row.trainAccuracy),
      evalAccuracy: Number(row.evalAccuracy)
    };
  });
}

export function movingAverage(values, window = 3) {
  if (!Number.isInteger(window) || window < 1) throw new RangeError("window must be a positive integer");
  return values.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = values.slice(start, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

function firstPersistentThreshold(rows, field, threshold, persistence) {
  for (let start = 0; start <= rows.length - persistence; start += 1) {
    let passes = true;
    for (let offset = 0; offset < persistence; offset += 1) {
      if (rows[start + offset][field] < threshold) {
        passes = false;
        break;
      }
    }
    if (passes) return rows[start].step;
  }
  return null;
}

function valueAtOrAfterStep(rows, field, step) {
  if (step === null) return null;
  const row = rows.find((candidate) => candidate.step >= step);
  return row ? row[field] : null;
}

export function analyzeGrokking(rows, options = {}) {
  const clean = validateLearningCurve(rows);
  const smoothingWindow = options.smoothingWindow ?? 3;
  const persistence = options.persistence ?? 3;
  const trainThreshold = options.trainThreshold ?? 0.95;
  const evalThreshold = options.evalThreshold ?? 0.9;
  const minDelaySteps = options.minDelaySteps ?? 1_000;
  const maxEvalAtMemorization = options.maxEvalAtMemorization ?? 0.8;

  if (!Number.isInteger(persistence) || persistence < 1) throw new RangeError("persistence must be a positive integer");
  [trainThreshold, evalThreshold, maxEvalAtMemorization].forEach((value, index) =>
    validateAccuracy(value, ["trainThreshold", "evalThreshold", "maxEvalAtMemorization"][index])
  );
  if (!Number.isFinite(minDelaySteps) || minDelaySteps < 0) throw new RangeError("minDelaySteps must be finite and >= 0");

  const trainSmoothed = movingAverage(clean.map((row) => row.trainAccuracy), smoothingWindow);
  const evalSmoothed = movingAverage(clean.map((row) => row.evalAccuracy), smoothingWindow);
  const smoothed = clean.map((row, index) => ({
    step: row.step,
    trainAccuracy: trainSmoothed[index],
    evalAccuracy: evalSmoothed[index]
  }));

  const memorizationStep = firstPersistentThreshold(smoothed, "trainAccuracy", trainThreshold, persistence);
  const generalizationStep = firstPersistentThreshold(smoothed, "evalAccuracy", evalThreshold, persistence);
  const delaySteps = memorizationStep === null || generalizationStep === null
    ? null
    : generalizationStep - memorizationStep;
  const evalAtMemorization = valueAtOrAfterStep(smoothed, "evalAccuracy", memorizationStep);

  const grokkingDetected = memorizationStep !== null &&
    generalizationStep !== null &&
    delaySteps >= minDelaySteps &&
    generalizationStep > memorizationStep &&
    evalAtMemorization !== null &&
    evalAtMemorization <= maxEvalAtMemorization;

  let verdict = "INSUFFICIENT_EVIDENCE";
  if (memorizationStep === null) verdict = "NO_MEMORIZATION_THRESHOLD";
  else if (generalizationStep === null) verdict = "NO_GENERALIZATION_THRESHOLD";
  else if (grokkingDetected) verdict = "DELAYED_GENERALIZATION_DETECTED";
  else verdict = "NO_DELAYED_GENERALIZATION";

  return {
    verdict,
    grokkingDetected,
    memorizationStep,
    generalizationStep,
    delaySteps,
    evalAtMemorization,
    thresholds: {
      trainThreshold,
      evalThreshold,
      minDelaySteps,
      maxEvalAtMemorization,
      smoothingWindow,
      persistence
    },
    smoothed
  };
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

export function generateSyntheticCurve(options = {}) {
  const rows = options.rows ?? 80;
  const stepSize = options.stepSize ?? 250;
  const trainMidpoint = options.trainMidpoint ?? 2_000;
  const evalMidpoint = options.evalMidpoint ?? 12_000;
  const steepness = options.steepness ?? 0.0012;
  if (!Number.isInteger(rows) || rows < 8) throw new RangeError("rows must be an integer >= 8");
  if (!Number.isFinite(stepSize) || stepSize <= 0) throw new RangeError("stepSize must be > 0");

  return Array.from({ length: rows }, (_, index) => {
    const step = index * stepSize;
    const deterministicRipple = 0.006 * Math.sin(index * 1.7);
    const trainAccuracy = Math.min(1, Math.max(0, 0.02 + 0.98 * sigmoid((step - trainMidpoint) * steepness) + deterministicRipple));
    const evalAccuracy = Math.min(1, Math.max(0, 0.08 + 0.9 * sigmoid((step - evalMidpoint) * steepness) - deterministicRipple / 2));
    return { step, trainAccuracy, evalAccuracy };
  });
}

export function generateMatchedControlCurve(options = {}) {
  const midpoint = options.midpoint ?? 3_000;
  return generateSyntheticCurve({
    ...options,
    trainMidpoint: midpoint,
    evalMidpoint: midpoint + (options.evalLag ?? 250)
  });
}
