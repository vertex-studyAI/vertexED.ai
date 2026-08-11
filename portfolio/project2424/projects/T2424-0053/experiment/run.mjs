import { summarizeDictionary } from '../src/core.mjs';

const pulse = [0, 1, 2, 4, 4, 2, 1, 0];
const scaledPulse = pulse.map((value) => 12 + 2.5 * value);
const series = [
  ...pulse,
  0.2, 0.1, 0, 0, 0.1, 0.2, 0.1, 0,
  ...scaledPulse,
  -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5
];

console.log(JSON.stringify({
  experiment: 'T2424-0053 Scientific Motif Dictionary minimum experiment',
  claimBoundary: 'deterministic normalized-shape indexing on a synthetic numeric series; no novelty or domain-general discovery claim',
  options: { windowSize: 8, segments: 4, minSupport: 2 },
  result: summarizeDictionary(series, { windowSize: 8, segments: 4, minSupport: 2 })
}, null, 2));
