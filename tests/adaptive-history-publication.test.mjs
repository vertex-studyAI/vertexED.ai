import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { ADAPTIVE_QUESTION_BANK } from '../src/content/adaptiveQuestionBank.mjs';
import { LEARNING_QUESTIONS, LEARNING_QUESTION_METADATA, normalisePracticeAttempt, parseLearningRecords, mergeLearningRecord, buildKnowledgeModel, buildLearningPlan, selectLearningQuestion } from '../src/lib/learningModel.mjs';
import { publishedPracticeQuestions } from '../api/_lib/practicePublication.js';
import { normalizeLearnerStateItem } from '../api/_lib/learnerStateStore.js';
import { practiceSessionNeedsReview, parsePracticeSession, writePracticeSession } from '../src/lib/practiceSession.mjs';

const authoring = ADAPTIVE_QUESTION_BANK.find(q => q.id === 'physics-forces-01');
const revision = `sha256:${createHash('sha256').update(JSON.stringify(authoring)).digest('hex')}`;
const question = { ...LEARNING_QUESTIONS.find(q => q.id === authoring.id), contentRevision: revision };
const record = (patch = {}) => ({ id: 'attempt:historical-1234', questionId: question.id, answer: '3', confidence: 4, hinted: false, seconds: 42.5, at: '2026-10-01T12:34:56+00:00', mode: 'mixed', ...patch });
const approval = { path: `module:/src/content/adaptiveQuestionBank.mjs#${question.id}`, editorialStatus: 'approved', publicationStatus: 'published', source: 'synthetic authored fixture', factualReviewer: 'synthetic independent reviewer', reviewedAt: '2026-10-01T00:00:00Z', license: 'synthetic permission', permittedUse: 'synthetic test', contentVersion: 'fixture-v1', answerVersion: 'fixture-key-v1', contentHash: revision };
const apiItem = payload => ({ stateType: 'practice_attempt', stateKey: payload.id, payload, clientRevision: 'state:1790000000000:abcdefgh', clientUpdatedAt: '2026-10-01T12:34:56Z' });

test('legacy parsing and subsequent merges preserve original records without regrading or rounding', () => {
  const legacy = record({ correct: true, error: null, evidence: 'original-bank-answer-check-v1', historicalNote: 'retained original field' });
  const raw = JSON.stringify([legacy]);
  assert.equal(JSON.stringify(parseLearningRecords(raw, 'practice_attempt')), raw);
  const merged = mergeLearningRecord(parseLearningRecords(raw, 'practice_attempt'), record({ id: 'attempt:historical-5678', answer: '9' }), 'practice_attempt');
  assert.deepEqual(merged[0], legacy);
  assert.equal(merged[0].seconds, 42.5);
  assert.equal(merged[0].at, legacy.at);
  for (const questions of [[], [question], [{ ...question, answer: { value: 9 } }]]) {
    const projected = normalisePracticeAttempt(legacy, { questions });
    assert.equal(projected.assessmentStatus, 'held');
    assert.equal(projected.correct, null);
    assert.equal(projected.recordedResult.correct, true);
    assert.equal(projected.answer, legacy.answer);
  }
  assert.equal(JSON.stringify(legacy), JSON.stringify(JSON.parse(raw)[0]));
});

test('unknown historical references remain readable and exported but never become graded evidence', () => {
  const unknown = record({ questionId: 'archived-question-unknown', correct: true, evidence: 'claimed-verified', assessmentStatus: 'verified' });
  assert.deepEqual(parseLearningRecords(JSON.stringify([unknown]), 'practice_attempt'), [unknown]);
  const projected = normalisePracticeAttempt(unknown, { questions: [question] });
  assert.equal(projected.assessmentStatus, 'held');
  assert.equal(projected.correct, null);
  assert.ok(buildKnowledgeModel([unknown], Date.now(), [question]).every(node => node.attempts === 0 && node.accuracy === null));
  const reflection = { id: 'mistake:archived-1234', questionId: unknown.questionId, cause: 'misread', reflection: 'Original reflection', correction: 'Original correction', updatedAt: unknown.at };
  assert.deepEqual(parseLearningRecords(JSON.stringify([reflection]), 'practice_mistake'), [reflection]);
});

test('only an exact approved revision is graded and submitted scores cannot forge correctness', () => {
  const approved = record({ contentRevision: revision, answer: '99', correct: true });
  const assessed = normalisePracticeAttempt(approved, { questions: [question] });
  assert.equal(assessed.assessmentStatus, 'verified');
  assert.equal(assessed.correct, false);
  assert.equal(assessed.recordedResult.correct, true);
  const canonical = normalizeLearnerStateItem(apiItem(approved), { practiceQuestions: [question] });
  assert.equal(canonical.payload.correct, false);
  assert.equal(canonical.payload.assessmentStatus, 'verified');
  const correct = normalisePracticeAttempt(record({ contentRevision: revision }), { questions: [question] });
  assert.equal(correct.correct, true);
  for (const questions of [[], [{ ...question, contentRevision: `sha256:${'0'.repeat(64)}` }]]) {
    assert.equal(normalisePracticeAttempt(approved, { questions }).correct, null);
    assert.equal(normalisePracticeAttempt(approved, { questions }).assessmentStatus, 'held');
  }
});

