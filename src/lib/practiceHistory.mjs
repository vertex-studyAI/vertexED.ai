import { classifyPracticeAnswer } from './adaptivePractice.mjs';

export const PRACTICE_CONTENT_REVISION = /^sha256:[a-f0-9]{64}$/;
const MODES = new Set(['diagnostic', 'targeted', 'mixed', 'exam', 'rapid', 'prerequisites', 'challenge']);
const DAY = 86400000;
const resultValid = result => result === null || (result && typeof result === 'object' && !Array.isArray(result)
  && (result.correct === null || typeof result.correct === 'boolean')
  && (result.error === undefined || result.error === null || typeof result.error === 'string' && result.error.length <= 160)
  && (result.evidence === undefined || typeof result.evidence === 'string' && result.evidence.length <= 240));

/** Validate saved facts independently of today's publishable question pool. */
export function isPracticeAttemptRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value)
    && /^attempt:[a-zA-Z0-9-]{8,80}$/.test(value.id || '')
    && typeof value.questionId === 'string' && /^[a-zA-Z0-9_-]{1,160}$/.test(value.questionId)
    && typeof value.answer === 'string' && value.answer.trim() && value.answer.length <= 200
    && (value.confidence === null || [1, 2, 3, 4, 5].includes(value.confidence)) && typeof value.hinted === 'boolean'
    && Number.isFinite(value.seconds) && value.seconds >= 0 && value.seconds <= 86400
    && typeof value.at === 'string' && Number.isFinite(Date.parse(value.at)) && Date.parse(value.at) <= Date.now() + DAY
    && MODES.has(value.mode)
    && (value.contentRevision === undefined || PRACTICE_CONTENT_REVISION.test(value.contentRevision))
    && (value.correct === undefined || value.correct === null || typeof value.correct === 'boolean')
    && (value.error === undefined || value.error === null || typeof value.error === 'string' && value.error.length <= 160)
    && (value.evidence === undefined || typeof value.evidence === 'string' && value.evidence.length <= 240)
    && (value.recordedResult === undefined || resultValid(value.recordedResult)));
}

/** A derived view, never a replacement for the raw historical record. */
export function assessPracticeAttempt(value, publishedQuestions = []) {
  if (!isPracticeAttemptRecord(value)) return null;
  const question = publishedQuestions.find(item => item.id === value.questionId);
  const exactRevision = PRACTICE_CONTENT_REVISION.test(value.contentRevision)
    && question?.contentRevision === value.contentRevision && question.answer;
  const recordedResult = value.recordedResult !== undefined ? value.recordedResult
    : typeof value.correct === 'boolean' ? { correct: value.correct, error: value.error ?? null, ...(value.evidence ? { evidence: value.evidence } : {}) } : null;
  const result = exactRevision ? classifyPracticeAnswer(question, value.answer) : null;
  return { ...value, recordedResult,
    correct: result?.correct ?? null, error: result?.errorSubcategory ?? null,
    evidence: exactRevision ? 'exact-published-answer-check-v2' : 'historical-result-unverified',
    assessmentStatus: exactRevision ? 'verified' : 'held' };
}
