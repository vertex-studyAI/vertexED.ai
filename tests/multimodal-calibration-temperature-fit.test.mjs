import assert from 'node:assert/strict';
import test from 'node:test';

import {
  fitTemperature,
  multiclassNll,
} from '../research/multimodal-calibration/fit-temperature.mjs';

function row(id, scores, correct, overrides = {}) {
  return {
    id,
    split: 'development',
    condition: 'S0',
    option_log_likelihoods: scores,
    correct_option_index: correct,
    ...overrides,
  };
}

test('fits the lower bound for uniformly correct, separable development predictions', () => {
  const rows = [
    row('a', [4, 0], 0),
    row('b', [0, 5], 1),
    row('c', [3, -2], 0),
  ];
  const result = fitTemperature(rows);

  assert.equal(result.fit_set, 'development_only_clean_S0');
  assert.equal(result.input_count, 3);
  assert.equal(result.fitted_temperature, 0.05);
  assert.ok(result.fitted_nll < multiclassNll(rows, 1));
  assert.equal(result.converged, true);
});

test('fits the upper bound when identical confident predictions are exactly half wrong', () => {
  const rows = [
    row('a', [4, 0], 0),
    row('b', [4, 0], 1),
  ];
  const result = fitTemperature(rows);

  assert.equal(result.fitted_temperature, 20);
  assert.ok(result.fitted_nll < multiclassNll(rows, 1));
});

test('is bit-for-bit deterministic for the same ordered input', () => {
  const rows = [
    row('a', [2.2, 0.1, -1], 0),
    row('b', [1.9, 1.5, 0], 1),
    row('c', [-0.2, 0.4, 0.6], 2),
    row('d', [0.8, 1.1, -0.4], 0),
  ];

  assert.deepEqual(fitTemperature(rows), fitTemperature(rows));
});

test('rejects evaluation rows and shifted conditions before fitting', () => {
  assert.throws(
    () => fitTemperature([row('eval', [1, 0], 0, { split: 'evaluation' })]),
    /not from the frozen development split/,
  );
  assert.throws(
    () => fitTemperature([row('shifted', [1, 0], 0, { condition: 'S2' })]),
    /not clean S0/,
  );
});

test('rejects duplicate ids, malformed scores, and invalid labels', () => {
  assert.throws(
    () => fitTemperature([row('dup', [1, 0], 0), row('dup', [0, 1], 1)]),
    /duplicate development row id/,
  );
  assert.throws(
    () => fitTemperature([row('nan', [1, Number.NaN], 0)]),
    /must be finite/,
  );
  assert.throws(
    () => fitTemperature([row('label', [1, 0], 2)]),
    /out of range/,
  );
});

test('stable NLL remains finite for very large log-likelihood magnitudes', () => {
  const rows = [
    row('huge-correct', [100000, 99999], 0),
    row('huge-negative', [-100000, -100001], 1),
  ];
  const value = multiclassNll(rows, 1.5);
  assert.ok(Number.isFinite(value));
  assert.ok(value > 0);
});
