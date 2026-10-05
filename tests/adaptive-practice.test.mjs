import test from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTIVE_QUESTION_BANK } from '../src/content/adaptiveQuestionBank.mjs';
import { classifyPracticeAnswer, selectPracticeQuestions, selectTargetedFollowUp } from '../src/lib/adaptivePractice.mjs';

test('question bank spans serious subjects and real difficulty levels', () => {
  assert.ok(ADAPTIVE_QUESTION_BANK.length >= 20);
  assert.deepEqual(new Set(ADAPTIVE_QUESTION_BANK.map((q) => q.subject)), new Set(['Mathematics', 'Physics', 'Computer Science']));
  assert.deepEqual(new Set(ADAPTIVE_QUESTION_BANK.map((q) => q.difficulty)), new Set(['foundation', 'intermediate', 'advanced', 'very-hard']));
  assert.ok(ADAPTIVE_QUESTION_BANK.some((q) => q.topic === 'Integration'));
  assert.ok(ADAPTIVE_QUESTION_BANK.every((q) => q.difficultyReason && q.solution.length >= 1));
});

test('selection is seeded and excludes recently shown questions when alternatives exist', () => {
  const first = selectPracticeQuestions({ filters: { subject: 'Mathematics' }, count: 5, seed: 42 });
  const repeated = selectPracticeQuestions({ filters: { subject: 'Mathematics' }, count: 5, seed: 42 });
  assert.deepEqual(first.map((q) => q.id), repeated.map((q) => q.id));
  const next = selectPracticeQuestions({ filters: { subject: 'Mathematics' }, count: 5, recentIds: first.map((q) => q.id), seed: 43 });
  assert.equal(next.some((question) => first.some((shown) => shown.id === question.id)), false);
});

test('filters enforce topic, difficulty and question type', () => {
  const selected = selectPracticeQuestions({ filters: { subject: 'Physics', difficulty: 'advanced', type: 'numeric' }, count: 10, seed: 2 });
  assert.ok(selected.length > 0);
  assert.ok(selected.every((q) => q.subject === 'Physics' && q.difficulty === 'advanced' && q.type === 'numeric'));
});

test('known wrong answers produce structured misconception evidence', () => {
  const friction = ADAPTIVE_QUESTION_BANK.find((q) => q.id === 'physics-friction-01');
  const diagnosis = classifyPracticeAnswer(friction, '5.8');
  assert.equal(diagnosis.correct, false);
  assert.equal(diagnosis.errorCategory, 'physical_model');
  assert.equal(diagnosis.errorSubcategory, 'friction_direction');
  assert.match(diagnosis.studentMisconception, /opposes relative sliding/i);
  assert.ok(diagnosis.nextStep.length > 20);
});

test('verified answers accept tolerance and reject malformed numeric input safely', () => {
  const bayes = ADAPTIVE_QUESTION_BANK.find((q) => q.id === 'math-probability-bayes-01');
  assert.equal(classifyPracticeAnswer(bayes, '0.274').correct, true);
  const malformed = classifyPracticeAnswer(bayes, 'about one quarter');
  assert.equal(malformed.correct, false);
  assert.equal(malformed.errorSubcategory, 'answer_format');
});

test('targeted follow-up never repeats the current question', () => {
  const question = ADAPTIVE_QUESTION_BANK.find((q) => q.id === 'physics-friction-01');
  const diagnosis = classifyPracticeAnswer(question, '5.8');
  const followUp = selectTargetedFollowUp(question, diagnosis, [], 5);
  assert.ok(followUp);
  assert.notEqual(followUp.id, question.id);
  assert.equal(followUp.subject, question.subject);
});

test('targeted follow-up can reuse a related recent item before repeating the current question', () => {
  const question = ADAPTIVE_QUESTION_BANK.find((q) => q.id === 'physics-friction-01');
  const related = ADAPTIVE_QUESTION_BANK.find((q) => q.id === 'physics-forces-01');
  const diagnosis = classifyPracticeAnswer(question, '5.8');
  const followUp = selectTargetedFollowUp(question, diagnosis, [related.id], 7);
  assert.equal(followUp.id, related.id);
  assert.notEqual(followUp.id, question.id);
});
