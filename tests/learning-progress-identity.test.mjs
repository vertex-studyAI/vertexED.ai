import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS, normalisePracticeAttempt, practiceProgressSummary, verifiedPracticeHistory } from '../src/lib/learningModel.mjs';

const NOW = Date.parse('2026-11-15T12:00:00Z');
// Synthetic revisions verify storage projections, not curriculum approval.
const questions = LEARNING_QUESTIONS.map(q => ({ ...q,
  contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` }));
const question = questions.find(q => q.id === 'math-modulus-01');
const attempt = (id, patch = {}) => ({ id: `attempt:progress-${id}`, questionId: question.id,
  contentRevision: question.contentRevision, answer: String(question.answer.value),
  confidence: 4, hinted: false, seconds: 30, at: '2026-11-14T12:00:00Z', mode: 'mixed', ...patch });
const progress = (rows, options = {}) => practiceProgressSummary(rows, { now: NOW, questions, ...options });
const orders = rows => rows.length < 2 ? [rows] : rows.flatMap((row, i) =>
  orders(rows.filter((_other, j) => j !== i)).map(tail => [row, ...tail]));

test('copied saved records cannot inflate attempt, accuracy or time totals', () => {
  const row = attempt('copies-001');
  for (const copies of [2, 5, 10]) {
    const rows = Array.from({ length: copies }, () => ({ ...row }));
    const original = JSON.stringify(rows);
    const summary = progress(rows);
    assert.equal(summary.attemptCount, 1);
    assert.equal(summary.checkedAttempts.length, 1);
    assert.equal(summary.checkedAttempts.filter(a => a.correct).length, 1);
    assert.equal(summary.seconds, 30);
    assert.equal(summary.awaitingReviewCount, 0);
    assert.equal(JSON.stringify(rows), original);
  }
});

test('equal-time conflicting copies count as one held attempt with no checked answer or time', () => {
  const good = attempt('conflict-1');
  for (const patch of [{ answer: '7' }, { seconds: 90 }, { hinted: true }, { confidence: 1 }]) {
    for (const rows of orders([good, { ...good, ...patch }, { ...good }])) {
      const summary = progress(rows);
      assert.equal(summary.attemptCount, 1);
      assert.equal(summary.checkedAttempts.length, 0);
      assert.equal(summary.seconds, 0);
      assert.equal(summary.awaitingReviewCount, 1);
      assert.deepEqual(summary.conflictingIds, [good.id]);
    }
  }
});

test('the newest version governs totals independently of saved array order', () => {
  const older = attempt('updated-01');
  const newer = { ...older, answer: '7', seconds: 45, at: '2026-11-15T11:00:00Z' };
  for (const rows of orders([older, newer, { ...older }])) {
    const summary = progress(rows);
    assert.equal(summary.attemptCount, 1);
    assert.equal(summary.checkedAttempts.length, 1);
    assert.equal(summary.checkedAttempts[0].correct, false);
    assert.equal(summary.seconds, 45);
  }
});

test('a newest held version does not revive the older answer-key check', () => {
  const older = attempt('held-0001');
  const latest = { ...older, contentRevision: undefined, at: '2026-11-15T11:00:00Z' };
  for (const rows of [[older, latest], [latest, older]]) {
    const summary = progress(rows);
    assert.equal(summary.attemptCount, 1);
    assert.equal(summary.checkedAttempts.length, 0);
    assert.equal(summary.awaitingReviewCount, 1);
    assert.equal(summary.seconds, 30, 'Unambiguous recorded time is independent of content approval');
    assert.deepEqual(summary.conflictingIds, []);
  }
});

test('real repeated attempts retain distinct counts, outcomes and recorded time', () => {
  const rows = [attempt('distinct1'), attempt('distinct2', { answer: '7', seconds: 70 })];
  const summary = progress(rows);
  assert.equal(summary.attemptCount, 2);
  assert.equal(summary.checkedAttempts.length, 2);
  assert.equal(summary.checkedAttempts.filter(a => a.correct).length, 1);
  assert.equal(summary.seconds, 100);
});

test('date windows use latest instants and keep the exact cutoff inclusive', () => {
  const cutoff = new Date(NOW - 7 * 86400000).toISOString();
  const boundary = attempt('boundary1', { at: cutoff });
  const excluded = attempt('excluded1', { at: new Date(Date.parse(cutoff) - 1).toISOString() });
  const stale = attempt('revised01', { at: '2026-11-01T12:00:00Z' });
  const latest = { ...stale, at: '2026-11-14T12:00:00Z', seconds: 60 };
  const summary = progress([boundary, excluded, stale, latest], { days: 7 });
  assert.equal(summary.attemptCount, 2);
  assert.equal(summary.seconds, 90);
  assert.equal(progress([boundary, excluded, stale, latest]).attemptCount, 3);
});

test('future and invalid copies do not replace the current valid observation', () => {
  const row = attempt('future001');
  const rows = [row, { ...row, at: new Date(NOW + 1000).toISOString(), answer: '7' },
    { ...row, seconds: -10 }, { ...row, at: 'invalid' }];
  assert.deepEqual(progress(rows), progress([row]));
  assert.equal(progress([row], { now: NaN }).attemptCount, 0);
});

test('already assessed records and timezone spellings follow the model identity contract', () => {
  const row = attempt('timezone1');
  const copy = { ...row, at: '2026-11-14T17:30:00+05:30', correct: false,
    recordedResult: { correct: false }, sourceNote: 'Keep this metadata' };
  for (const rows of [[row, copy], [copy, row]]) {
    const assessed = rows.map(value => normalisePracticeAttempt(value, { questions }));
    const before = JSON.stringify(assessed);
    const summary = progress(assessed);
    assert.equal(summary.attemptCount, 1);
    assert.equal(summary.seconds, 30);
    assert.deepEqual(summary.checkedAttempts, verifiedPracticeHistory(assessed, NOW, questions));
    assert.equal(JSON.stringify(assessed), before);
  }
});

test('empty progress does not manufacture an activity or accuracy value', () => {
  assert.deepEqual(progress([]), { attemptCount: 0, checkedAttempts: [], awaitingReviewCount: 0,
    seconds: 0, conflictingIds: [] });
});
