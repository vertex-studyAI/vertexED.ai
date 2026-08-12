import {
  attentionDistribution,
  buildSyntheticMemory,
  latentSignal,
  weightedMean,
  weightedMedian,
} from './core.mjs';

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function normalizedDistribution(distribution) {
  if (!Array.isArray(distribution) || distribution.length === 0) {
    throw new TypeError('distribution must be a non-empty array');
  }
  const rows = distribution.map((item, index) => {
    const weight = finiteNumber(item?.weight, `distribution[${index}].weight`);
    const value = finiteNumber(item?.value, `distribution[${index}].value`);
    if (weight < 0) throw new RangeError('weights must be >= 0');
    return { weight, value };
  });
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  if (!(total > 0)) throw new RangeError('total weight must be > 0');
  return rows.map((row) => ({ value: row.value, weight: row.weight / total }));
}

export function weightedTrimmedMean(distribution, trimFraction = 0.10) {
  const trim = finiteNumber(trimFraction, 'trimFraction');
  if (trim < 0 || trim >= 0.5) throw new RangeError('trimFraction must be in [0, 0.5)');
  const sorted = normalizedDistribution(distribution).sort((left, right) => left.value - right.value);
  if (trim === 0) return weightedMean(sorted);

  const retained = sorted.map((row) => ({ ...row }));
  let lower = trim;
  for (const row of retained) {
    if (lower <= 0) break;
    const removed = Math.min(row.weight, lower);
    row.weight -= removed;
    lower -= removed;
  }

  let upper = trim;
  for (let index = retained.length - 1; index >= 0 && upper > 0; index -= 1) {
    const row = retained[index];
    const removed = Math.min(row.weight, upper);
    row.weight -= removed;
    upper -= removed;
  }

  const total = retained.reduce((sum, row) => sum + row.weight, 0);
  if (!(total > 0)) throw new RangeError('trim removed all effective weight');
  return retained.reduce((sum, row) => sum + row.weight * row.value, 0) / total;
}

export function weightedHuberLocation(distribution, { delta = 0.15, iterations = 30, tolerance = 1e-10 } = {}) {
  const scale = finiteNumber(delta, 'delta');
  const count = Math.trunc(finiteNumber(iterations, 'iterations'));
  const stop = finiteNumber(tolerance, 'tolerance');
  if (!(scale > 0)) throw new RangeError('delta must be > 0');
  if (count < 1) throw new RangeError('iterations must be >= 1');
  if (!(stop > 0)) throw new RangeError('tolerance must be > 0');

  const rows = normalizedDistribution(distribution);
  let estimate = weightedMedian(rows);
  for (let iteration = 0; iteration < count; iteration += 1) {
    let weightedValue = 0;
    let effectiveWeight = 0;
    for (const row of rows) {
      const residual = row.value - estimate;
      const robustFactor = Math.abs(residual) <= scale ? 1 : scale / Math.abs(residual);
      const effective = row.weight * robustFactor;
      weightedValue += effective * row.value;
      effectiveWeight += effective;
    }
    if (!(effectiveWeight > 0)) throw new RangeError('Huber effective weight vanished');
    const next = weightedValue / effectiveWeight;
    if (Math.abs(next - estimate) <= stop) return next;
    estimate = next;
  }
  return estimate;
}

export function evaluateReadouts(memory, {
  anchors = 24,
  temperature = 0.035,
  trimFraction = 0.10,
  huberDelta = 0.15,
} = {}) {
  const anchorCount = Math.trunc(finiteNumber(anchors, 'anchors'));
  if (anchorCount < 2) throw new RangeError('anchors must be >= 2');
  const totals = { mean: 0, median: 0, trimmed: 0, huber: 0 };

  for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex += 1) {
    const query = anchorIndex / (anchorCount - 1);
    const target = latentSignal(query);
    const distribution = attentionDistribution(memory, query, temperature);
    const predictions = {
      mean: weightedMean(distribution),
      median: weightedMedian(distribution),
      trimmed: weightedTrimmedMean(distribution, trimFraction),
      huber: weightedHuberLocation(distribution, { delta: huberDelta }),
    };
    for (const [name, prediction] of Object.entries(predictions)) {
      totals[name] += Math.abs(prediction - target);
    }
  }

  return Object.fromEntries(Object.entries(totals).map(([name, total]) => [name, total / anchorCount]));
}

function summarize(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.length > 1
    ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
    : 0;
  return { mean, sampleStd: Math.sqrt(variance) };
}

export function runContaminationSweep({
  seeds = 50,
  contaminationRates = [0, 0.05, 0.10, 0.18, 0.25, 0.35],
  trimFraction = 0.10,
  huberDelta = 0.15,
} = {}) {
  const seedCount = Math.trunc(finiteNumber(seeds, 'seeds'));
  if (seedCount < 1) throw new RangeError('seeds must be >= 1');
  const rates = contaminationRates.map((rate, index) => {
    const number = finiteNumber(rate, `contaminationRates[${index}]`);
    if (number < 0 || number > 1) throw new RangeError('contamination rates must be in [0, 1]');
    return number;
  });

  const rows = [];
  for (const rate of rates) {
    const seedResults = [];
    for (let seed = 0; seed < seedCount; seed += 1) {
      const memory = buildSyntheticMemory({
        seed,
        heavyTail: rate > 0,
        contaminationRate: rate,
      });
      seedResults.push(evaluateReadouts(memory, { trimFraction, huberDelta }));
    }

    const metrics = {};
    for (const name of ['mean', 'median', 'trimmed', 'huber']) {
      const distribution = seedResults.map((result) => result[name]);
      metrics[name] = summarize(distribution);
    }
    const baseline = metrics.mean.mean;
    for (const name of ['median', 'trimmed', 'huber']) {
      metrics[name].relativeImprovementVsMean = baseline > 0 ? 1 - metrics[name].mean / baseline : 0;
    }
    rows.push({ contaminationRate: rate, seeds: seedCount, metrics });
  }

  return {
    seeds: seedCount,
    trimFraction,
    huberDelta,
    rows,
  };
}
