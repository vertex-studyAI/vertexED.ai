import { executeResourceBoundedMoe } from '../src/resourceBoundedMoe.mjs';

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function mae(rows) {
  return mean(rows.map(({ prediction, target }) => Math.abs(prediction - target)));
}

export function buildSyntheticSamples(count = 161) {
  if (!Number.isInteger(count) || count < 5) throw new TypeError('count must be an integer >= 5');
  return Array.from({ length: count }, (_, index) => {
    const x = -2 + (4 * index) / (count - 1);
    const regime = x < -0.5 ? 'linear' : x > 0.5 ? 'quadratic' : 'transition';
    const target = regime === 'linear'
      ? 1.8 * x + 0.7
      : regime === 'quadratic'
        ? x * x - 0.4
        : 0.65 * (1.8 * x + 0.7) + 0.35 * (x * x - 0.4);
    return { x, regime, target };
  });
}

export function buildSyntheticExperts() {
  return [
    {
      id: 'linear-specialist',
      cost: 1,
      predict: ({ x }) => 1.8 * x + 0.7,
    },
    {
      id: 'transition-specialist',
      cost: 2,
      predict: ({ x }) => 0.65 * (1.8 * x + 0.7) + 0.35 * (x * x - 0.4),
    },
    {
      id: 'quadratic-specialist',
      cost: 4,
      predict: ({ x }) => x * x - 0.4,
    },
  ];
}

export function syntheticRouter(sample) {
  if (sample.regime === 'linear') return [4.0, 1.1, 0.4];
  if (sample.regime === 'quadratic') return [0.5, 1.2, 5.0];
  return [1.1, 4.0, 1.2];
}

function fullEnsemblePrediction(sample, experts) {
  return mean(experts.map((expert) => expert.predict(sample)));
}

export function runSyntheticBenchmark({ budgets = [1, 2, 4, 7], topK = 2, sampleCount = 161 } = {}) {
  const samples = buildSyntheticSamples(sampleCount);
  const experts = buildSyntheticExperts();

  const fullRows = samples.map((sample) => ({
    target: sample.target,
    prediction: fullEnsemblePrediction(sample, experts),
  }));

  const fullBaseline = {
    name: 'full-uniform-ensemble',
    meanAbsoluteError: mae(fullRows),
    averageCost: experts.reduce((sum, expert) => sum + expert.cost, 0),
    exhaustedRate: 0,
  };

  const frontier = budgets.map((budget) => {
    const rows = samples.map((sample) => {
      const result = executeResourceBoundedMoe({
        sample,
        experts,
        router: syntheticRouter,
        budget,
        topK,
      });
      return { sample, ...result };
    });

    const completed = rows.filter(({ exhausted }) => !exhausted);
    return {
      budget,
      meanAbsoluteError: completed.length
        ? mae(completed.map(({ sample, prediction }) => ({ target: sample.target, prediction })))
        : null,
      averageCost: mean(rows.map(({ cost }) => cost)),
      exhaustedRate: rows.filter(({ exhausted }) => exhausted).length / rows.length,
      selectedExpertHistogram: rows.reduce((histogram, row) => {
        for (const id of row.selectedExperts) histogram[id] = (histogram[id] || 0) + 1;
        return histogram;
      }, {}),
    };
  });

  return {
    protocol: {
      dataset: 'deterministic three-regime scalar synthetic task',
      sampleCount,
      budgets,
      topK,
      expertCosts: Object.fromEntries(experts.map(({ id, cost }) => [id, cost])),
      claimBoundary: 'tool/algorithm smoke benchmark only; no Scientific-ML performance or novelty claim',
    },
    fullBaseline,
    frontier,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(runSyntheticBenchmark(), null, 2));
}