test('server exact approval uses original source hashes and defaults to the real empty register', () => {
  assert.deepEqual(publishedPracticeQuestions(), []);
  assert.deepEqual(publishedPracticeQuestions({ bank: [authoring], approvals: [] }), []);
  const approved = publishedPracticeQuestions({ bank: [authoring], approvals: [approval] });
  assert.equal(approved.length, 1);
  assert.equal(approved[0].contentRevision, revision);
  assert.deepEqual(publishedPracticeQuestions({ bank: [{ ...authoring, answer: { value: 99 } }], approvals: [approval] }), []);
  assert.deepEqual(publishedPracticeQuestions({ bank: [authoring], approvals: [approval, approval] }), []);
  const held = normalizeLearnerStateItem(apiItem(record({ contentRevision: revision, correct: true })));
  assert.equal(held.payload.correct, null);
  assert.equal(held.payload.recordedResult.correct, true);
});

test('corruption still rejects the entire saved collection instead of dropping records', () => {
  for (const patch of [{ answer: '' }, { questionId: '../bad' }, { confidence: 9 }, { hinted: 'false' }, { seconds: -1 }, { at: 'not-a-date' }, { contentRevision: 'untrusted' }, { correct: 'true' }, { recordedResult: { correct: 'yes' } }]) {
    assert.throws(() => parseLearningRecords(JSON.stringify([record(), record(patch)]), 'practice_attempt'), /Original data is preserved/);
    assert.equal(normalizeLearnerStateItem(apiItem(record(patch))), null);
  }
});

test('legacy or changed-revision sessions are restorable but blocked from autosave/grading', () => {
  const session = { id: 'history-session-1234', ids: [question.id], index: 0, mode: 'mixed', startedAt: 1, deadline: null, finished: false, responses: { [question.id]: { answer: '3', confidence: 4, hinted: false, seconds: 42, flagged: false } }, subject: question.subject, topic: '', concept: '', curriculum: '' };
  const raw = JSON.stringify(session);
  const restored = parsePracticeSession(raw);
  assert.equal(practiceSessionNeedsReview(restored, [question]), true);
  let saved = raw;
  const storage = { getItem: () => saved, setItem: (_key, value) => { saved = value; } };
  assert.throws(() => writePracticeSession(storage, 'history', raw, restored, { questions: [question] }), /original answers are preserved/);
  assert.equal(saved, raw);
  const current = { ...session, contentRevisions: { [question.id]: revision } };
  assert.equal(practiceSessionNeedsReview(current, [question]), false);
  assert.equal(practiceSessionNeedsReview(current, []), true);
  assert.equal(practiceSessionNeedsReview(current, [{ ...question, contentRevision: `sha256:${'1'.repeat(64)}` }]), true);
  assert.throws(() => parsePracticeSession(JSON.stringify({ ...session, contentRevisions: { [question.id]: 'fake' } })), /preserved/);
});

test('metadata has no educational bodies and an empty published pool offers course materials', () => {
  assert.equal(LEARNING_QUESTION_METADATA.length, ADAPTIVE_QUESTION_BANK.length);
  for (const item of LEARNING_QUESTION_METADATA) for (const key of ['answer', 'prompt', 'choices', 'solution', 'mistakes']) assert.equal(Object.hasOwn(item, key), false);
  assert.equal(selectLearningQuestion({ questions: [] }), null);
  assert.equal(buildLearningPlan({ questions: [] }).planned[0].kind, 'source');
});

test('reflection sync preserves raw fields and equal-instant history without normalizing timestamps', () => {
  const reflection = { id: 'mistake:historical-1234', questionId: 'archived-question-unknown', cause: 'conceptual', reflection: 'Original reflection', correction: 'Original correction', updatedAt: '2026-10-01T12:34:56+00:00', historicalNote: { text: 'Only original copy' } };
  const canonical = normalizeLearnerStateItem({ ...apiItem(reflection), stateType: 'practice_mistake' });
  assert.deepEqual(canonical.payload, reflection);
  const oldCloudCopy = { ...reflection, updatedAt: '2026-10-01T12:34:56.000Z' };
  delete oldCloudCopy.historicalNote;
  assert.deepEqual(mergeLearningRecord([reflection], oldCloudCopy, 'practice_mistake'), [reflection]);
  const extraCloudMetadata = { ...oldCloudCopy, remoteNote: 'Retain this too' };
  assert.deepEqual(mergeLearningRecord([reflection], extraCloudMetadata, 'practice_mistake'), [{ ...reflection, remoteNote: 'Retain this too' }]);
});

test('history merge orders timestamp instants and refuses equal-instant conflicting records', () => {
  const original = record({ at: '2026-10-01T12:34:56+00:00', correct: true, historicalNote: 'Original metadata' });
  const projected = normalizeLearnerStateItem(apiItem(original)).payload;
  assert.deepEqual(mergeLearningRecord([original], projected, 'practice_attempt'), [original]);
  for (const patch of [{ answer: 'different' }, { historicalNote: 'different' }, { seconds: 42 }]) {
    assert.throws(() => mergeLearningRecord([original], { ...original, at: '2026-10-01T12:34:56.000Z', ...patch }, 'practice_attempt'), /conflict.*preserved/i);
  }
  const newer = { ...original, at: '2026-10-01T08:00:00-05:00', answer: 'Newer answer' };
  assert.deepEqual(mergeLearningRecord([original], newer, 'practice_attempt'), [newer]);
  assert.deepEqual(mergeLearningRecord([newer], original, 'practice_attempt'), [newer]);
  const unsafe = JSON.parse(JSON.stringify(original).slice(0, -1) + ',"__proto__":{"polluted":true}}');
  assert.throws(() => mergeLearningRecord([original], unsafe, 'practice_attempt'), /conflict.*preserved/i);
  assert.equal({}.polluted, undefined);
});
