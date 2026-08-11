import test from 'node:test';
import assert from 'node:assert/strict';

import {
  accuracy,
  augmentBenchmark,
  createShortcutBenchmark,
  flipShortcutAugmentation,
  neutralSignalScaleAugmentation,
  robustSignalModel,
  runBenchmarkAugmentationScreen,
  shortcutModel,
} from '../portfolio/project2424/tools/benchmark-augmentation-theory/src/core.mjs';

test('base benchmark intentionally hides shortcut dependence', () => {
  const cases = createShortcutBenchmark({ size: 100 });
  assert.equal(accuracy(cases, robustSignalModel.predict), 1);
  assert.equal(accuracy(cases, shortcutModel.predict), 1);
});

test('label-preserving shortcut break separates robust and shortcut models', () => {
  const screen = runBenchmarkAugmentationScreen({ size: 100 });
  assert.ok(screen.baseAccuracyGap <= 0.01);
  assert.ok(screen.shortcutBreakingGap >= 0.90);
});

test('neutral augmentation does not invent a ranking separation', () => {
  const screen = runBenchmarkAugmentationScreen({ size: 100 });
  assert.ok(screen.neutralGap <= 0.01);
});

test('augmentation contract rejects label-changing mutations', () => {
  const cases = createShortcutBenchmark({ size: 10 });
  assert.throws(() => augmentBenchmark(cases, [{
    name: 'illegal-label-flip',
    transform(record) {
      return { ...record, label: -record.label };
    },
  }]), /changed label/);
});

test('benchmark generation and augmentation are deterministic', () => {
  const first = createShortcutBenchmark({ size: 25 });
  const second = createShortcutBenchmark({ size: 25 });
  assert.deepEqual(first, second);
  assert.deepEqual(
    augmentBenchmark(first, [flipShortcutAugmentation, neutralSignalScaleAugmentation]),
    augmentBenchmark(second, [flipShortcutAugmentation, neutralSignalScaleAugmentation]),
  );
});

test('invalid cases and predictions fail closed', () => {
  const cases = createShortcutBenchmark({ size: 4 });
  assert.throws(() => accuracy(cases, () => 0), /prediction.*must be -1 or 1/);
  assert.throws(() => augmentBenchmark([], [flipShortcutAugmentation]), /non-empty array/);
  assert.throws(() => createShortcutBenchmark({ size: 1 }), /size must be >= 2/);
});
