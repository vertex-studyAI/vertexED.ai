import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildExamSession,
  chooseExamMission,
  getExamPrepPhase,
  summarizePreparationEvidence,
} from '../src/lib/examPrepCore.mjs';

test('exam phase follows the actual countdown boundaries', () => {
  assert.equal(getExamPrepPhase(null), 'setup');
  assert.equal(getExamPrepPhase(60), 'foundation');
  assert.equal(getExamPrepPhase(42), 'build');
  assert.equal(getExamPrepPhase(14), 'simulate');
  assert.equal(getExamPrepPhase(3), 'taper');
  assert.equal(getExamPrepPhase(-1), 'complete');
});

test('a completed mock takes priority over lower-value study tasks', () => {
  const mission = chooseExamMission({
    pendingMock: { status: 'awaiting_review', paperTitle: 'Biology mock', answered: 8, total: 10 },
    dueRetry: { id: 'retry-1', topic: 'Cell transport', subject: 'Biology' },
    dueCards: 20,
    subject: 'Biology',
  });
  assert.equal(mission.kind, 'review-mock');
  assert.match(mission.title, /Biology mock/);
});

test('session blocks add up to the selected session length', () => {
  const blocks = buildExamSession({ minutes: 45, phase: 'simulate', mission: { title: 'Timed questions' } });
  assert.equal(blocks.length, 3);
  assert.equal(blocks.reduce((sum, block) => sum + block.minutes, 0), 45);
  assert.equal(blocks[1].title, 'Timed questions');
});

test('preparation evidence never invents an exam-readiness grade', () => {
  const summary = summarizePreparationEvidence({
    profileReady: true,
    loopSteps: 2,
    measuredTopics: 0,
    reviewedWork: false,
  });
  assert.equal(summary.complete, 2);
  assert.equal(summary.total, 4);
  assert.equal('score' in summary, false);
});
