import { runContaminationSweep } from '../src/robust_readouts.mjs';

const sweep = runContaminationSweep({
  seeds: 50,
  contaminationRates: [0, 0.05, 0.10, 0.18, 0.25, 0.35],
  trimFraction: 0.10,
  huberDelta: 0.15,
});

console.log(JSON.stringify({
  project: 'T2424-0025',
  name: 'Non-Gaussian Memory Transformer',
  actualMechanism: 'attention-addressed synthetic memory aggregation screen',
  question: 'How does robust-readout benefit change as Cauchy contamination increases when attention weights and memory construction are otherwise fixed?',
  comparison: ['weighted mean', 'weighted median', '10% weighted trimmed mean', 'weighted Huber location'],
  sweep,
  interpretationBoundary: 'exploratory synthetic readout ablation only; no Transformer, learned sequence-memory, real-data, novelty, or publication claim',
}, null, 2));
