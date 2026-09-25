import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeRetryItem,
  dismissRetryItem,
  dueRetryItems,
  retryDelayDays,
  scheduleMeasuredRetry,
  summarizeRetryFollowThrough,
} from '../src/lib/retryQueueCore.mjs';
import { MEASURED_WEAKNESS_EVIDENCE } from '../src/lib/weaknessEvidenceCore.mjs';

const measured = {
  topic: 'Quadratic equations',
  subject: 'Mathematics',
  score: 2,
  maxScore: 10,
  source: 'review',
  evidence: MEASURED_WEAKNESS_EVIDENCE,
  recordedAt: '2026-09-06T00:00:00.000Z',
  verification: { method: 'teacher-confirmed', confirmedAt: '2026-09-06T00:00:00.000Z' },
};

test('retry spacing is driven by measured score bands', () => {
  assert.equal(retryDelayDays(20), 1);
  assert.equal(retryDelayDays(55), 3);
  assert.equal(retryDelayDays(85), 7);
});

test('measured attempts schedule and then replace the same topic retry', () => {
  const now = new Date('2026-09-06T00:00:00.000Z');
  const first = scheduleMeasuredRetry([], measured, now);
  assert.equal(first.length, 1);
  assert.equal(first[0].dueAt, '2026-09-07T00:00:00.000Z');
  assert.equal(first[0].history[0].dueAt, first[0].dueAt);

  const second = scheduleMeasuredRetry(first, { ...measured, score: 6 }, now);
  assert.equal(second.length, 1);
  assert.equal(second[0].measuredAttempts, 2);
  assert.equal(second[0].dueAt, '2026-09-09T00:00:00.000Z');
  assert.equal(second[0].status, 'scheduled');
});

test('unverified inputs cannot enter or become due in the retry queue', () => {
  assert.deepEqual(scheduleMeasuredRetry([], { ...measured, evidence: undefined }), []);
  assert.equal(dueRetryItems([{ ...measured, id: 'retry:fake', dueAt: '2020-01-01T00:00:00Z' }]).length, 0);
});

test('retry lifecycle preserves completed and dismissed history without returning it as due', () => {
  const now = new Date('2026-09-06T00:00:00.000Z');
  const [scheduled] = scheduleMeasuredRetry([], measured, now);
  const completed = completeRetryItem([scheduled], scheduled.id, new Date('2026-09-07T00:00:00.000Z'));

  assert.equal(completed[0].status, 'completed');
  assert.equal(completed[0].completedAt, '2026-09-07T00:00:00.000Z');
  assert.equal(dueRetryItems(completed, new Date('2026-09-08T00:00:00.000Z')).length, 0);

  const [rescheduled] = scheduleMeasuredRetry(completed, { ...measured, score: 6 }, now);
  const dismissed = dismissRetryItem([rescheduled], rescheduled.id, new Date('2026-09-08T00:00:00.000Z'));
  assert.equal(dismissed[0].status, 'dismissed');
  assert.equal(dismissed[0].dismissedAt, '2026-09-08T00:00:00.000Z');
  assert.equal(dueRetryItems(dismissed, new Date('2026-09-20T00:00:00.000Z')).length, 0);
});


test('delayed-retry follow-through uses only cycles with retained due-date evidence', () => {
  const start = new Date('2026-09-01T00:00:00.000Z');
  const [scheduled] = scheduleMeasuredRetry([], measured, start);
  const completedAfterDue = completeRetryItem(
    [scheduled],
    scheduled.id,
    new Date('2026-09-03T00:00:00.000Z'),
    70,
  )[0];

  const summary = summarizeRetryFollowThrough([completedAfterDue], new Date('2026-09-04T00:00:00.000Z'));
  assert.equal(summary.maturedCycles, 1);
  assert.equal(summary.completedAfterDue, 1);
  assert.equal(summary.dismissedAfterDue, 0);
  assert.equal(summary.overdueOpen, 0);
  assert.equal(summary.completionRate, 1);
});

test('legacy retry history without dueAt is excluded rather than backfilled or guessed', () => {
  const [scheduled] = scheduleMeasuredRetry([], measured, new Date('2026-09-01T00:00:00.000Z'));
  scheduled.history = [{ status: 'scheduled', at: '2026-09-01T00:00:00.000Z', scorePercent: 20 }];
  const summary = summarizeRetryFollowThrough([scheduled], new Date('2026-09-20T00:00:00.000Z'));
  assert.deepEqual(summary, {
    maturedCycles: 0,
    completedAfterDue: 0,
    dismissedAfterDue: 0,
    overdueOpen: 0,
    completionRate: null,
  });
});

test('open matured retry cycles are counted as overdue follow-through opportunities', () => {
  const [scheduled] = scheduleMeasuredRetry([], measured, new Date('2026-09-01T00:00:00.000Z'));
  const summary = summarizeRetryFollowThrough([scheduled], new Date('2026-09-03T00:00:00.000Z'));
  assert.equal(summary.maturedCycles, 1);
  assert.equal(summary.overdueOpen, 1);
  assert.equal(summary.completedAfterDue, 0);
});
