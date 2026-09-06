import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const results = readFileSync('portfolio/research/eigen-jepa/RESULTS.md', 'utf8');
const manuscript = readFileSync(
  'portfolio/research/papers/EIGEN_JEPA_MIXED_NEGATIVE_MANUSCRIPT.md',
  'utf8',
);

function requireText(haystack, needle, label) {
  assert.ok(haystack.includes(needle), `missing ${label}: ${needle}`);
}

test('Eigen-JEPA manuscript preserves the retained dataset/task identity', () => {
  for (const [needle, label] of [
    ['14,895', 'daily-row count'],
    ['1963-07-01', 'start date'],
    ['2022-08-31', 'end date'],
    ['20-day covariance blocks', 'block construction'],
    ['111', 'held-out block count'],
    ['076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c', 'source SHA-256'],
  ]) {
    requireText(results, needle, `canonical ${label}`);
    requireText(manuscript, needle, `manuscript ${label}`);
  }
});

test('Eigen-JEPA manuscript binds every displayed aggregate metric to canonical results', () => {
  const retained = [
    ['raw ridge', '5.7734384e-09', '0.1945980'],
    ['log ridge', '5.7896089e-09', '0.1506057'],
    ['Eigen-JEPA', '5.8318226e-09', '0.1595020'],
    ['Cholesky', '5.8762487e-09', null],
    ['persistence', '7.7708315e-09', null],
  ];

  for (const [method, matrixMse, logDistance] of retained) {
    requireText(results, method, `canonical method ${method}`);
    requireText(results, matrixMse, `canonical matrix MSE for ${method}`);
    requireText(manuscript, matrixMse, `manuscript matrix MSE for ${method}`);
    if (logDistance) {
      requireText(results, logDistance, `canonical log-distance for ${method}`);
      requireText(manuscript, logDistance, `manuscript log-distance for ${method}`);
    }
  }
});

test('Eigen-JEPA manuscript preserves the retained paired comparison and uncertainty', () => {
  for (const [needle, label] of [
    ['+5.8384e-11', 'paired point difference'],
    ['-2.3565e-10', '95% interval lower endpoint'],
    ['4.1744e-10', '95% interval upper endpoint'],
  ]) {
    requireText(results, needle, `canonical ${label}`);
    requireText(manuscript, needle, `manuscript ${label}`);
  }
});

test('Eigen-JEPA manuscript cannot silently rescue the frozen mixed/negative result', () => {
  for (const requiredBoundary of [
    'does not establish covariance-forecasting superiority',
    'does not justify retuning the current study in place',
    'secondary ordering is descriptive only',
    'Any successor must be a new preregistration',
  ]) {
    requireText(manuscript, requiredBoundary, 'frozen claim boundary');
  }

  const forbiddenClaims = [
    /statistically significant(?:ly)? outperform/i,
    /state[- ]of[- ]the[- ]art/i,
    /financial alpha/i,
    /profitable trading/i,
    /universal spectral superiority/i,
  ];

  for (const pattern of forbiddenClaims) {
    assert.equal(
      pattern.test(manuscript),
      false,
      `forbidden unsupported Eigen-JEPA claim matched: ${pattern}`,
    );
  }
});

test('canonical Eigen-JEPA result remains explicitly boundary/negative evidence', () => {
  requireText(results, 'FRESHLY REPRODUCED BOUNDARY/NEGATIVE COMPARISON', 'canonical negative status');
  requireText(results, 'does not establish superiority over raw ridge', 'canonical raw-ridge verdict');
  requireText(manuscript, '**UNSUPPORTED**', 'manuscript unsupported verdict');
});
