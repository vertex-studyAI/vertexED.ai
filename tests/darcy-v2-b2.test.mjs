import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DARCY_V2_B2_FREEZE,
  fitPcaPowerIteration,
  fitPcaRidge,
  meanRelativeL2Rows,
  predictPcaRidge,
  selectPcaRidgeAlpha,
  transformPca,
} from '../portfolio/project2424/projects/T2424-0050/src/b2-pca-ridge.mjs';

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

const toyFeatures = Array.from({ length: 24 }, (_, index) => {
  const x = (index - 11.5) / 5;
  return [
    x,
    0.35 * x * x + 0.2 * Math.sin(index * 0.7),
    Math.cos(index * 0.31) + 0.1 * x,
  ];
});

const toyTargets = toyFeatures.map(([a, b, c]) => [
  1.5 + 0.8 * a - 0.35 * b + 0.12 * c,
  -0.4 + 0.1 * a + 0.65 * b - 0.5 * c,
]);

test('Darcy v2 B2 PCA power iteration is deterministic and orthonormal on toy training data', () => {
  const first = fitPcaPowerIteration(toyFeatures, { components: 3 });
  const second = fitPcaPowerIteration(toyFeatures, { components: 3 });
  assert.deepEqual(first, second);
  assert.equal(first.componentCount, 3);
  assert.equal(first.inputDimension, 3);
  assert.equal(first.solver, 'covariance_operator_power_iteration_deflation_v1');

  for (let i = 0; i < first.components.length; i += 1) {
    assert.ok(Math.abs(dot(first.components[i], first.components[i]) - 1) < 1e-9);
    for (let j = 0; j < i; j += 1) {
      assert.ok(Math.abs(dot(first.components[i], first.components[j])) < 1e-9);
    }
  }

  const scores = transformPca(toyFeatures, first);
  assert.equal(scores.length, toyFeatures.length);
  assert.equal(scores[0].length, 3);
});

test('Darcy v2 B2 PCA+ridge fits and predicts a synthetic linear pressure-like map without Darcy outcomes', () => {
  const model = fitPcaRidge(toyFeatures, toyTargets, {
    components: 3,
    alpha: 1e-8,
  });
  assert.equal(model.kind, 'darcy_v2_b2_pca_ridge_v1');
  assert.equal(model.trainingRows, toyFeatures.length);
  assert.equal(model.inputDimension, 3);
  assert.equal(model.outputDimension, 2);
  assert.ok(model.parameterCount > 0);

  const predictions = predictPcaRidge(toyFeatures, model);
  const relativeError = meanRelativeL2Rows(toyTargets, predictions);
  assert.ok(relativeError < 1e-6, `toy relative error ${relativeError}`);
});

test('Darcy v2 B2 ridge-alpha selector is validation-only and deterministic on toy data', () => {
  const trainFeatures = toyFeatures.slice(0, 18);
  const trainTargets = toyTargets.slice(0, 18);
  const validationFeatures = toyFeatures.slice(18);
  const validationTargets = toyTargets.slice(18);
  const options = { components: 3, alphas: [1e-8, 1e-4, 1e-1] };

  const first = selectPcaRidgeAlpha(
    trainFeatures,
    trainTargets,
    validationFeatures,
    validationTargets,
    options,
  );
  const second = selectPcaRidgeAlpha(
    trainFeatures,
    trainTargets,
    validationFeatures,
    validationTargets,
    options,
  );

  assert.equal(first.selectionMetric, 'validation_pressure_mean_relative_l2');
  assert.equal(first.selectedAlpha, second.selectedAlpha);
  assert.equal(first.selectedScore, second.selectedScore);
  assert.deepEqual(first.candidates, second.candidates);
  assert.ok(options.alphas.includes(first.selectedAlpha));
  assert.ok(Number.isFinite(first.selectedScore));
});

test('Darcy v2 B2 freeze matches the pre-outcome representation and selection boundary', () => {
  assert.equal(DARCY_V2_B2_FREEZE.componentCount, 8);
  assert.equal(DARCY_V2_B2_FREEZE.dimensionCap, 8);
  assert.equal(DARCY_V2_B2_FREEZE.testOrOodForSelection, false);
  assert.equal(DARCY_V2_B2_FREEZE.selectionMetric, 'validation pressure mean relative L2 only');
  assert.deepEqual(DARCY_V2_B2_FREEZE.ridgeAlphas, [1e-8, 1e-6, 1e-4, 1e-2, 1e-1, 1, 10]);
});
