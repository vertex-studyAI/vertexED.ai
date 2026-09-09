import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeExamTargets, nextExamTarget, validExamDate } from '../src/lib/examTargets.mjs';
import { normalizePlannerRequest } from '../api/_lib/plannerContract.js';

test('exam targets reject malformed dates, unknown subjects and duplicate identities', () => {
  const valid = { id: 'one', subject: 'Biology', paper: 'Paper 1', date: '2028-02-29' };
  assert.equal(validExamDate('2026-02-29'), false);
  assert.deepEqual(normalizeExamTargets([valid, valid, { ...valid, id: 'two', subject: 'Math' }, { ...valid, id: 'three', date: '2028-02-30' }, null], ['Biology']), [valid]);
  assert.deepEqual(normalizeExamTargets({}, ['Biology']), []);
});

test('countdown picks next selected-subject paper and only falls back to past after all have passed', () => {
  const targets = [
    { id: 'old', subject: 'Biology', paper: 'Paper 1', date: '2026-09-01' },
    { id: 'next', subject: 'Biology', paper: 'Paper 2', date: '2026-09-10' },
    { id: 'other', subject: 'Math', paper: 'Paper 1', date: '2026-09-09' },
  ];
  assert.equal(nextExamTarget(targets, 'Biology', '2026-09-08').id, 'next');
  assert.equal(nextExamTarget(targets, '', '2026-09-08').id, 'other');
  assert.equal(nextExamTarget(targets, 'Biology', '2026-09-11').id, 'next');
  assert.equal(nextExamTarget(targets, 'Chemistry', '2026-09-08'), null);
});

test('planner accepts bounded paper dates and rejects invalid calendars', () => {
  const examTargets = [{ subject: 'Biology', paper: 'Paper 1', date: '2026-09-10' }];
  assert.deepEqual(normalizePlannerRequest({ mode: 'week', examTargets }).examTargets, examTargets);
  assert.equal(normalizePlannerRequest({ mode: 'week', examTargets: [{ ...examTargets[0], date: '2026-02-30' }] }), null);
});
