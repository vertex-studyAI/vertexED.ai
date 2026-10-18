import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fitPracticeQuestions, buildMistakeNotebook as mistakeNotebook, prerequisitePath, reviewBucket, practiceHint, sessionEvidenceChanges as evidenceChanges } from '../src/lib/learningJourney.mjs';
import { LEARNING_QUESTIONS, CONCEPT_GRAPH, buildLearningPlan as buildPlan, buildKnowledgeModel as buildModel, selectLearningQuestion } from '../src/lib/learningModel.mjs';
import { COMPLEX_NUMBERS_PRACTICE } from '../src/content/complexNumbersPractice.mjs';
import { parsePracticeSession, advancePracticeSession as advanceSession } from '../src/lib/practiceSession.mjs';
const at = '2026-09-21T12:00:00Z';
const questions = LEARNING_QUESTIONS.map(q => ({ ...q, contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` }));
const buildLearningPlan = options => buildPlan({ ...options, questions });
const buildKnowledgeModel = values => buildModel(values, Date.now(), questions);
const buildMistakeNotebook = values => mistakeNotebook(values, [], questions);
const sessionEvidenceChanges = (session, values) => evidenceChanges(session, values, questions);
const advancePracticeSession = (session, values) => advanceSession(session, values, { questions });
const attempt = (id, answer, patch = {}) => ({ id: 'attempt:journey-' + id, questionId: 'math-modulus-01', answer, confidence: null, hinted: false, seconds: 45, at, mode: 'diagnostic', ...patch, contentRevision: questions.find(q => q.id === (patch.questionId || 'math-modulus-01')).contentRevision });

test('all quick budgets yield a bounded original diagnostic, without invented history', () => {
  for (const minutes of [5, 15, 30, 60]) {
    const plan = buildLearningPlan({ minutes });
    assert.ok(plan.planned.length > 0);
    assert.ok(plan.plannedMinutes <= minutes);
    assert.ok(plan.model.every(n => n.attempts === 0 && n.accuracy === null));
    const ids = fitPracticeQuestions({ minutes, select: exclude => selectLearningQuestion({ exclude }) });
    assert.ok(ids.length);
    assert.ok(ids.reduce((n, id) => n + LEARNING_QUESTIONS.find(q => q.id === id).estimatedSeconds + 60, 0) <= minutes * 60);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('mistake notebook derives real errors, retains original responses and distinguishes assisted repair', () => {
  const first = attempt('00000001', '7');
  const correction = attempt('00000002', '5', { hinted: true, at: '2026-09-21T13:00:00Z' });
  const rows = buildMistakeNotebook([correction, first]);
  assert.equal(rows.length, 1); assert.equal(rows[0].errors.length, 1);
  assert.equal(rows[0].lastError.answer, '7');
  assert.match(rows[0].recovery, /with help/);
  const later = attempt('00000003', '5', { at: '2026-09-22T13:00:00Z' });
  assert.match(buildMistakeNotebook([first, correction, later])[0].recovery, /unassisted/);
  assert.deepEqual(buildMistakeNotebook([]), []);
});

test('course path puts every known prerequisite before its dependants', () => {
  const path = prerequisitePath(CONCEPT_GRAPH);
  for (const node of path) for (const id of node.prerequisites) assert.ok(path.findIndex(n => n.id === id) < path.indexOf(node));
});

test('review groups use local calendar boundaries, not elapsed 24-hour blocks', () => {
  const now = new Date(2026, 8, 27, 12);
  assert.equal(reviewBucket(new Date(2026, 8, 26, 23).getTime(), now), 'Overdue');
  assert.equal(reviewBucket(new Date(2026, 8, 27, 23).getTime(), now), 'Due today');
  assert.equal(reviewBucket(new Date(2026, 8, 28).getTime(), now), 'Upcoming');
  assert.equal(reviewBucket(null, now), 'Not scheduled');
});

test('complex-number answer keys agree with independent mathematical calculations', () => {
  const expected = [Math.hypot(3, 4), Math.hypot(-5, 12), Math.atan2(1, 1) * 180 / Math.PI, Math.atan2(1, -1) * 180 / Math.PI, 2 * Math.cos(Math.PI / 3), 4 * Math.sin(Math.PI / 6), 2 ** 3, 2 * 40, 360 / 5, 360 / 8];
  COMPLEX_NUMBERS_PRACTICE.forEach((q, i) => { assert.ok(Math.abs(q.answer.value - expected[i]) < 1e-9); assert.equal(q.hints.length, 2); assert.notEqual(practiceHint(q, 1), q.solution.join('\n\n')); });
});

test('new coverage can support evidence across questions and days without counting assisted corrections', () => {
  const attempts = [attempt('00000001', '5'), attempt('00000002', '13', { questionId: 'math-modulus-02', at: '2026-09-22T12:00:00Z' }), attempt('00000003', '5', { at: '2026-09-23T12:00:00Z' })];
  assert.equal(buildKnowledgeModel(attempts).find(n => n.label === 'modulus').status, 'mastered');
  assert.notEqual(buildKnowledgeModel(attempts.map(a => ({ ...a, hinted: true }))).find(n => n.label === 'modulus').status, 'mastered');
});

test('mastery counts UTC days consistently across timestamp offsets without rewriting history', () => {
  const attempts = [
    attempt('utcday001', '5', { at: '2026-09-21T23:00:00-02:00' }),
    attempt('utcday002', '13', { questionId: 'math-modulus-02', at: '2026-09-22T01:30:00Z' }),
    attempt('utcday003', '5', { at: '2026-09-22T03:00:00+01:00' }),
  ];
  const original = JSON.stringify(attempts);
  const node = buildKnowledgeModel(attempts).find(n => n.label === 'modulus');
  const canonical = buildKnowledgeModel(attempts.map(a => ({ ...a, at: new Date(a.at).toISOString() }))).find(n => n.label === 'modulus');
  assert.equal(node.independentCorrect, 3);
  assert.equal(node.distinctQuestions, 2);
  assert.equal(node.status, 'developing', 'three successes on one UTC day do not establish multi-day mastery');
  assert.deepEqual({ ...node, lastAt: canonical.lastAt }, canonical);
  assert.equal(node.lastAt, attempts[2].at);
  assert.equal(JSON.stringify(attempts), original);
});

test('mastery and review interval use the latest instant when local dates sort differently', () => {
  const attempts = [
    attempt('recent001', '5', { at: '2026-09-19T12:00:00Z' }),
    attempt('recent002', '13', { questionId: 'math-modulus-02', at: '2026-09-20T12:00:00Z' }),
    attempt('recent003', '5', { at: '2026-09-22T01:30:00+02:00' }),
    attempt('recent004', '7', { at: '2026-09-21T23:45:00Z' }),
  ];
  const original = JSON.stringify(attempts);
  const node = buildKnowledgeModel(attempts).find(n => n.label === 'modulus');
  const canonical = buildKnowledgeModel(attempts.map(a => ({ ...a, at: new Date(a.at).toISOString() }))).find(n => n.label === 'modulus');
  assert.equal(node.status, 'developing', 'the most recent wrong answer prevents a mastered state');
  assert.equal(node.lastAt, attempts[3].at);
  assert.equal(node.intervalDays, 1);
  assert.equal(node.dueAt, Date.parse(attempts[3].at) + 86400000);
  assert.deepEqual({ ...node, lastAt: canonical.lastAt }, canonical);
  assert.equal(JSON.stringify(attempts), original);
});

test('mistake order and recovery follow timestamp instants across offsets', () => {
  const error = attempt('offset001', '7', { at: '2026-09-22T01:30:00+02:00' });
  const correction = attempt('offset002', '5', { at: '2026-09-21T23:45:00Z' });
  const otherError = attempt('offset003', '9', { questionId: 'math-modulus-02', at: '2026-09-21T23:40:00Z' });
  const attempts = [correction, error, otherError];
  const original = JSON.stringify(attempts);
  const rows = buildMistakeNotebook(attempts);
  assert.deepEqual(rows.map(row => row.question.id), ['math-modulus-02', 'math-modulus-01']);
  const recovered = rows[1];
  assert.deepEqual(recovered.history.map(row => row.id), [error.id, correction.id]);
  assert.equal(recovered.lastError.at, error.at);
  assert.equal(recovered.recovery, 'Correct on a later unassisted attempt');
  assert.equal(JSON.stringify(attempts), original);
});

test('an equivalent timestamp spelling is not a later mistake correction', () => {
  const error = attempt('sameat001', '7', { at: '2026-09-21T23:30:00Z' });
  const correction = attempt('sameat002', '5', { at: '2026-09-22T01:30:00+02:00' });
  assert.equal(Date.parse(error.at), Date.parse(correction.at));
  assert.equal(buildMistakeNotebook([error, correction])[0].recovery, 'Ready to revisit');
});

test('nullable confidence and progressive help reload, but inconsistent help fails closed', () => {
  const q = LEARNING_QUESTIONS[0];
  const s = { id: 'journey-session-01', ids: [q.id], index: 0, mode: 'diagnostic', startedAt: 1, deadline: null, finished: false, subject: q.subject, topic: '', concept: '', curriculum: '', budgetMinutes: 5, responses: { [q.id]: { answer: '', confidence: null, hinted: true, hintLevel: 2, seconds: 0, flagged: false } } };
  assert.deepEqual(parsePracticeSession(JSON.stringify(s)), s);
  s.responses[q.id].hinted = false;
  assert.throws(() => parsePracticeSession(JSON.stringify(s)), /preserved/);
});

test('adaptation never increases the reserved duration of a budgeted question', () => {
  const ids = fitPracticeQuestions({ minutes: 15, select: exclude => selectLearningQuestion({ subject: 'Mathematics', exclude }) });
  const s = { id: 'journey-session-02', ids, contentRevisions: Object.fromEntries(ids.map(id => [id, questions.find(q => q.id === id).contentRevision])), index: 0, mode: 'diagnostic', startedAt: 1, deadline: null, finished: false, subject: 'Mathematics', topic: '', concept: '', curriculum: '', budgetMinutes: 15, responses: {} };
  const next = advancePracticeSession(s, [attempt('00000001', '5')]);
  const duration = list => list.reduce((n, id) => n + LEARNING_QUESTIONS.find(q => q.id === id).estimatedSeconds, 0);
  assert.ok(duration(next.ids) <= duration(s.ids));
});

test('session evidence excludes later corrections and unrelated concurrent attempts', () => {
  const original = attempt('00000001', '7');
  const correction = attempt('00000002', '5', { hinted: true, at: '2026-09-22T12:00:00Z' });
  const unrelated = attempt('00000003', '13', { questionId: 'math-modulus-02', at: '2026-09-23T12:00:00Z' });
  const session = { startedAt: Date.parse(at) - 1000, responses: { 'math-modulus-01': { submitted: original.id } } };
  const changes = sessionEvidenceChanges(session, [original, correction, unrelated]);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].attempts, 1);
  assert.equal(changes[0].accuracy, 0);
  assert.equal(changes[0].previousStatus, 'unassessed');
});

test('a five-minute window still offers practice when a scheduled task is too long', () => {
  const plan = buildLearningPlan({ minutes: 5, now: Date.parse(at), subjects: ['Physics'], tasks: [{ id: 'long', title: 'Essay', date: '2026-09-21', minutes: 60 }] });
  assert.equal(plan.planned.length, 1); assert.equal(plan.planned[0].kind, 'diagnostic');
  assert.equal(plan.backlog[0].minutes, 60);
});

test('unsupported subjects lead to course materials instead of an empty diagnostic', () => {
  const plan = buildLearningPlan({ minutes: 5, subjects: ['Biology'] });
  assert.equal(plan.planned[0].kind, 'source');
  assert.equal(plan.planned[0].to, '/study-notebook?start=1');
});
