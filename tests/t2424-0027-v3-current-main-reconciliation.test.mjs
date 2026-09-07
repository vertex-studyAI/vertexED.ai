import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = 'portfolio/project2424/projects/T2424-0027/real_encoder/retained_v3_primary';

async function text(name) {
  return readFile(`${ROOT}/${name}`, 'utf8');
}

async function json(name) {
  return JSON.parse(await text(name));
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fixed(value) {
  return Number(value).toFixed(6);
}

test('T2424-0027 v3 retained evidence bytes match the historical frozen result', async () => {
  const reconciliation = await json('CURRENT_MAIN_RECONCILIATION_V1.json');
  const [summaryText, verdictText, perSeedText] = await Promise.all([
    text('summary.json'),
    text('verdict.json'),
    text('per_seed_metrics.jsonl'),
  ]);

  assert.equal(sha256(summaryText), reconciliation.retained_evidence.summary.sha256);
  assert.equal(sha256(verdictText), reconciliation.retained_evidence.verdict.sha256);
  assert.equal(sha256(perSeedText), reconciliation.retained_evidence.per_seed_metrics.sha256);

  assert.equal(reconciliation.historical_result_head, '2271e867200783c810ef94d8b9129d0b9f61dd9b');
  assert.equal(reconciliation.historical_paper_head, '20aae07f31ab0bd10627376db0cb69c07ad48852');
  assert.equal(reconciliation.reconciliation_kind, 'RESULT_AND_MANUSCRIPT_BYTES_ONLY_NO_REEXECUTION');
  assert.equal(reconciliation.execution_authorized, false);
  assert.equal(reconciliation.outcome_reexecution_authorized, false);
});

test('T2424-0027 v3 current-main package preserves the frozen negative gate', async () => {
  const [summary, verdict, claims, reconciliation, perSeedText] = await Promise.all([
    json('summary.json'),
    json('verdict.json'),
    json('PREPRINT_CLAIM_MATRIX.json'),
    json('CURRENT_MAIN_RECONCILIATION_V1.json'),
    text('per_seed_metrics.jsonl'),
  ]);

  assert.equal(verdict.verdict, 'FAIL_PREDECLARED_REAL_ENCODER_GATE');
  assert.equal(verdict.success_gate_passed, false);
  assert.equal(verdict.no_thresholds_moved_after_outcome_access, true);
  assert.equal(summary.seed_count, 5);
  assert.equal(summary.seed_passes, 0);
  assert.equal(claims.primary_verdict, verdict.verdict);
  assert.equal(reconciliation.scientific_verdict, verdict.verdict);

  assert.equal(reconciliation.frozen_gate.raw_language_accuracy_min, 0.75);
  assert.equal(reconciliation.frozen_gate.effect_retention_min, 0.7);
  assert.equal(reconciliation.frozen_gate.intent_drop_max, 0.02);
  assert.equal(reconciliation.frozen_gate.specificity_margin_min, 0.15);
  assert.equal(reconciliation.frozen_gate.required_seed_passes, 4);
  assert.deepEqual(reconciliation.frozen_gate.seeds, [2401, 2402, 2403, 2404, 2405]);

  const rows = perSeedText.trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map((row) => row.seed), [2401, 2402, 2403, 2404, 2405]);
  assert.ok(rows.every((row) => row.predeclared_seed_pass === false));
  assert.ok(rows.every((row) => row.raw.language_accuracy < 0.75));
});

test('T2424-0027 v3 manuscript is numerically bound to retained evidence and cannot rescue the result', async () => {
  const [manuscript, summary, verdict, uncertainty] = await Promise.all([
    text('MANUSCRIPT_V3_NEGATIVE.md'),
    json('summary.json'),
    json('verdict.json'),
    json('descriptive_uncertainty.json'),
  ]);

  const required = [
    '**`FAIL_PREDECLARED_REAL_ENCODER_GATE`**',
    '`0/5` seeds',
    '`>= 4/5`',
    '`0.75`',
    fixed(summary.mean_raw_language_accuracy),
    fixed(summary.mean_effect_retention),
    fixed(summary.mean_intent_drop),
    fixed(summary.mean_specificity_margin),
    fixed(summary.mean_normalized_language_leakage_reduction),
    'These secondary observations do not rescue the failed primary gate.',
    'Any scientific protocol revision after outcome access requires a new preregistration.',
  ];

  for (const literal of required) {
    assert.ok(manuscript.includes(literal), `manuscript drift: missing ${literal}`);
  }

  const intervals = [
    ['raw_language_accuracy', '0.480883', '0.503828'],
    ['effect_retention', '0.764483', '0.978168'],
    ['intent_drop', '-0.005501', '0.000524'],
    ['specificity_margin', '0.718054', '0.915674'],
    ['normalized_language_leakage_reduction', '0.732629', '0.937411'],
  ];

  for (const [metric, lower, upper] of intervals) {
    const observed = uncertainty.metrics[metric].ci95_student_t;
    assert.equal(fixed(observed[0]), lower);
    assert.equal(fixed(observed[1]), upper);
    assert.ok(manuscript.includes(lower));
    assert.ok(manuscript.includes(upper));
  }

  assert.equal(
    uncertainty.analysis_status,
    'POST_OUTCOME_DESCRIPTIVE_ONLY_DOES_NOT_CHANGE_FROZEN_GATE',
  );
  assert.equal(verdict.success_gate_passed, false);

  const prohibited = [
    'linguistic relativity established',
    'establishes linguistic relativity',
    'proves linguistic relativity',
    'statistically significant primary success',
    'partial primary pass',
    'demonstrates model superiority',
    'confirms a universal language-invariant representation',
  ];
  const normalized = manuscript.toLowerCase();
  for (const phrase of prohibited) {
    assert.equal(normalized.includes(phrase), false, `prohibited claim leaked: ${phrase}`);
  }
});

test('T2424-0027 v3 checksum ledger retains the three publication-critical artifact hashes', async () => {
  const ledger = await text('SHA256SUMS.txt');
  const reconciliation = await json('CURRENT_MAIN_RECONCILIATION_V1.json');

  for (const [name, key] of [
    ['summary.json', 'summary'],
    ['verdict.json', 'verdict'],
    ['per_seed_metrics.jsonl', 'per_seed_metrics'],
  ]) {
    const hash = reconciliation.retained_evidence[key].sha256;
    assert.ok(ledger.includes(`${hash}  ${name}`), `checksum ledger drift for ${name}`);
  }
});
