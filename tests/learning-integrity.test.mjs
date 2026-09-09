import test from 'node:test';
import assert from 'node:assert/strict';
import { cardsFromFlashcards, mergeReviewCards, repairCardIds } from '../src/lib/spacedRepetition.ts';
import { countRecentAttempts, summarizeMeasuredSubjects } from '../src/lib/progressAnalyticsCore.mjs';

const measurement = (id, topic, score, recordedAt, extra = {}) => ({
  id, topic, score, maxScore: 100, subject: 'Biology', source: 'review', recordedAt,
  evidence: 'measured-v2', verification: { method: 'teacher-confirmed', confirmedAt: recordedAt }, ...extra,
});

test('regeneration preserves other cards and the schedule of unchanged cards', () => {
  const [first] = cardsFromFlashcards([{ front: 'A', back: '1' }], 'topic');
  first.repetitions = 7;
  first.nextReview = '2030-01-01T00:00:00.000Z';
  const next = mergeReviewCards([first], [{ front: 'A', back: '1' }, { front: 'B', back: '2' }, { front: 'B', back: '2' }], 'topic');
  assert.equal(next.length, 2);
  assert.deepEqual(next.find(c => c.front === 'A'), first);
  assert.equal(new Set(next.map(c => c.id)).size, 2);
});

test('different generations and legacy collisions receive distinct identities', () => {
  const first = cardsFromFlashcards([{ front: 'A', back: '1' }], 'same');
  const second = cardsFromFlashcards([{ front: 'B', back: '2' }], 'same');
  assert.notEqual(first[0].id, second[0].id);
  const repaired = repairCardIds([first[0], { ...second[0], id: first[0].id, repetitions: 9 }]);
  assert.equal(new Set(repaired.map(c => c.id)).size, 2);
  assert.equal(repaired[1].repetitions, 9);
  assert.deepEqual(repairCardIds(repaired), repaired);
});

test('weekly activity counts unique attempts in the actual window', () => {
  const now = new Date('2026-09-07T12:00:00Z');
  const rows = [measurement('1', 'A', 50, '2026-09-02T12:00:00Z'), measurement('2', 'B', 60, '2026-08-01T00:00:00Z')];
  assert.equal(countRecentAttempts([...rows, rows[0]], now), 1);
  assert.equal(countRecentAttempts([measurement('3', 'A', 50, '2026-09-03T00:00:00Z', { attemptId: 'review' }), measurement('4', 'B', 60, '2026-09-03T00:00:00Z', { attemptId: 'review' })], now), 1);
});

test('simultaneous different topics cannot imply decline and strong topics count', () => {
  const rows = [20, 30, 40, 90].map((score, i) => measurement(String(i), `Topic ${i}`, score, '2026-09-07T12:00:00Z'));
  assert.deepEqual(summarizeMeasuredSubjects(rows), [{ subject: 'Biology', mastery: 45, attempts: 4, trend: 'unknown' }]);
});

test('subject trend uses repeated comparable topics at different times', () => {
  const rows = [measurement('1', 'Cells', 30, '2026-09-01T00:00:00Z'), measurement('2', 'Cells', 70, '2026-09-07T00:00:00Z')];
  assert.equal(summarizeMeasuredSubjects(rows)[0].trend, 'improving');
  assert.equal(summarizeMeasuredSubjects([...rows].reverse())[0].trend, 'improving');
});
