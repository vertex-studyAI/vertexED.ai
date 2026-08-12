import test from 'node:test';
import assert from 'node:assert/strict';

import {
  runContaminationSweep,
  weightedHuberLocation,
  weightedTrimmedMean,
} from '../portfolio/project2424/projects/T2424-0025/src/robust_readouts.mjs';

test('trimmed mean removes weighted mass from both tails', () => {
  const distribution = [
    { weight: 0.10, value: -100 },
    { weight: 0.40, value: 0 },
    { weight: 0.40, value: 1 },
    { weight: 0.10, value: 100 },
  ];
  assert.ok(Math.abs(weightedTrimmedMean(distribution, 0.10) - 0.5) < 1e-12);
});

test('Huber location remains finite under a low-weight extreme outlier', () => {
  const estimate = weightedHuberLocation([
    { weight: 0.45, value: 1.0 },
    { weight: 0.45, value: 1.1 },
    { weight: 0.10, value: 100 },
  ], { delta: 0.2 });
  assert.ok(Number.isFinite(estimate));
  assert.ok(estimate > 0.9 && estimate < 1.3);
});

test('fixed contamination sweep is deterministic and preserves every requested rate', () => {
  const options = { seeds: 8, contaminationRates: [0, 0.05, 0.18, 0.35] };
  const first = runContaminationSweep(options);
  const second = runContaminationSweep(options);
  assert.deepEqual(first, second);
  assert.deepEqual(first.rows.map((row) => row.contaminationRate), options.contaminationRates);
  for (const row of first.rows) {
    for (const name of ['mean', 'median', 'trimmed', 'huber']) {
      assert.ok(Number.isFinite(row.metrics[name].mean));
      assert.ok(Number.isFinite(row.metrics[name].sampleStd));
    }
  }
});

test('the existing 18% Cauchy setting remains a strong robust-readout screen without hiding alternatives', () => {
  const sweep = runContaminationSweep({ seeds: 30, contaminationRates: [0.18] });
  const metrics = sweep.rows[0].metrics;
  assert.ok(metrics.median.mean < metrics.mean.mean);
  assert.ok(metrics.trimmed.mean < metrics.mean.mean);
  assert.ok(metrics.huber.mean < metrics.mean.mean);
});
