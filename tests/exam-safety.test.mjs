import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canVerifyQuestion,
  deterministicScore,
  validateQuestionImport,
  validateSourceInput,
} from '../api/_lib/examSafety.js';

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';
const UUID_C = '33333333-3333-4333-8333-333333333333';

test('validateSourceInput requires provenance metadata', () => {
  const result = validateSourceInput({
    title: 'Paper 1',
    rightsHolder: 'Board',
    authorizationBasis: 'licence',
    authorizationReference: 'contract-1',
    permittedUses: ['practice'],
    sha256: 'a'.repeat(64),
    sourceUrl: 'https://example.com/paper-1.pdf',
  });

  assert.equal(result.ok, true);
});

test('validateQuestionImport rejects mark-scheme totals that do not match question marks', () => {
  const result = validateQuestionImport({
    sourceVersionId: UUID_A,
    subjectId: UUID_B,
    externalReference: 'P1-Q1',
    questionText: 'What is 2 + 2?',
    questionType: 'selected_response',
    marks: 4,
    sourceLocator: { page: 1 },
    markSchemePoints: [
      { code: 'A', maxMarks: 2, criterion: 'States 4', sourceLocator: { page: 1 } },
    ],
    classifications: [
      { curriculumNodeId: UUID_C, relation: 'primary', method: 'human', confidence: 1 },
    ],
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /add exactly/i);
});

test('deterministicScore only scores exact selected responses', () => {
  const score = deterministicScore(
    {
      question_type: 'selected_response',
      question_payload: { answerKey: 'B' },
      marks: 3,
    },
    { answer: 'B' },
  );

  assert.equal(score, 3);
  assert.equal(
    deterministicScore(
      { question_type: 'structured_response', question_payload: {}, marks: 6 },
      { answer: 'anything' },
    ),
    null,
  );
});

test('canVerifyQuestion blocks activation when source or review chain is incomplete', () => {
  const result = canVerifyQuestion({
    source: { status: 'pending_review' },
    sourceVersion: { parse_status: 'verified', review_status: 'verified' },
    markSchemePoints: [{ max_marks: 2, review_status: 'verified' }],
    classifications: [{ review_status: 'verified' }],
    marks: 2,
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /not authorized/i);
});
