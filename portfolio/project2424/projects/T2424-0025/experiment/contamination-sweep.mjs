import { buildSyntheticMemory, evaluateMemory } from '../src/core.mjs';

const conditions = [
  { name: 'gaussian-clean', heavyTail: false, contaminationRate: 0, cauchyScale: 0 },
  { name: 'cauchy-05-low', heavyTail: true, contaminationRate: 0.05, cauchyScale: 0.2 },
  { name: 'cauchy-10-medium', heavyTail: true, contaminationRate: 0.10, cauchyScale: 0.7 },
  { name: 'cauchy-18-medium', heavyTail: true, contaminationRate: 0.18, cauchyScale: 0.7 },
  { name: 'cauchy-30-medium', heavyTail: true, contaminationRate: 0.30, cauchyScale: 0.7 },
  { name: 'cauchy-18-high', heavyTail: true, contaminationRate: 0.18, cauchyScale: 1.5 },
];

const seeds = 30;
const rows = conditions.map((condition) => {
  const results = [];
  for (let seed = 0; seed < seeds; seed += 1) {
    const memory = buildSyntheticMemory({
      seed,
      heavyTail: condition.heavyTail,
      contaminationRate: condition.contaminationRate,
      cauchyScale: condition.cauchyScale,
    });
    results.push(evaluateMemory(memory));
  }

  const baselineMae = results.reduce((sum, item) => sum + item.baselineMae, 0) / seeds;
  const robustMae = results.reduce((sum, item) => sum + item.robustMae, 0) / seeds;
  return {
    ...condition,
    seeds,
    baselineMae,
    robustMae,
    relativeImprovement: 1 - robustMae / baselineMae,
  };
});

console.log(JSON.stringify(rows, null, 2));
