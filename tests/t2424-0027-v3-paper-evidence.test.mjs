import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const root = 'portfolio/project2424/projects/T2424-0027/real_encoder/retained_v3_primary';
const read = (name) => fs.readFileSync(`${root}/${name}`, 'utf8');
const json = (name) => JSON.parse(read(name));
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const paper = read('paper/main.tex');
const summaryText = read('summary.json');
const verdictText = read('verdict.json');
const perSeedText = read('per_seed_metrics.jsonl');
const summary = JSON.parse(summaryText);
const uncertainty = json('descriptive_uncertainty.json');
const reconciliation = json('CURRENT_MAIN_RECONCILIATION_V1.json');
const related = read('RELATED_WORK_V3.md');

const expectPaper = (...tokens) => {
  for (const token of tokens) assert.ok(paper.includes(token), `paper missing retained token: ${token}`);
};

test('paper stays bound to the frozen negative authorization boundary', () => {
  assert.equal(reconciliation.scientific_verdict, 'FAIL_PREDECLARED_REAL_ENCODER_GATE');
  assert.equal(reconciliation.success_gate_passed, false);
  assert.equal(reconciliation.execution_authorized, false);
  assert.equal(reconciliation.outcome_reexecution_authorized, false);
  assert.deepEqual(reconciliation.frozen_gate.seeds, [2401, 2402, 2403, 2404, 2405]);
  assert.equal(reconciliation.frozen_gate.required_seed_passes, 4);
  assert.equal(summary.seed_count, 5);
  assert.equal(summary.seed_passes, 0);

  expectPaper(
    'FAIL_PREDECLARED_REAL_ENCODER_GATE',
    '0/5',
    '0.75',
    '0.70',
    '0.02',
    '0.15',
    '2401', '2402', '2403', '2404', '2405',
    'cannot replace the conjunction',
    'cannot be promoted into primary success'
  );
});

test('retained evidence bytes still match the current-main reconciliation receipt', () => {
  assert.equal(sha256(summaryText), reconciliation.retained_evidence.summary.sha256);
  assert.equal(sha256(verdictText), reconciliation.retained_evidence.verdict.sha256);
  assert.equal(sha256(perSeedText), reconciliation.retained_evidence.per_seed_metrics.sha256);
});

test('paper result table and descriptive figure use only retained aggregate values', () => {
  assert.equal(summary.mean_raw_language_accuracy, 0.49235555555555555);
  assert.equal(summary.mean_language_centered_language_accuracy, 0.35902222222222224);
  assert.equal(summary.mean_normalized_language_leakage_reduction, 0.8350200176590828);
  assert.equal(summary.mean_raw_intent_accuracy, 0.7205333333333334);
  assert.equal(summary.mean_language_centered_intent_accuracy, 0.7230222222222222);
  assert.equal(summary.mean_effect_retention, 0.8713252358181732);
  assert.equal(summary.mean_intent_drop, -0.002488888888888874);
  assert.equal(summary.mean_specificity_margin, 0.8168639008523437);

  expectPaper(
    '0.492356', '0.359022', '0.835020', '0.720533', '0.723022',
    '0.871325', '-0.002489', '0.816864',
    '(Raw,0.492356)', '(Locale-centered,0.359022)',
    '(Raw,0.720533)', '(Locale-centered,0.723022)'
  );
});

test('all displayed descriptive interval endpoints are retained values and remain non-primary', () => {
  assert.equal(uncertainty.analysis_status, 'POST_OUTCOME_DESCRIPTIVE_ONLY_DOES_NOT_CHANGE_FROZEN_GATE');
  const expected = {
    raw_language_accuracy: ['0.480883', '0.503828'],
    language_centered_language_accuracy: ['0.344503', '0.373541'],
    normalized_language_leakage_reduction: ['0.732629', '0.937411'],
    raw_intent_accuracy: ['0.708624', '0.732442'],
    language_centered_intent_accuracy: ['0.709312', '0.736732'],
    intent_drop: ['-0.005501', '0.000524'],
    specificity_margin: ['0.718054', '0.915674']
  };
  for (const [metric, [lo, hi]] of Object.entries(expected)) {
    const [actualLo, actualHi] = uncertainty.metrics[metric].ci95_student_t;
    assert.equal(actualLo.toFixed(6), lo);
    assert.equal(actualHi.toFixed(6), hi);
    expectPaper(lo, hi);
  }
  expectPaper('post-outcome descriptive 95\\% Student-$t$ intervals', 'not a rescue criterion');
});

test('related-work citations are inherited exactly and do not become retroactive baselines', () => {
  const dois = [
    '10.18653/v1/2023.acl-long.235',
    '10.18653/v1/2020.emnlp-main.365',
    '10.18653/v1/2020.acl-main.647',
    '10.52202/075280-2884'
  ];
  for (const doi of dois) {
    assert.ok(related.includes(doi), `retained related-work file missing DOI ${doi}`);
    assert.ok(paper.includes(doi), `paper missing retained DOI ${doi}`);
  }
  expectPaper(
    'INLP and LEACE were not matched baselines in the frozen v3 protocol',
    'A direct comparison must therefore be conducted only as a separately preregistered successor study'
  );
});

test('paper does not introduce common unsupported rescue or superiority claims', () => {
  const forbidden = [
    /statistically significant/i,
    /establish(?:es|ed)? (?:general )?superiority/i,
    /outperform(?:s|ed)? (?:INLP|LEACE)/i,
    /validated confirmatory claim/i,
    /proves? (?:that )?locale/i,
    /external validation (?:shows|demonstrates|confirms)/i
  ];
  for (const pattern of forbidden) assert.doesNotMatch(paper, pattern);
});
