import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateTrajectory,
  generateSyntheticTrajectory,
  predictAdaptiveGeometry,
  predictConstantVelocity,
  runSyntheticGeometryBenchmark,
  signedTurnAngle,
} from '../portfolio/project2424/projects/T2424-0030/src/core.mjs';

test('signedTurnAngle preserves rotation direction', () => {
  assert.ok(Math.abs(signedTurnAngle([1, 0], [0, 1]) - Math.PI / 2) < 1e-12);
  assert.ok(Math.abs(signedTurnAngle([1, 0], [0, -1]) + Math.PI / 2) < 1e-12);
});

test('straight motion keeps the adaptive predictor identical to constant velocity', () => {
  const history = [[0, 0], [1, 0], [2, 0]];
  assert.deepEqual(predictAdaptiveGeometry(history), predictConstantVelocity(history));
  assert.deepEqual(predictAdaptiveGeometry(history), [3, 0]);
});

test('constant-curvature prediction rotates the latest tangent', () => {
  const history = [[1, 0], [0, 1], [-1, 0]];
  const predicted = predictAdaptiveGeometry(history, { turnThreshold: 0.01, maxTurn: Math.PI / 2 });
  assert.ok(Math.abs(predicted[0]) < 1e-12);
  assert.ok(Math.abs(predicted[1] + 1) < 1e-12);
});

test('curved synthetic trajectories favor adaptive geometry over constant velocity', () => {
  const benchmark = runSyntheticGeometryBenchmark({ seeds: 20 });
  assert.ok(benchmark.curved.relativeImprovement > 0.85);
  assert.ok(benchmark.curved.curvedSelectionRate > 0.95);
  assert.ok(benchmark.curved.meanAdaptiveError < benchmark.curved.meanBaselineError);
});

test('straight-control trajectories do not manufacture an adaptive win', () => {
  const benchmark = runSyntheticGeometryBenchmark({ seeds: 20 });
  assert.ok(Math.abs(benchmark.straightControl.relativeImprovement) < 1e-9);
  assert.equal(benchmark.straightControl.curvedSelectionRate, 0);
});

test('trajectory evaluation is deterministic and validates malformed inputs', () => {
  const trajectoryA = generateSyntheticTrajectory({ seed: 7, baseTurn: 0.12 });
  const trajectoryB = generateSyntheticTrajectory({ seed: 7, baseTurn: 0.12 });
  assert.deepEqual(trajectoryA, trajectoryB);
  assert.deepEqual(evaluateTrajectory(trajectoryA), evaluateTrajectory(trajectoryB));
  assert.throws(() => predictAdaptiveGeometry([[0, 0], [1, 0]]), /at least 3 points/);
  assert.throws(() => generateSyntheticTrajectory({ steps: 2 }), /steps must be >= 4/);
});
