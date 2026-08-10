import assert from 'node:assert/strict';
import test from 'node:test';

import {
  executeResourceBoundedMoe,
  routeExperts,
  softmax,
} from '../portfolio/project2424/projects/T2424-1767/src/resourceBoundedMoe.mjs';
import {
  buildSyntheticExperts,
  runSyntheticBenchmark,
  syntheticRouter,
} from '../portfolio/project2424/projects/T2424-1767/experiment/syntheticBenchmark.mjs';

test('softmax is normalized and numerically stable for large scores', () => {
  const weights = softmax([1000, 1001, 999]);
  assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  assert.ok(weights[1] > weights[0]);
  assert.ok(weights[0] > weights[2]);
});

test('router never exceeds hard resource budget or topK', () => {
  const experts = buildSyntheticExperts();
  for (const budget of [1, 2, 3, 4, 5, 7]) {
    const routed = routeExperts({
      scores: [4, 2, 5],
      experts,
      budget,
      topK: 2,
    });
    assert.ok(routed.cost <= budget, `cost ${routed.cost} exceeded budget ${budget}`);
    assert.ok(routed.selected.length <= 2);
  }
});

test('operator returns exhausted rather than silently violating an impossible budget', () => {
  const experts = buildSyntheticExperts();
  const result = executeResourceBoundedMoe({
    sample: { x: 0, regime: 'transition' },
    experts,
    router: syntheticRouter,
    budget: 0.5,
    topK: 2,
  });
  assert.equal(result.exhausted, true);
  assert.equal(result.prediction, null);
  assert.equal(result.cost, 0);
  assert.deepEqual(result.selectedExperts, []);
});

test('operator combines only selected expert outputs with normalized weights', () => {
  const experts = [
    { id: 'cheap', cost: 1, predict: () => 2 },
    { id: 'expensive', cost: 3, predict: () => 10 },
    { id: 'unused', cost: 9, predict: () => 1000 },
  ];
  const result = executeResourceBoundedMoe({
    sample: {},
    experts,
    router: () => [1, 3, 100],
    budget: 4,
    topK: 2,
  });

  assert.equal(result.exhausted, false);
  assert.ok(result.cost <= 4);
  assert.deepEqual(new Set(result.selectedExperts), new Set(['cheap', 'expensive']));
  assert.ok(result.prediction > 2 && result.prediction < 10);
  assert.ok(Math.abs(result.weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
});

test('synthetic benchmark emits a finite resource/performance frontier', () => {
  const report = runSyntheticBenchmark({ budgets: [1, 2, 4, 7], topK: 2, sampleCount: 81 });
  assert.equal(report.protocol.sampleCount, 81);
  assert.equal(report.frontier.length, 4);
  assert.ok(Number.isFinite(report.fullBaseline.meanAbsoluteError));
  assert.equal(report.fullBaseline.averageCost, 7);

  for (const row of report.frontier) {
    assert.ok(row.averageCost <= row.budget, `average cost ${row.averageCost} exceeded ${row.budget}`);
    assert.ok(row.exhaustedRate >= 0 && row.exhaustedRate <= 1);
    if (row.exhaustedRate < 1) assert.ok(Number.isFinite(row.meanAbsoluteError));
  }

  assert.ok(
    report.frontier.some((row) => row.averageCost < report.fullBaseline.averageCost && row.exhaustedRate === 0),
    'frontier should contain at least one non-exhausted lower-cost operating point',
  );
});

test('invalid expert contracts fail closed', () => {
  assert.throws(
    () => routeExperts({ scores: [1], experts: [{ id: 'bad', cost: 0, predict: () => 0 }], budget: 1 }),
    /cost must be greater than zero/,
  );
  assert.throws(
    () => routeExperts({ scores: [1], experts: [{ id: 'bad', cost: 1 }], budget: 1 }),
    /predict/,
  );
});
