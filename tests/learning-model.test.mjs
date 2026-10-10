import test from 'node:test';
import assert from 'node:assert/strict';
import { LEARNING_QUESTIONS, CONCEPT_GRAPH, buildKnowledgeModel, selectLearningQuestion, buildLearningPlan, normalisePracticeAttempt, parseLearningRecords, mergeLearningRecord } from '../src/lib/learningModel.mjs';
import { classifyPracticeAnswer } from '../src/lib/adaptivePractice.mjs';
import { normalizeLearnerStateItem } from '../api/_lib/learnerStateStore.js';
import { buildAskMessages } from '../api/_lib/askPrompt.js';
import { TUTOR_MODES } from '../src/lib/tutorModes.mjs';
import { slideTiles, addTile } from '../src/lib/breakGames.mjs';
const now = Date.parse('2026-09-21T12:00:00Z');
const q = LEARNING_QUESTIONS.find(q => q.id === 'physics-forces-01');
const attempt = (n, correct = false, patch = {}) => ({ id: `attempt:abcdefgh-${n}`, questionId: q.id, answer: correct ? String(q.answer.value) : '-1234', confidence: 4, hinted: false, seconds: 45, at: new Date(now - n * 86400000).toISOString(), mode: 'diagnostic', ...patch });
test('numeric blank, comma ambiguity, NaN and infinity cannot pass as numeric answers', () => {
  const zero = { ...q, answer: { value: 0 } };
  for (const value of ['', ' ', null, 'NaN', 'Infinity', '1,2']) assert.equal(classifyPracticeAnswer(zero, value).correct, false);
  assert.equal(classifyPracticeAnswer(zero, '0').correct, true);
});
test('every prerequisite resolves and original-bank metadata is bounded', () => {
  for (const node of CONCEPT_GRAPH) for (const id of node.prerequisites) assert.ok(CONCEPT_GRAPH.some(n => n.id === id), id);
  for (const question of LEARNING_QUESTIONS) { assert.ok(question.marks > 0); assert.ok(question.estimatedSeconds > 0); assert.equal(question.source, 'VertexED original'); }
});
test('no evidence stays unassessed; errors become weak; repeated answers alone never imply mastery', () => {
  assert.ok(buildKnowledgeModel([], now).every(n => n.status === 'unassessed' && n.accuracy === null));
  const id = q.conceptIds[0];
  assert.equal(buildKnowledgeModel([attempt(1)], now).find(n => n.id === id).status, 'developing');
  assert.equal(buildKnowledgeModel([attempt(1), attempt(2)], now).find(n => n.id === id).status, 'weak');
  const repeated = buildKnowledgeModel([attempt(1, true), attempt(2, true), attempt(3, true)], now).find(n => n.id === id);
  assert.equal(repeated.status, 'developing'); assert.equal(repeated.reviewDue, false);
});
test('assisted answers and elapsed review intervals remain explicit', () => {
  const node = buildKnowledgeModel([attempt(3, true, { hinted: true })], now).find(n => n.id === q.conceptIds[0]);
  assert.equal(node.independentCorrect, 0); assert.equal(node.reviewDue, true); assert.equal(node.intervalDays, 1);
});
test('API recalculates correct status instead of trusting client scores; invalid records fail closed', () => {
  assert.equal(normalisePracticeAttempt({ ...attempt(1), correct: true }).correct, false);
  assert.equal(normalisePracticeAttempt(attempt(1, false, { confidence: 6 })), null);
  assert.equal(normalisePracticeAttempt(attempt(1, false, { seconds: -1 })), null);
  const record = normalizeLearnerStateItem({ stateType: 'practice_attempt', stateKey: attempt(1).id, payload: { ...attempt(1), correct: true }, clientRevision: 'state:1790000000000:abcdefgh', clientUpdatedAt: '2026-09-21T12:00:00Z' });
  assert.equal(record.payload.correct, false);
  assert.equal(normalizeLearnerStateItem({ ...record, stateKey: 'different' }), null);
});
test('local records preserve corrupt data and merge idempotent retries without duplicates', () => {
  assert.throws(() => parseLearningRecords('[{}]', 'practice_attempt'), /preserved/);
  const a = normalisePracticeAttempt(attempt(1));
  assert.equal(mergeLearningRecord([a], a, 'practice_attempt').length, 1);
});
test('diagnostic scope honours subject, curriculum and exhausted pools', () => {
  const selected = selectLearningQuestion({ subject: 'Physics', mode: 'diagnostic' });
  assert.equal(selected.subject, 'Physics');
  assert.equal(selectLearningQuestion({ curriculum: 'nonexistent' }), null);
  assert.equal(selectLearningQuestion({ exclude: LEARNING_QUESTIONS.map(q => q.id) }), null);
});
test('Today budgets tasks, exposes backlog and explains entered exam proximity', () => {
  const plan = buildLearningPlan({ now, minutes: 25, attempts: [attempt(1), attempt(2)], exams: [{ subject: 'Physics', date: '2026-09-26' }], tasks: [{ id: 'overdue', title: 'Assignment', date: '2026-09-19', minutes: 20 }] });
  assert.equal(plan.planned[0].title, 'Assignment'); assert.ok(plan.plannedMinutes <= 25);
  assert.match(plan.planned[0].reason, /Overdue/); assert.ok(plan.backlog.some(i => /assessment in/.test(i.reason)));
  assert.equal(buildLearningPlan({ now, minutes: 10 }).planned[0].id, 'diagnostic');
  assert.ok(buildLearningPlan({ now, minutes: 10 }).planned.every(i => !/weakest/.test(i.reason)));
});
test('all seven tutor modes enforce interaction rules even without page context', () => {
  for (const mode of TUTOR_MODES) {
    const messages = buildAskMessages({ question: 'Help', learningMode: mode.id });
    assert.equal(messages[0].role, 'system'); assert.ok(messages[0].content.includes(mode.instruction));
    assert.equal(messages.at(-1).content, 'Help');
  }
  assert.match(buildAskMessages({ question: 'Help', learningMode: 'injected-mode' })[0].content, /Teach in small steps/);
});
test('number game merges a tile once and never spawns on a full board', () => {
  const board = [2,2,2,2,...Array(12).fill(0)]; const result = slideTiles(board,'left');
  assert.deepEqual(result.board.slice(0,4),[4,4,0,0]); assert.equal(result.score,8); assert.equal(board[0],2);
  assert.deepEqual(addTile(Array(16).fill(2)), Array(16).fill(2));
});
