import assert from 'node:assert/strict';
import test from 'node:test';

import {
  GRADING_CONTRACT_VERSION,
  HUMAN_REVIEW_CONFIDENCE_THRESHOLD,
  buildCoverageMap,
  buildDeterministicQuizFallback,
  normalizeEvidenceSpans,
  normalizeGradeAudits,
} from '../api/_lib/verifiedGrading.js';

const question = {
  id: 'q1',
  type: 'frq',
  maxScore: 4,
  objectiveIds: ['biology:osmosis'],
};

test('evidence spans accept only exact text from the student answer', () => {
  assert.deepEqual(normalizeEvidenceSpans('Water moves down a gradient.', ['down a gradient', 'paraphrase']), [
    { quote: 'down a gradient', start: 12, end: 27 },
  ]);
});

test('evidence spans deduplicate repeated requested quotes', () => {
  assert.equal(normalizeEvidenceSpans('alpha beta', ['alpha', 'alpha']).length, 1);
});

test('missing answers always escalate to human review', () => {
  const { audits } = normalizeGradeAudits({ questions: [question], userAnswers: {}, rawGrades: [] });
  assert.equal(audits[0].humanReviewRequired, true);
  assert.equal(audits[0].scoreStatus, 'PROVISIONAL');
  assert.match(audits[0].escalationReason, /No student answer/);
});

test('awarded credit without exact evidence remains provisional', () => {
  const { audits } = normalizeGradeAudits({
    questions: [question],
    userAnswers: { q1: 'Water crosses the membrane.' },
    rawGrades: [{ id: 'q1', score: 3, maxScore: 4, confidence: 0.95, evidenceQuotes: ['not present'] }],
  });
  assert.equal(audits[0].humanReviewRequired, true);
  assert.match(audits[0].escalationReason, /exact span/);
});

test('high-confidence criterion grades with exact evidence are verified', () => {
  const { audits } = normalizeGradeAudits({
    questions: [question],
    userAnswers: { q1: 'Water moves from high potential to low potential.' },
    rawGrades: [{
      id: 'q1',
      score: 4,
      maxScore: 4,
      confidence: 0.9,
      criteria: [{ id: 'accuracy', label: 'Accuracy', score: 4, maxScore: 4, evidenceQuotes: ['high potential to low potential'] }],
    }],
    model: 'fixture-model',
  });
  assert.equal(audits[0].scoreStatus, 'VERIFIED');
  assert.equal(audits[0].humanReviewRequired, false);
  assert.equal(audits[0].criteria[0].evidenceVerified, true);
  assert.equal(audits[0].model, 'fixture-model');
});

test('confidence below the frozen threshold escalates even with evidence', () => {
  const { audits } = normalizeGradeAudits({
    questions: [question],
    userAnswers: { q1: 'Water moves.' },
    rawGrades: [{ id: 'q1', score: 2, confidence: HUMAN_REVIEW_CONFIDENCE_THRESHOLD - 0.01, evidenceQuotes: ['Water moves'] }],
  });
  assert.equal(audits[0].humanReviewRequired, true);
  assert.match(audits[0].escalationReason, /confidence/);
});

test('scores and confidence are bounded to declared ranges', () => {
  const { audits } = normalizeGradeAudits({
    questions: [question],
    userAnswers: { q1: 'Evidence.' },
    rawGrades: [{ id: 'q1', score: 99, maxScore: 4, confidence: 9, evidenceQuotes: ['Evidence'] }],
  });
  assert.equal(audits[0].score, 4);
  assert.equal(audits[0].confidence, 1);
});

test('unknown error codes never enter the remediation audit', () => {
  const { audits } = normalizeGradeAudits({
    questions: [question],
    userAnswers: { q1: 'Evidence.' },
    rawGrades: [{ id: 'q1', errorCodes: ['CONCEPT_GAP', 'INVENTED_CODE'] }],
  });
  assert.deepEqual(audits[0].errors.map((error) => error.code), ['CONCEPT_GAP']);
  assert.deepEqual(audits[0].remediation, ['review-concept']);
});

test('empty responses receive the incomplete taxonomy', () => {
  const { audits } = normalizeGradeAudits({ questions: [question], userAnswers: { q1: '' }, rawGrades: [] });
  assert.equal(audits[0].errors[0].code, 'INCOMPLETE');
});

test('audit identifiers are stable for identical inputs', () => {
  const input = { questions: [question], userAnswers: { q1: 'Stable answer.' }, rawGrades: [{ id: 'q1' }] };
  assert.equal(normalizeGradeAudits(input).audits[0].auditId, normalizeGradeAudits(input).audits[0].auditId);
});

test('coverage counts attempted objectives but excludes provisional mastery', () => {
  const coverage = buildCoverageMap([question], [{ id: 'q1', humanReviewRequired: true, score: 4, maxScore: 4 }]);
  assert.deepEqual(coverage, [{
    objectiveId: 'biology:osmosis', attempted: 1, verified: 0, score: 0, maxScore: 0, masteryPercent: null,
  }]);
});

test('coverage computes mastery only from verified grades', () => {
  const coverage = buildCoverageMap([question], [{ id: 'q1', humanReviewRequired: false, score: 3, maxScore: 4 }]);
  assert.equal(coverage[0].masteryPercent, 75);
  assert.equal(coverage[0].verified, 1);
});

test('fallback questions are deterministic and carry source hashes', () => {
  const input = { notes: 'Osmosis moves water across a partially permeable membrane. Diffusion moves particles down a concentration gradient.', board: 'IGCSE', subjects: ['Biology'] };
  const first = buildDeterministicQuizFallback(input);
  const second = buildDeterministicQuizFallback(input);
  assert.deepEqual(first, second);
  assert.equal(first[0].provenance.generator, 'deterministic-retrieval-fallback');
  assert.match(first[0].provenance.sourceDigest, /^[0-9a-f]{64}$/);
});

test('fallback refuses notes without a complete usable idea', () => {
  assert.deepEqual(buildDeterministicQuizFallback({ notes: 'too short' }), []);
});

test('fallback emits bounded questions with objectives and criteria', () => {
  const questions = buildDeterministicQuizFallback({
    notes: 'A sufficiently detailed first scientific statement supports retrieval practice. A second detailed statement supports another prompt. A third detailed statement completes the set. A fourth statement must not exceed the fixed cap.',
    subjects: ['Science'],
  });
  assert.equal(questions.length, 3);
  for (const item of questions) {
    assert.equal(item.maxScore, 4);
    assert.equal(item.criteria.length, 2);
    assert.equal(item.objectiveIds.length, 1);
  }
});

test('every audit advertises the frozen contract version', () => {
  const { audits } = normalizeGradeAudits({ questions: [question], userAnswers: {}, rawGrades: [] });
  assert.equal(audits[0].contractVersion, GRADING_CONTRACT_VERSION);
});
