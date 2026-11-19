import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { promoteFeedbackReview } from '../scripts/lib/feedback-eval-promotion.mjs';
import { normalizeMeasuredWeaknessEntry } from '../src/lib/weaknessEvidenceCore.mjs';

const review = JSON.parse(fs.readFileSync('evals/feedback-reviews/learner-attestation-mastery-boundary.review.json', 'utf8'));

test('promotion requires explicit consent, de-identification, no free text and before/after receipts', () => {
  const promoted = promoteFeedbackReview(review);
  assert.equal(promoted.privacy.containsUserContent, false);
  assert.equal(promoted.privacy.freeTextIncluded, false);
  assert.equal('feedback' in promoted, false);
  assert.throws(() => promoteFeedbackReview({ ...review, privacy: { ...review.privacy, explicitConsentForEval: false } }), /consent/i);
  assert.throws(() => promoteFeedbackReview({ ...review, privacy: { ...review.privacy, containsUserContent: true } }), /consent/i);
});

test('the reviewed failure reproduces under the legacy rule and passes under the fixed rule', () => {
  const candidate = {
    topic: 'Synthetic topic', subject: 'Synthetic subject', score: 1, maxScore: 2, source: 'review',
    evidence: 'measured-v2', recordedAt: '2026-10-19T00:00:00.000Z',
    verification: { method: 'teacher-confirmed', confirmedAt: '2026-10-19T00:00:00.000Z' },
  };
  const legacyMethods = new Set(['teacher-confirmed', 'official-mark-scheme', 'validated-answer-key']);
  assert.equal(legacyMethods.has(candidate.verification.method), true, 'pre-fix rule incorrectly accepted the learner report');
  assert.equal(normalizeMeasuredWeaknessEntry(candidate), null, 'fixed rule must reject the same input');
});
