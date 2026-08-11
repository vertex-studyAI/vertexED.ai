import test from 'node:test';
import assert from 'node:assert/strict';

import {
  encodeLatent,
  fitLatentTransitionCoefficient,
  initialSaturation,
  makeTrajectoryPairs,
  permeabilityProfile,
  runPorousJepaExperiment,
  stepPorousState,
} from '../portfolio/project2424/projects/T2424-0049/src/core.mjs';

test('porous update conserves total saturation on the periodic grid', () => {
  const state = initialSaturation(32, 0.4);
  const permeability = permeabilityProfile(32, 0.1);
  const next = stepPorousState(state, permeability, 0.08);
  const before = state.reduce((sum, value) => sum + value, 0);
  const after = next.reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(after - before) <= 1e-12);
  assert.equal(next.length, state.length);
});

test('latent encoder performs deterministic contiguous pooling', () => {
  assert.deepEqual(encodeLatent([1, 2, 3, 4], 2), [1.5, 3.5]);
});

test('learned transition coefficient is finite positive and bounded on training trajectories', () => {
  const first = makeTrajectoryPairs({ phase: 0.1, steps: 8, alpha: 0.08 }).pairs;
  const second = makeTrajectoryPairs({ phase: 1.3, steps: 8, alpha: 0.08 }).pairs;
  const coefficient = fitLatentTransitionCoefficient([...first, ...second]);
  assert.ok(Number.isFinite(coefficient));
  assert.ok(coefficient > 0);
  assert.ok(coefficient < 0.1);
});

test('frozen held-out screen beats persistence by at least fifty percent', () => {
  const result = runPorousJepaExperiment();
  assert.ok(result.heldOut.relativeImprovement >= 0.5);
  assert.ok(result.heldOut.predictorRmse < result.heldOut.baselineRmse);
  assert.equal(result.gates.heldOutImprovementAtLeast50Pct, true);
  assert.equal(result.verdict, 'PASS_SYNTHETIC_LATENT_PREDICTION_SCREEN');
});

test('zero-dynamics negative control produces no false predictive gain', () => {
  const result = runPorousJepaExperiment();
  assert.ok(result.zeroDynamics.predictorRmse <= 1e-12);
  assert.ok(Math.abs(result.zeroDynamics.relativeImprovement) <= 1e-12);
  assert.equal(result.gates.zeroDynamicsNoFalseGain, true);
});

test('malformed or unsafe dynamics inputs fail closed', () => {
  assert.throws(() => stepPorousState([0, 1, 2, 3], [1, 1, 1], 0.08), /lengths must match/);
  assert.throws(() => stepPorousState([0, 1, 2, 3], [1, 1, -1, 1], 0.08), /strictly positive/);
  assert.throws(() => stepPorousState([0, 1, 2, 3], [1, 1, 1, 1], 0.5), /alpha must be between/);
  assert.throws(() => encodeLatent([1, 2, 3, 4], 3), /blockSize must divide/);
});
