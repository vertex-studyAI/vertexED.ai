import assert from 'node:assert/strict';
import test from 'node:test';

import {
  compressPermeability,
  evaluateField,
  expandLatent,
  generateHeterogeneousField,
  harmonicMean,
  runBenchmark,
  solveSteadyDarcy1D,
} from '../portfolio/project2424/projects/T2424-0050/src/core.mjs';

test('steady Darcy solution respects boundaries and constant flux resistance law', () => {
  const solution = solveSteadyDarcy1D([1, 2, 4, 8]);
  assert.equal(solution.pressure[0], 1);
  assert.equal(solution.pressure.at(-1), 0);
  assert.ok(solution.pressure.every((value, index, array) => index === 0 || value <= array[index - 1]));
  assert.ok(Math.abs(solution.flux * solution.totalResistance - 1) < 1e-12);
});

test('harmonic block latent preserves each block resistance', () => {
  const field = [1, 2, 4, 8, 2, 2, 6, 3];
  const compressed = compressPermeability(field, 2);
  const expanded = expandLatent(compressed.latent, compressed.blockSize);
  for (let block = 0; block < 2; block += 1) {
    const start = block * 4;
    const originalResistance = field.slice(start, start + 4).reduce((sum, k) => sum + 1 / k, 0);
    const latentResistance = expanded.slice(start, start + 4).reduce((sum, k) => sum + 1 / k, 0);
    assert.ok(Math.abs(originalResistance - latentResistance) < 1e-12);
  }
  assert.ok(Math.abs(compressed.latent[0] - harmonicMean(field.slice(0, 4))) < 1e-12);
});

test('uniform field is an exact negative control for both baseline and latent surrogate', () => {
  const result = evaluateField(Array(24).fill(2.5), { blockCount: 6 });
  assert.ok(result.baselineMae < 1e-12);
  assert.ok(result.latentMae < 1e-12);
  assert.ok(result.fluxRelativeError < 1e-12);
});

test('heterogeneous field latent surrogate improves pressure profile over linear baseline', () => {
  const field = generateHeterogeneousField(7, { cellCount: 24, blockCount: 6 });
  const result = evaluateField(field, { blockCount: 6 });
  assert.ok(result.latentMae < result.baselineMae);
  assert.ok(result.relativeImprovement > 0.5);
});

test('20-seed deterministic benchmark clears the frozen cheap screen', () => {
  const benchmark = runBenchmark();
  assert.equal(benchmark.evaluations.length, 20);
  assert.equal(benchmark.predeclaredScreen.latentPressureImprovementAtLeast65Percent, true);
  assert.equal(benchmark.predeclaredScreen.meanFluxRelativeErrorAtMost1Percent, true);
  assert.equal(benchmark.predeclaredScreen.uniformControlExact, true);
});

test('invalid permeability and incompatible compression fail closed', () => {
  assert.throws(() => solveSteadyDarcy1D([1, 0, 2]), /> 0/);
  assert.throws(() => solveSteadyDarcy1D([1]), /at least two/);
  assert.throws(() => compressPermeability([1, 2, 3, 4, 5, 6], 4), /divisible/);
});
