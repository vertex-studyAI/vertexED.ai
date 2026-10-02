import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleRevisionRetry, rankWeakTopics, deriveRevisionQueue } from '../src/lib/revisionEvidence.mjs';
const now = Date.parse('2026-10-02T10:00:00Z');
const schedule = { intervalStep: 0, dueAt: '2026-10-02T00:00:00Z', attemptRefs: ['original'] };
const attempt = (n, overrides = {}) => ({ id: `a${n}`, topicId: 'complex', topicLabel: 'Complex numbers',
  sessionId: `s${n % 2}`, questionId: `q${n % 2}`, evidenceState: 'verified_incorrect',
  at: '2026-10-01T00:00:00Z', ...overrides });
test('successful retries follow the whole ladder and remain at thirty days', () => {
  let current = schedule;
  for (const days of [3, 7, 14, 30, 30]) {
    current = scheduleRevisionRetry(current, 'verified_correct', now);
    assert.equal(Date.parse(current.dueAt) - now, days * 86400000);
    assert.deepEqual(current.attemptRefs, ['original']);
  }
  assert.equal(schedule.intervalStep, 0);
});
test('failure resets advanced schedules to one day', () => {
  for (const state of ['verified_incorrect', 'self_checked_incorrect']) {
    const next = scheduleRevisionRetry({ ...schedule, intervalStep: 4 }, state, now);
    assert.equal(next.intervalStep, 0); assert.equal(Date.parse(next.dueAt) - now, 86400000);
  }
});
test('unknown, skipped, and unverified retries leave the schedule unchanged', () => {
  for (const state of ['unknown', 'skipped', 'unverified']) assert.deepEqual(scheduleRevisionRetry(schedule, state, now), schedule);
});
test('self-check success advances a personal interval without upgrading its outcome', () => {
  assert.equal(scheduleRevisionRetry(schedule, 'self_checked_correct', now).lastOutcome, 'self_checked_correct');
});
test('invalid schedule, clock, and evidence fail closed', () => {
  for (const input of [{ ...schedule, intervalStep: 5 }, { ...schedule, dueAt: 'yesterday' }])
    assert.throws(() => scheduleRevisionRetry(input, 'verified_correct', now));
  assert.throws(() => scheduleRevisionRetry(schedule, 'correct', now));
  assert.throws(() => scheduleRevisionRetry(schedule, 'verified_correct', NaN));
});
test('ranking requires a complete scope and all three diversity thresholds', () => {
  const rows = [attempt(1), attempt(2), attempt(3)];
  assert.deepEqual(rankWeakTopics(rows, { now }).ranked, []);
  assert.equal(rankWeakTopics(rows, { now, complete: true }).ranked.length, 1);
  for (const insufficient of [rows.slice(0, 2), rows.map(a => ({ ...a, sessionId: 'one' })), rows.map(a => ({ ...a, questionId: 'one' }))]) {
    const result = rankWeakTopics(insufficient, { now, complete: true });
    assert.equal(result.ranked.length, 0); assert.equal(result.insufficient[0].status, 'Not enough verified attempts');
  }
});
test('verified numerator and denominator exclude self-check and unknown outcomes', () => {
  const rows = [attempt(1), attempt(2), attempt(3, { evidenceState: 'verified_correct' }),
    ...['self_checked_correct', 'self_checked_incorrect', 'unverified', 'unknown', 'skipped'].map((evidenceState, i) => attempt(i + 4, { evidenceState }))];
  const row = rankWeakTopics(rows, { now, complete: true }).ranked[0];
  assert.equal(row.verifiedAttempts, 3); assert.equal(row.verifiedIncorrect, 2);
  assert.equal(row.evidenceLabel, '2 incorrect of 3 verified attempts'); assert.equal(row.errorRate, 2 / 3);
});
test('replayed attempts count once and conflicting identities fail closed', () => {
  const rows = [attempt(1), attempt(2), attempt(3)];
  assert.equal(rankWeakTopics([...rows, { ...rows[0] }], { now, complete: true }).ranked[0].verifiedAttempts, 3);
  assert.throws(() => rankWeakTopics([...rows, { ...rows[0], evidenceState: 'verified_correct' }], { now, complete: true }));
  assert.throws(() => rankWeakTopics([attempt(1, { at: '2027-01-01T00:00:00Z' })], { now, complete: true }));
});
test('weak topics sort by rate, latest failure, then label', () => {
  const topic = (prefix, label, date, correct = false) => [1, 2, 3].map(n => attempt(n, { id: prefix + n, topicId: prefix, topicLabel: label,
    at: date, evidenceState: correct && n === 3 ? 'verified_correct' : 'verified_incorrect' }));
  const rows = [...topic('d', 'Delta', '2026-10-01T01:00:00Z', true), ...topic('b', 'Beta', '2026-10-01T02:00:00Z'),
    ...topic('a', 'Alpha', '2026-10-01T02:00:00Z'), ...topic('c', 'Earlier', '2026-10-01T01:00:00Z')];
  assert.deepEqual(rankWeakTopics(rows, { now, complete: true }).ranked.map(r => r.topicId), ['a', 'b', 'c', 'd']);
});
const entry = (id, overrides = {}) => ({ id, dueAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z', evidenceState: 'self_checked_incorrect', ...overrides });
test('queue respects overdue priority, verification, update recency, stable identity, and due boundary', () => {
  const rows = [entry('b'), entry('a'), entry('verified', { evidenceState: 'verified_incorrect' }),
    entry('oldest', { dueAt: '2026-09-30T00:00:00Z' }), entry('newer', { updatedAt: '2026-10-01T01:00:00Z' }),
    entry('future', { dueAt: '2026-10-03T00:00:00Z' }), entry('boundary', { dueAt: new Date(now).toISOString() })];
  const before = structuredClone(rows);
  assert.deepEqual(deriveRevisionQueue(rows, now).map(r => r.id), ['oldest', 'verified', 'newer', 'a', 'b', 'boundary']);
  assert.deepEqual(rows, before); assert.equal(deriveRevisionQueue(rows, now, 2).length, 2);
});
test('queue is finite and malformed or duplicate entries are rejected', () => {
  assert.equal(deriveRevisionQueue(Array.from({ length: 40 }, (_, i) => entry(String(i))), now).length, 10);
  assert.throws(() => deriveRevisionQueue([entry('a'), entry('a')], now));
  assert.throws(() => deriveRevisionQueue([entry('a', { dueAt: 'bad' })], now));
  for (const limit of [0, 31, 1.5]) assert.throws(() => deriveRevisionQueue([], now, limit));
});
