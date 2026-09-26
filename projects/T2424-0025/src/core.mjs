const TWO_PI = 2 * Math.PI;

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function unitInterval(value, label) {
  const number = finiteNumber(value, label);
  if (number < 0 || number > 1) throw new RangeError(`${label} must be in [0, 1]`);
  return number;
}

export function createDeterministicRng(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function normalSample(random) {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(TWO_PI * u2);
}

function cauchySample(random) {
  return Math.tan(Math.PI * (random() - 0.5));
}

export function latentSignal(x) {
  const input = unitInterval(x, 'x');
  return Math.sin(TWO_PI * input) + 0.35 * Math.cos(Math.PI * input);
}

export function buildSyntheticMemory({
  seed = 1,
  heavyTail = false,
  anchors = 24,
  replicas = 7,
  contaminationRate = 0.18,
  gaussianStd = 0.03,
  cauchyScale = 0.7,
  keyStd = 0.004,
} = {}) {
  const anchorCount = Math.trunc(finiteNumber(anchors, 'anchors'));
  const replicaCount = Math.trunc(finiteNumber(replicas, 'replicas'));
  const contamination = unitInterval(contaminationRate, 'contaminationRate');
  const gaussian = finiteNumber(gaussianStd, 'gaussianStd');
  const cauchy = finiteNumber(cauchyScale, 'cauchyScale');
  const keyNoise = finiteNumber(keyStd, 'keyStd');
  if (anchorCount < 2) throw new RangeError('anchors must be >= 2');
  if (replicaCount < 1) throw new RangeError('replicas must be >= 1');
  if (gaussian < 0 || cauchy < 0 || keyNoise < 0) throw new RangeError('noise scales must be >= 0');

  const random = createDeterministicRng(seed);
  const slots = [];
  for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex += 1) {
    const anchor = anchorIndex / (anchorCount - 1);
    const target = latentSignal(anchor);
    for (let replica = 0; replica < replicaCount; replica += 1) {
      const key = anchor + normalSample(random) * keyNoise;
      const contaminated = heavyTail && random() < contamination;
      const noise = contaminated
        ? cauchySample(random) * cauchy
        : normalSample(random) * gaussian;
      slots.push({ key, value: target + noise, contaminated });
    }
  }
  return slots;
}

export function attentionDistribution(memory, query, temperature = 0.035) {
  if (!Array.isArray(memory) || memory.length === 0) {
    throw new TypeError('memory must be a non-empty array');
  }
  const q = finiteNumber(query, 'query');
  const scale = finiteNumber(temperature, 'temperature');
  if (scale <= 0) throw new RangeError('temperature must be > 0');

  const logits = memory.map((slot, index) => {
    if (!slot || typeof slot !== 'object') throw new TypeError(`memory[${index}] must be an object`);
    const key = finiteNumber(slot.key, `memory[${index}].key`);
    const value = finiteNumber(slot.value, `memory[${index}].value`);
    return {
      value,
      logit: -((key - q) ** 2) / (2 * scale ** 2),
    };
  });
  const maxLogit = Math.max(...logits.map((slot) => slot.logit));
  const unnormalized = logits.map((slot) => Math.exp(slot.logit - maxLogit));
  const normalizer = unnormalized.reduce((sum, weight) => sum + weight, 0);
  return logits.map((slot, index) => ({
    value: slot.value,
    weight: unnormalized[index] / normalizer,
  }));
}

export function weightedMean(distribution) {
  if (!Array.isArray(distribution) || distribution.length === 0) {
    throw new TypeError('distribution must be a non-empty array');
  }
  return distribution.reduce((sum, item, index) => {
    const weight = finiteNumber(item?.weight, `distribution[${index}].weight`);
    const value = finiteNumber(item?.value, `distribution[${index}].value`);
    if (weight < 0) throw new RangeError('weights must be >= 0');
    return sum + weight * value;
  }, 0);
}

export function weightedMedian(distribution) {
  if (!Array.isArray(distribution) || distribution.length === 0) {
    throw new TypeError('distribution must be a non-empty array');
  }
  const sorted = distribution.map((item, index) => {
    const weight = finiteNumber(item?.weight, `distribution[${index}].weight`);
    const value = finiteNumber(item?.value, `distribution[${index}].value`);
    if (weight < 0) throw new RangeError('weights must be >= 0');
    return { weight, value };
  }).sort((left, right) => left.value - right.value);

  const totalWeight = sorted.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) throw new RangeError('total weight must be > 0');
  let cumulative = 0;
  for (const item of sorted) {
    cumulative += item.weight / totalWeight;
    if (cumulative >= 0.5) return item.value;
  }
  return sorted.at(-1).value;
}

export function evaluateMemory(memory, { anchors = 24, temperature = 0.035 } = {}) {
  const anchorCount = Math.trunc(finiteNumber(anchors, 'anchors'));
  if (anchorCount < 2) throw new RangeError('anchors must be >= 2');
  let meanAbsoluteError = 0;
  let robustAbsoluteError = 0;

  for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex += 1) {
    const query = anchorIndex / (anchorCount - 1);
    const target = latentSignal(query);
    const distribution = attentionDistribution(memory, query, temperature);
    meanAbsoluteError += Math.abs(weightedMean(distribution) - target);
    robustAbsoluteError += Math.abs(weightedMedian(distribution) - target);
  }

  const baselineMae = meanAbsoluteError / anchorCount;
  const robustMae = robustAbsoluteError / anchorCount;
  return {
    queries: anchorCount,
    baselineMae,
    robustMae,
    relativeImprovement: baselineMae > 0 ? 1 - robustMae / baselineMae : 0,
  };
}

export function runNonGaussianMemoryBenchmark({ seeds = 30 } = {}) {
  const seedCount = Math.trunc(finiteNumber(seeds, 'seeds'));
  if (seedCount < 1) throw new RangeError('seeds must be >= 1');
  const heavyResults = [];
  const cleanResults = [];

  for (let seed = 0; seed < seedCount; seed += 1) {
    heavyResults.push(evaluateMemory(buildSyntheticMemory({ seed, heavyTail: true })));
    cleanResults.push(evaluateMemory(buildSyntheticMemory({ seed, heavyTail: false })));
  }

  function summarize(results) {
    const baselineMae = results.reduce((sum, result) => sum + result.baselineMae, 0) / results.length;
    const robustMae = results.reduce((sum, result) => sum + result.robustMae, 0) / results.length;
    return {
      seeds: results.length,
      queries: results.reduce((sum, result) => sum + result.queries, 0),
      baselineMae,
      robustMae,
      relativeImprovement: baselineMae > 0 ? 1 - robustMae / baselineMae : 0,
    };
  }

  const heavyTail = summarize(heavyResults);
  const cleanControl = summarize(cleanResults);
  return {
    heavyTail,
    cleanControl,
    nonGaussianAdvantageGap: heavyTail.relativeImprovement - cleanControl.relativeImprovement,
  };
}
