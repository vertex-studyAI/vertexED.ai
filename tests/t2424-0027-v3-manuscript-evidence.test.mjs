import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = 'portfolio/project2424/projects/T2424-0027/real_encoder/retained_v3_primary';

async function loadJson(name) {
  return JSON.parse(await readFile(`${ROOT}/${name}`, 'utf8'));
}

function fixed(value) {
  return Number(value).toFixed(6);
}

test('T2424-0027 v3 manuscript preserves the frozen negative primary result', async () => {
  const [manuscript, summary, verdict, uncertainty, claims] = await Promise.all([
    readFile(`${ROOT}/MANUSCRIPT_V3_NEGATIVE.md`, 'utf8'),
    loadJson('summary.json'),
    loadJson('verdict.json'),
    loadJson('descriptive_uncertainty.json'),
    loadJson('PREPRINT_CLAIM_MATRIX.json'),
  ]);

  assert.equal(verdict.verdict, 'FAIL_PREDECLARED_REAL_ENCODER_GATE');
  assert.equal(verdict.success_gate_passed, false);
  assert.equal(summary.seed_count, 5);
  assert.equal(summary.seed_passes, 0);
  assert.equal(claims.frozen_gate.required_seed_passes, 4);
  assert.equal(claims.frozen_gate.raw_language_accuracy_min, 0.75);

  const requiredLiterals = [
    '**`FAIL_PREDECLARED_REAL_ENCODER_GATE`**',
    '`0/5` seeds',
    '`>= 4/5`',
    '`0.75`',
    fixed(summary.mean_raw_language_accuracy),
    fixed(summary.mean_effect_retention),
    fixed(summary.mean_intent_drop),
    fixed(summary.mean_specificity_margin),
    fixed(summary.mean_normalized_language_leakage_reduction),
  ];

  for (const literal of requiredLiterals) {
    assert.ok(manuscript.includes(literal), `manuscript is missing frozen evidence literal: ${literal}`);
  }

  const intervalBindings = [
    ['raw_language_accuracy', '0.480883', '0.503828'],
    ['effect_retention', '0.764483', '0.978168'],
    ['intent_drop', '-0.005501', '0.000524'],
    ['specificity_margin', '0.718054', '0.915674'],
    ['normalized_language_leakage_reduction', '0.732629', '0.937411'],
  ];

  for (const [metric, lowerText, upperText] of intervalBindings) {
    const observed = uncertainty.metrics[metric].ci95_student_t;
    assert.equal(fixed(observed[0]), lowerText);
    assert.equal(fixed(observed[1]), upperText);
    assert.ok(manuscript.includes(lowerText), `manuscript is missing ${metric} lower interval endpoint`);
    assert.ok(manuscript.includes(upperText), `manuscript is missing ${metric} upper interval endpoint`);
  }

  assert.ok(
    manuscript.includes('These secondary observations do not rescue the failed primary gate.'),
    'manuscript must explicitly prevent secondary-result rescue',
  );
  assert.ok(
    manuscript.includes('Any scientific protocol revision after outcome access requires a new preregistration.'),
    'manuscript must retain the successor preregistration boundary',
  );

  const prohibitedPositiveClaims = [
    'linguistic relativity established',
    'establishes linguistic relativity',
    'proves linguistic relativity',
    'confirms a universal language-invariant representation',
    'establishes a universal language-invariant representation',
    'demonstrates model superiority',
    'statistically significant primary success',
    'partial primary pass',
  ];
  const normalized = manuscript.toLowerCase();
  for (const phrase of prohibitedPositiveClaims) {
    assert.equal(normalized.includes(phrase), false, `prohibited positive claim leaked into manuscript: ${phrase}`);
  }

  assert.match(manuscript, /The preregistered real-encoder v3 study produced a clear negative primary result\./);
});
