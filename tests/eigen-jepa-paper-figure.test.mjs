import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSvg, validateFigureData } from '../scripts/generate-eigen-jepa-paper-figure.mjs';

const results = readFileSync('portfolio/research/eigen-jepa/RESULTS.md', 'utf8');
const data = JSON.parse(readFileSync('portfolio/research/eigen-jepa/FIGURE_DATA.json', 'utf8'));
const committedSvg = readFileSync(
  'portfolio/research/eigen-jepa/figures/primary-comparison.svg',
  'utf8',
);

function requireCanonical(needle, label) {
  assert.ok(results.includes(needle), `canonical results missing ${label}: ${needle}`);
}

test('Eigen-JEPA figure data is bound to the retained canonical result', () => {
  validateFigureData(data);

  assert.equal(data.source.heldout_blocks, 111);
  requireCanonical(String(data.source.heldout_blocks), 'held-out block count');
  requireCanonical(data.source.source_sha256, 'source SHA-256');

  for (const method of data.primary_metric.methods) {
    requireCanonical(method.name, `method ${method.name}`);
    requireCanonical(method.matrix_mse, `matrix MSE for ${method.name}`);
  }

  requireCanonical(data.paired_primary_comparison.difference, 'paired primary difference');
  for (const endpoint of data.paired_primary_comparison.interval_95) {
    requireCanonical(endpoint, `paired interval endpoint ${endpoint}`);
  }
});

test('Eigen-JEPA committed paper figure is byte-for-byte deterministic', () => {
  assert.equal(buildSvg(data), committedSvg);
});

test('Eigen-JEPA paper figure cannot promote the frozen mixed/negative comparison', () => {
  assert.equal(data.scientific_boundary.primary_superiority_supported, false);
  assert.equal(data.scientific_boundary.external_validation_complete, false);
  assert.equal(data.scientific_boundary.post_outcome_rescue_allowed, false);
  assert.equal(data.primary_metric.direction, 'lower_is_better');

  assert.ok(committedSvg.includes('lower is better'));
  assert.ok(committedSvg.includes('retained 95% interval crosses zero'));
  assert.equal(/statistically significant/i.test(committedSvg), false);
  assert.equal(/state[- ]of[- ]the[- ]art/i.test(committedSvg), false);
  assert.equal(/financial alpha/i.test(committedSvg), false);
});
