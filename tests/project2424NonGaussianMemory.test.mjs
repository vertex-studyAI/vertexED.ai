import test from 'node:test';
import assert from 'node:assert/strict';

import {
  attentionDistribution,
  buildSyntheticMemory,
  runNonGaussianMemoryBenchmark,
  weightedMean,
  weightedMedian,
} from '../portfolio/project2424/projects/T2424-0025/src/core.mjs';

test('attention weights are finite, non-negative, and normalized', () => {
  const distribution = attentionDistribution([
    { key: 0, value: 1 },
    { key: 0.5, value: 2 },
    { key: 1, value: 3 },
  ], 0.5, 0.1);
  assert.ok(distribution.every((item) => Number.isFinite(item.weight) && item.weight >= 0));
  const sum = distribution.reduce((total, item) => total + item.weight, 0);
  assert.ok(Math.abs(sum - 1) < 1e-12);
});

test('weighted median rejects a low-weight extreme value that moves the mean', () => {
  const distribution = [
    { weight: 0.45, value: 1.0 },
    { weight: 0.45, value: 1.1 },
    { weight: 0.10, value: 100 },
  ];
  assert.equal(weightedMedian(distribution), 1.1);
  assert.ok(weightedMean(distribution) > 10);
});

test('non-Gaussian contamination strongly favors robust memory aggregation', () => {
  const benchmark = runNonGaussianMemoryBenchmark({ seeds: 30 });
  assert.ok(benchmark.heavyTail.relativeImprovement > 0.80);
  assert.ok(benchmark.heavyTail.robustMae < benchmark.heavyTail.baselineMae);
});

test('robust memory is not purchased by degrading the clean control', () => {
  const benchmark = runNonGaussianMemoryBenchmark({ seeds: 30 });
  assert.ok(benchmark.cleanControl.robustMae <= benchmark.cleanControl.baselineMae * 1.10);
});

test('heavy-tail advantage exceeds the clean-control advantage by a predeclared margin', () => {
  const benchmark = runNonGaussianMemoryBenchmark({ seeds: 30 });
  assert.ok(benchmark.nonGaussianAdvantageGap > 0.30);
});

test('synthetic memory is deterministic and malformed inputs fail closed', () => {
  assert.deepEqual(
    buildSyntheticMemory({ seed: 11, heavyTail: true }),
    buildSyntheticMemory({ seed: 11, heavyTail: true }),
  );
  assert.throws(() => attentionDistribution([], 0.5), /non-empty array/);
  assert.throws(() => attentionDistribution([{ key: 0, value: 1 }], 0.5, 0), /temperature must be > 0/);
  assert.throws(() => weightedMedian([{ weight: -1, value: 2 }]), /weights must be >= 0/);
});
