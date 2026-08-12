function probability(value, label) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${label} must be finite and in [0, 1]`);
  }
  return Number(value);
}

export function validatePredictions(records) {
  if (!Array.isArray(records) || records.length < 2) {
    throw new TypeError("records must contain at least two predictions");
  }
  return records.map((record, index) => {
    if (!record || (record.correct !== true && record.correct !== false)) {
      throw new TypeError(`records[${index}].correct must be boolean`);
    }
    return {
      confidence: probability(record.confidence, `records[${index}].confidence`),
      correct: record.correct,
      id: typeof record.id === "string" ? record.id : String(index)
    };
  });
}

export function brierScore(records) {
  const clean = validatePredictions(records);
  return clean.reduce((sum, record) => {
    const outcome = record.correct ? 1 : 0;
    return sum + (record.confidence - outcome) ** 2;
  }, 0) / clean.length;
}

export function calibrationBins(records, binCount = 10) {
  const clean = validatePredictions(records);
  if (!Number.isInteger(binCount) || binCount < 1 || binCount > 100) {
    throw new RangeError("binCount must be an integer in [1, 100]");
  }
  const bins = Array.from({ length: binCount }, (_, index) => ({
    index,
    lower: index / binCount,
    upper: (index + 1) / binCount,
    count: 0,
    confidenceSum: 0,
    correctCount: 0
  }));
  for (const record of clean) {
    const index = Math.min(Math.floor(record.confidence * binCount), binCount - 1);
    const bin = bins[index];
    bin.count += 1;
    bin.confidenceSum += record.confidence;
    bin.correctCount += record.correct ? 1 : 0;
  }
  return bins.map((bin) => ({
    index: bin.index,
    lower: bin.lower,
    upper: bin.upper,
    count: bin.count,
    meanConfidence: bin.count === 0 ? null : bin.confidenceSum / bin.count,
    accuracy: bin.count === 0 ? null : bin.correctCount / bin.count
  }));
}

export function expectedCalibrationError(records, binCount = 10) {
  const clean = validatePredictions(records);
  return calibrationBins(clean, binCount).reduce((sum, bin) => {
    if (bin.count === 0) return sum;
    return sum + (bin.count / clean.length) * Math.abs(bin.accuracy - bin.meanConfidence);
  }, 0);
}

export function selectiveRiskCurve(records) {
  const clean = validatePredictions(records)
    .slice()
    .sort((left, right) => right.confidence - left.confidence || left.id.localeCompare(right.id));
  let errors = 0;
  return clean.map((record, index) => {
    if (!record.correct) errors += 1;
    const accepted = index + 1;
    return {
      accepted,
      total: clean.length,
      coverage: accepted / clean.length,
      risk: errors / accepted,
      accuracy: 1 - errors / accepted,
      confidenceThreshold: record.confidence
    };
  });
}

export function selectiveRiskAtCoverage(records, targetCoverage) {
  probability(targetCoverage, "targetCoverage");
  if (targetCoverage <= 0) throw new RangeError("targetCoverage must be > 0");
  const curve = selectiveRiskCurve(records);
  return curve[Math.max(0, Math.ceil(targetCoverage * curve.length) - 1)];
}

export function abstentionReport(records, confidenceThreshold) {
  const clean = validatePredictions(records);
  probability(confidenceThreshold, "confidenceThreshold");
  const accepted = clean.filter((record) => record.confidence >= confidenceThreshold);
  const errors = accepted.filter((record) => !record.correct).length;
  return {
    threshold: confidenceThreshold,
    total: clean.length,
    accepted: accepted.length,
    rejected: clean.length - accepted.length,
    coverage: accepted.length / clean.length,
    acceptedRisk: accepted.length === 0 ? null : errors / accepted.length,
    acceptedAccuracy: accepted.length === 0 ? null : 1 - errors / accepted.length
  };
}

export function summarizeTrust(records, options = {}) {
  const clean = validatePredictions(records);
  const binCount = options.binCount ?? 10;
  const coverages = options.coverages ?? [0.25, 0.5, 0.75, 1];
  if (!Array.isArray(coverages) || coverages.length === 0) throw new TypeError("coverages must be non-empty");
  return {
    observations: clean.length,
    accuracy: clean.filter((record) => record.correct).length / clean.length,
    meanConfidence: clean.reduce((sum, record) => sum + record.confidence, 0) / clean.length,
    brierScore: brierScore(clean),
    expectedCalibrationError: expectedCalibrationError(clean, binCount),
    selectiveRisk: coverages.map((coverage) => selectiveRiskAtCoverage(clean, coverage)),
    calibrationBins: calibrationBins(clean, binCount)
  };
}

export function pairedConfidenceVariants(outcomes) {
  if (!Array.isArray(outcomes) || outcomes.length < 4 || outcomes.some((value) => typeof value !== "boolean")) {
    throw new TypeError("outcomes must be at least four booleans");
  }
  return {
    moderate: outcomes.map((correct, index) => ({ id: `m-${index}`, correct, confidence: correct ? 0.8 : 0.2 })),
    overconfident: outcomes.map((correct, index) => ({ id: `o-${index}`, correct, confidence: correct ? 0.98 : 0.92 }))
  };
}
