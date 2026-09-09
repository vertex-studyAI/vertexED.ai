import assert from 'node:assert/strict';
import test from 'node:test';

import {
  completeRetryItem,
  dismissRetryItem,
  dueRetryItems,
  retryDelayDays,
  scheduleMeasuredRetry,
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
