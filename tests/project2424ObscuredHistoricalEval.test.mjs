import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classificationMetrics,
  evaluateFrozenSystems,
  rankCandidate,
  rankHardBlockersBaseline,
  rankMeanEvidenceBaseline,
  rankRecencyBaseline,
} from '../portfolio/project2424/projects/T2424-0038/src/historical-eval.mjs';

const leads = [
  {
    id: 'A',
    title: 'Confirmed filing',
    claim: 'A public filing records the event',
    novelty: 0.6,
    impact: 0.7,
    risk: 0.2,
    ageHours: 12,
    sources: [
      { publisher: 'agency.gov', primary: true, sourceType: 'official', evidence: 0.95 },
      { publisher: 'wire.example', primary: false, sourceType: 'wire', evidence: 0.85 },
    ],
  },
  {
    id: 'B',
    title: 'Single-source rumor',
    claim: 'One publisher reports an unverified claim',
    novelty: 0.9,
    impact: 0.8,
    risk: 0.5,
    ageHours: 1,
    sources: [
      { publisher: 'only.example', primary: false, sourceType: 'secondary', evidence: 0.9 },
    ],
  },
  {
    id: 'C',
    title: 'High-risk two-source claim',
    claim: 'Two secondary publishers repeat a high-risk allegation',
    novelty: 0.8,
    impact: 0.9,
    risk: 0.9,
    ageHours: 6,
    sources: [
      { publisher: 'one.example', primary: false, sourceType: 'secondary', evidence: 0.8 },
      { publisher: 'two.example', primary: false, sourceType: 'secondary', evidence: 0.75 },
    ],
  },
  {
    id: 'D',
    title: 'Corroborated update',
    claim: 'Multiple sources support a routine update',
    novelty: 0.4,
    impact: 0.5,
    risk: 0.3,
    ageHours: 24,
    sources: [
      { publisher: 'primary.example', primary: true, sourceType: 'primary', evidence: 0.75 },
      { publisher: 'secondary.example', primary: false, sourceType: 'secondary', evidence: 0.7 },
      { publisher: 'wire.example', primary: false, sourceType: 'wire', evidence: 0.8 },
    ],
  },
];

const labels = [
  { lead_id: 'A', label: 'REPORTABLE' },
  { lead_id: 'B', label: 'HOLD' },
  { lead_id: 'C', label: 'HOLD' },
  { lead_id: 'D', label: 'REPORTABLE' },
];

test('B0 recency baseline ranks the newest lead first and classifies all as reportable', () => {
  const rows = rankRecencyBaseline(leads);
  assert.deepEqual(rows.map((row) => row.id), ['B', 'C', 'A', 'D']);
  assert.ok(rows.every((row) => row.decision === 'REPORTABLE_CANDIDATE'));
});

test('B1 mean-evidence baseline deliberately ignores independence blockers', () => {
  const rows = rankMeanEvidenceBaseline(leads);
  const singleSource = rows.find((row) => row.id === 'B');
  assert.equal(singleSource.decision, 'REPORTABLE_CANDIDATE');
  assert.equal(singleSource.rank_value, 0.9);
});

test('B2 hard-blockers-only baseline holds unsafe synthetic leads without weighted ranking', () => {
  const rows = rankHardBlockersBaseline(leads);
  assert.deepEqual(rows.slice(0, 2).map((row) => row.id), ['A', 'D']);
  assert.equal(rows.find((row) => row.id === 'B').decision, 'HOLD_FOR_VERIFICATION');
  assert.equal(rows.find((row) => row.id === 'C').decision, 'HOLD_FOR_VERIFICATION');
});

test('candidate ranking remains deterministic and fail-closed on the same fixtures', () => {
  const first = rankCandidate(leads);
  const second = rankCandidate(structuredClone(leads));
  assert.deepEqual(first, second);
  assert.equal(first.find((row) => row.id === 'B').decision, 'HOLD_FOR_VERIFICATION');
  assert.equal(first.find((row) => row.id === 'C').decision, 'HOLD_FOR_VERIFICATION');
});

test('classification metrics expose the intended false-promotion safety contrast', () => {
  const b0 = classificationMetrics(rankRecencyBaseline(leads), labels);
  const candidate = classificationMetrics(rankCandidate(leads), labels);
  assert.equal(b0.false_promotion_rate, 1);
  assert.equal(candidate.false_promotion_rate, 0);
  assert.equal(candidate.balanced_accuracy, 1);
  assert.deepEqual(candidate.counts, { tp: 2, fp: 0, tn: 2, fn: 0 });
});

test('frozen evaluator returns exactly the declared systems without mutating inputs', () => {
  const original = structuredClone(leads);
  const results = evaluateFrozenSystems(leads, labels);
  assert.deepEqual(Object.keys(results), [
    'B0_RECENCY_ONLY',
    'B1_MEAN_EVIDENCE_ONLY',
    'B2_HARD_BLOCKERS_ONLY',
    'CANDIDATE_FULL_TRIAGE',
  ]);
  assert.deepEqual(leads, original);
  assert.equal(results.CANDIDATE_FULL_TRIAGE.metrics.false_promotion_rate, 0);
});

test('evaluation fails closed when labels are missing, duplicated, or reference unknown leads', () => {
  const rows = rankCandidate(leads);
  assert.throws(
    () => classificationMetrics(rows, labels.slice(0, -1)),
    /labels must cover every frozen lead/,
  );
  assert.throws(
    () => classificationMetrics(rows, [...labels, labels[0]]),
    /duplicate label lead_id/,
  );
  assert.throws(
    () => classificationMetrics(rows, [
      ...labels.slice(0, -1),
      { lead_id: 'UNKNOWN', label: 'REPORTABLE' },
    ]),
    /unknown lead id/,
  );
});
