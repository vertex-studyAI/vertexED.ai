import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS, PRACTICE_TIME_BUDGETS, buildLearningPlan, selectLearningQuestion } from '../src/lib/learningModel.mjs';
import { fitPracticeQuestions } from '../src/lib/learningJourney.mjs';

const NOW = Date.parse('2026-11-14T06:00:00Z');
// Revisions are synthetic fixtures, not subject-publication approvals.
const revision = q => ({ ...q,
  contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` });
const long = revision(LEARNING_QUESTIONS.find(q => q.id === 'math-integration-01'));
const short = revision(LEARNING_QUESTIONS.find(q => q.id === 'math-modulus-01'));
const longTask = { id: 'long-task', title: 'Extended assignment', date: '2026-11-14', minutes: 120 };
const plan = (questions, options = {}) => buildLearningPlan({ questions, now: NOW,
  subjects: ['Mathematics'], minutes: 15, ...options });

function execute(action, questions) {
  const url = new URL(action.to, 'https://example.test');
  assert.equal(url.pathname, '/learn');
  const minutes = Number(url.searchParams.get('minutes'));
  assert.ok(PRACTICE_TIME_BUDGETS.includes(minutes), `The practice page must accept the ${minutes}-minute link`);
  assert.equal(minutes, action.minutes, 'The action label and launched budget must agree');
  const ids = fitPracticeQuestions({ minutes, select: exclude => selectLearningQuestion({
    questions, subject: url.searchParams.get('subject') || '',
    concept: url.searchParams.get('concept') || '',
    mode: url.searchParams.get('mode') || 'diagnostic', exclude, now: NOW,
  }) });
  assert.ok(ids.length, 'The recommendation must launch at least one fitting question');
  const seconds = ids.reduce((sum, id) => sum + questions.find(q => q.id === id).estimatedSeconds + 60, 0);
  assert.ok(seconds <= action.minutes * 60, 'Include feedback time in the displayed budget');
  return ids;
}

test('a six-minute question is given a usable slot when a scheduled task is too long', () => {
  assert.equal(long.estimatedSeconds + 60, 360);
  const result = plan([long], { tasks: [longTask] });
  assert.equal(result.planned[0].id, 'quick-diagnostic');
  assert.deepEqual(execute(result.planned[0], [long]), [long.id]);
  assert.equal(result.planned[0].minutes, 10);
  assert.equal(result.backlog[0].id, 'task:long-task');
});

test('the shortest feasible fallback is selected even when a longer item comes first', () => {
  const questions = [long, short];
  const result = plan(questions, { tasks: [longTask] });
  assert.equal(result.planned[0].minutes, 5);
  assert.deepEqual(execute(result.planned[0], questions), [short.id]);
});

test('a five-minute plan does not promise a diagnostic that needs six minutes', () => {
  for (const tasks of [[], [longTask]]) {
    const result = plan([long], { minutes: 5, tasks });
    assert.equal(result.planned.filter(item => item.kind === 'diagnostic').length, 0);
    assert.equal(result.plannedMinutes, 0);
  }
});

test('a starting diagnostic selects a supported subject from the learner’s chosen list', () => {
  const result = plan([long], { subjects: ['Biology', 'Mathematics'] });
  assert.deepEqual(execute(result.planned[0], [long]), [long.id]);
});

test('concept actions outside today’s budget still link to a valid practice duration', () => {
  const attempt = { id: 'attempt:budget-fixture-001', questionId: long.id,
    contentRevision: long.contentRevision, answer: '-123456', confidence: null,
    hinted: false, seconds: 30, at: '2026-11-13T12:00:00Z', mode: 'mixed' };
  const result = plan([long], { minutes: 5, attempts: [attempt] });
  assert.equal(result.plannedMinutes, 0);
  assert.ok(result.backlog.some(item => item.kind === 'concept'));
  for (const item of result.backlog.filter(item => item.kind === 'concept')) execute(item, [long]);
});

test('every proposed diagnostic fits its displayed budget across the Today availability controls', () => {
  for (const minutes of [5, 10, 15, 25, 30, 45, 60, 90, 120, 180, 240, 480]) {
    for (const questions of [[short], [long], [long, short]]) {
      for (const tasks of [[], [{ ...longTask, minutes: 600 }]]) {
        const result = plan(questions, { minutes, tasks });
        assert.ok(result.plannedMinutes <= minutes);
        for (const item of result.planned.filter(item => item.kind === 'diagnostic')) execute(item, questions);
      }
    }
  }
});

test('empty or unsupported banks retain the course-materials alternative', () => {
  for (const options of [{ questions: [] }, { questions: [short], subjects: ['Biology'] }]) {
    const result = buildLearningPlan({ now: NOW, minutes: 5, ...options });
    assert.equal(result.planned[0].kind, 'source');
    assert.equal(result.planned[0].to, '/study-notebook?start=1');
  }
});
