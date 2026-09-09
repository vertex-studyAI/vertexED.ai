import assert from 'node:assert/strict';
import test from 'node:test';

import {
  minutesToTime12,
  normalizePlannerRequest,
  normalizePlannerTask,
  timeToMinutes,
} from '../api/_lib/plannerContract.js';

test('planner request contract bounds prompts, arrays, and existing-task fields', () => {
  const parsed = normalizePlannerRequest({
    prompt: 'Review biology',
    tags: ['Biology', 'Biology'],
    existingTasks: [{
      id: 'not-forwarded',
      'task name': 'Chemistry',
      date: '09/06/2026',
      'start time': '4:15 PM',
      'task duration': 45,
      private: 'not-forwarded',
    }],
  });
  assert.deepEqual(parsed, {
    mode: 'single',
    prompt: 'Review biology',
    tags: ['Biology'],
    existingTasks: [{
      'task name': 'Chemistry',
      date: '09/06/2026',
      'start time': '04:15 PM',
      'task duration': 45,
    }],
  });
  assert.equal(normalizePlannerRequest({ prompt: 'x'.repeat(2_001) }), null);
  assert.equal(normalizePlannerRequest({ prompt: 'Study', unexpected: true }), null);
  assert.equal(normalizePlannerRequest({ mode: 'week', weaknesses: [], subjects: [], examDaysLeft: -1, existingTasks: [] }), null);
});

test('planner output rejects impossible dates and times and derives its own end time', () => {
  assert.equal(timeToMinutes('12:00 AM'), 0);
  assert.equal(timeToMinutes('12:00 PM'), 720);
  assert.equal(minutesToTime12(1_455), '12:15 AM');
  assert.equal(normalizePlannerTask({ 'task name': 'Bad', date: '02/30/2026', 'start time': '10:00 AM', 'task duration': 30 }), null);
  assert.equal(normalizePlannerTask({ 'task name': 'Bad', date: '09/06/2026', 'start time': '25:00 PM', 'task duration': 30 }), null);
  assert.deepEqual(normalizePlannerTask({
    'task name': 'Math practice',
    date: '09/06/2026',
    'start time': '11:45 PM',
    'task duration': 30,
    'end time': 'wrong and ignored',
    tag: 'Math',
  }, { allowedTags: ['Math'] }), {
    'task name': 'Math practice',
    date: '09/06/2026',
    'start time': '11:45 PM',
    'task duration': 30,
    'end time': '12:15 AM',
    tag: 'Math',
  });
});
