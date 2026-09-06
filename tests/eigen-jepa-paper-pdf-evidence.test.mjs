import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const resultPath = 'portfolio/research/eigen-jepa/RESULTS.md';
const figureDataPath = 'portfolio/research/eigen-jepa/FIGURE_DATA.json';
const figureAuditPath = 'portfolio/research/eigen-jepa/FIGURE_AUDIT.md';
const manuscriptPath = 'portfolio/research/papers/EIGEN_JEPA_MIXED_NEGATIVE_MANUSCRIPT.md';
const paperPath = 'portfolio/research/eigen-jepa/paper/main.tex';

const results = fs.readFileSync(resultPath, 'utf8');
const figureData = JSON.parse(fs.readFileSync(figureDataPath, 'utf8'));
const figureAudit = fs.readFileSync(figureAuditPath, 'utf8');
const manuscript = fs.readFileSync(manuscriptPath, 'utf8');
const paper = fs.readFileSync(paperPath, 'utf8');

const expectPaper = (...tokens) => {
  for (const token of tokens) {
    assert.ok(paper.includes(token), `paper missing evidence-bound token: ${token}`);
  }
};

test('submission source remains bound to canonical retained task identity', () => {
  assert.equal(figureData.source.canonical_results, resultPath);
  assert.equal(figureData.source.heldout_blocks, 111);
  assert.equal(
    figureData.source.source_sha256,
    '076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c'
  );
  assert.ok(results.includes('14,895 daily rows'));
  assert.ok(results.includes('1963-07-01 through 2022-08-31'));
  assert.ok(results.includes('held-out test contains `n=111` blocks'));
  expectPaper(
    '14,895',
    '1963-07-01',
    '2022-08-31',
    '111 blocks',
    '076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c'
  );
});

test('submission result table and figure caption use only retained primary values', () => {
  const expected = new Map([
    ['raw ridge', '5.7734384e-09'],
    ['log ridge', '5.7896089e-09'],
    ['Eigen-JEPA', '5.8318226e-09'],
    ['Cholesky', '5.8762487e-09'],
    ['persistence', '7.7708315e-09']
  ]);

  for (const method of figureData.primary_metric.methods) {
    assert.equal(method.matrix_mse, expected.get(method.name));
    assert.ok(results.includes(method.matrix_mse));
  }

  expectPaper(
    '5.7734384\\mathrm{e}{-9}',
    '5.7896089\\mathrm{e}{-9}',
    '5.8318226\\mathrm{e}{-9}',
    '5.8762487\\mathrm{e}{-9}',
    '7.7708315\\mathrm{e}{-9}',
    'lower is better',
    'Eigen-JEPA improves on persistence but has higher primary MSE than raw and log ridge'
  );
});

test('paired primary comparison remains adverse/boundary evidence with no rescue rule', () => {
  assert.equal(figureData.paired_primary_comparison.difference, '+5.8384e-11');
  assert.deepEqual(
    figureData.paired_primary_comparison.interval_95,
    ['-2.3565e-10', '4.1744e-10']
  );
  assert.equal(figureData.scientific_boundary.primary_superiority_supported, false);
  assert.equal(figureData.scientific_boundary.external_validation_complete, false);
  assert.equal(figureData.scientific_boundary.post_outcome_rescue_allowed, false);

  expectPaper(
    '+5.8384\\times10^{-11}',
    '-2.3565\\times10^{-10}',
    '4.1744\\times10^{-10}',
    'interval is reported as retained evidence only',
    'introduces no new post-outcome significance or practical-effect threshold',
    'External validation remains unresolved'
  );
});

test('figure integration inherits the audited release boundary', () => {
  assert.ok(figureAudit.includes('Current committed SVG SHA-256: `b9a1fb084f5c88506c342e0489ec64ddc8840b3427413a756fc9fb0de88f98bd`'));
  assert.ok(figureAudit.includes('Positive values favor raw ridge under the frozen difference convention'));
  assert.ok(figureAudit.includes('does not introduce a new post-outcome decision threshold'));
  expectPaper(
    '../figures/primary-comparison.pdf',
    'Positive values favor raw ridge under the frozen difference convention',
    'does not introduce a new post-outcome decision threshold'
  );
});

test('related-work references are inherited from the evidence-bound manuscript and remain non-retroactive', () => {
  const dois = [
    '10.1016/S0047-259X(03)00096-4',
    '10.1198/073500102288618487',
    '10.1103/PhysRevLett.83.1467'
  ];
  for (const doi of dois) {
    assert.ok(manuscript.includes(doi), `canonical manuscript missing DOI ${doi}`);
    assert.ok(paper.includes(doi), `submission source missing inherited DOI ${doi}`);
  }
  expectPaper(
    'These methods are relevant scientific context, not retroactive baselines',
    'Adding such baselines after observing the present result would define a new scientific protocol'
  );
});

test('submission source keeps explicit negative boundaries and rejects affirmative promotion language', () => {
  expectPaper(
    'No claim of state-of-the-art performance',
    'universal spectral superiority',
    'External validation remains unresolved'
  );

  const forbiddenAffirmativeClaims = [
    /results? (?:are|is) statistically significant/i,
    /Eigen-JEPA (?:is|was) state[- ]of[- ]the[- ]art/i,
    /Eigen-JEPA establish(?:es|ed)? financial alpha/i,
    /trading value (?:is|was) demonstrated/i,
    /externally validated (?:study|result|model)/i,
    /Eigen-JEPA establish(?:es|ed)? universal spectral superiority/i,
    /Eigen-JEPA outperform(?:s|ed)? (?:shrinkage|DCC|random-matrix)/i
  ];
  for (const pattern of forbiddenAffirmativeClaims) {
    assert.doesNotMatch(paper, pattern);
  }
});
