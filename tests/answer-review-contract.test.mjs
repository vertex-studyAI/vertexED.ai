import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ANSWER_REVIEW_CONTRACT_VERSION,
  buildAnswerReviewPrompt,
  createAnswerReviewResult,
  extractAnswerReviewGrade,
  normalizeAnswerReviewInput,
} from '../api/_lib/answerReview.js';

const input = normalizeAnswerReviewInput({
  curriculum: 'IB', subject: 'Biology', grade: '11', marks: '4',
  question: 'Explain osmosis.',
  answer: 'Water moves from high water potential to low water potential.',
  context: 'Award for direction and water potential.', strictness: '8',
});

test('review input is bounded and keeps question and answer image evidence separate', () => {
  const normalized = normalizeAnswerReviewInput(
    { question: 'Typed question', answer: 'Typed answer', marks: 999, strictness: -2 },
    { question: 'Question image', answer: 'Answer image' },
  );
  assert.match(normalized.question, /Typed question[\s\S]*Question image/);
  assert.match(normalized.answer, /Typed answer[\s\S]*Answer image/);
  assert.doesNotMatch(normalized.answer, /Question image/);
  assert.equal(normalized.marks, 100);
  assert.equal(normalized.strictness, 1);
});

test('review prompt freezes evidence and official-grade boundaries', () => {
  const prompt = buildAnswerReviewPrompt(input);
  assert.match(prompt, /Never award credit without at least one exact quote/);
  assert.match(prompt, /do not claim this is an official grade/i);
  assert.match(prompt, /sum to exactly 4/);
});

test('provider JSON extraction accepts clean JSON and rejects prose without an object', () => {
  assert.equal(extractAnswerReviewGrade('{"grade":{"id":"answer-review","score":2}}')?.score, 2);
  assert.equal(extractAnswerReviewGrade('No structured result'), null);
});

test('evidence-linked review still requires human confirmation for mastery', () => {
  const result = createAnswerReviewResult({
    input, model: 'fixture-model',
    rawGrade: {
      id: 'answer-review', score: 4, maxScore: 4, confidence: 0.9,
      feedback: 'Accurate explanation.', includes: 'Direction of movement.',
      criteria: [{ id: 'accuracy', label: 'Accuracy', score: 4, maxScore: 4, feedback: 'Correct direction.', evidenceQuotes: ['high water potential to low water potential'] }],
      errorCodes: [],
    },
  });
  assert.equal(result.contractVersion, ANSWER_REVIEW_CONTRACT_VERSION);
  assert.equal(result.review.scoreStatus, 'EVIDENCE_LINKED');
  assert.equal(result.review.humanReviewRequired, true);
  assert.equal(result.review.measurementEligible, false);
  assert.match(result.output, /Evidence-linked AI review/);
});

test('invented evidence forces a provisional review', () => {
  const result = createAnswerReviewResult({
    input,
    rawGrade: {
      id: 'answer-review', score: 4, maxScore: 4, confidence: 0.99,
      criteria: [{ id: 'accuracy', label: 'Accuracy', score: 4, maxScore: 4, evidenceQuotes: ['not in answer'] }],
    },
  });
  assert.equal(result.review.scoreStatus, 'PROVISIONAL');
  assert.match(result.output, /No exact answer evidence was verified/);
});

test('provider outage returns an explicit no-credit provisional result', () => {
  const result = createAnswerReviewResult({ input, degraded: true });
  assert.equal(result.degraded, true);
  assert.equal(result.review.score, 0);
  assert.equal(result.review.scoreStatus, 'PROVISIONAL');
  assert.match(result.review.feedback, /no credit has been assigned/i);
});
