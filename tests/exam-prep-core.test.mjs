import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildExamSession,
  chooseExamMission,
  getExamPrepPhase,
  summarizePreparationEvidence,
  examDayKey,
  examSessionKey,
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
    pendingMock: { status: 'awaiting_review', subject: 'Biology', paperTitle: 'Biology mock', answered: 8, total: 10 },
    dueRetry: { id: 'retry-1', topic: 'Cell transport', subject: 'Biology' },
    dueCards: 20,
    subject: 'Biology',
  });
  assert.equal(mission.kind, 'review-mock');
  assert.match(mission.title, /Biology mock/);
});

test('recommendations never borrow evidence from another subject or an unknown mock subject', () => {
  for (const mockSubject of ['Chemistry', undefined]) {
    const mission = chooseExamMission({
      subject: 'Biology',
      pendingMock: { subject: mockSubject, status: 'awaiting_review' },
      dueRetry: { subject: 'Chemistry', topic: 'Bonding', id: 'chemistry' },
      weakestTopic: { subject: 'Physics', topic: 'Forces', avgPercent: 20 },
    });
    assert.equal(mission.kind, 'practice');
  }
  assert.equal(chooseExamMission({ subject: ' biology ', dueRetry: { subject: 'Biology', topic: 'Cells', id: 'cells' } }).kind, 'retry');
});

test('diagnostic is opt-in and explicit choices override recommendations', () => {
  const evidence = { subject: 'Biology', dueRetry: { subject: 'Biology', topic: 'Cells', id: 'cells' } };
  for (const mode of ['practice', 'revision', 'diagnostic']) {
    assert.equal(chooseExamMission({ ...evidence, mode }).kind, mode);
  }
  assert.equal(chooseExamMission({ subject: 'Biology' }).kind, 'practice');
  assert.match(chooseExamMission({ subject: 'Biology', dueCards: 3 }).detail, /mixed-subject/);
});

test('completion identity changes with the day, subject, duration or retry', () => {
  const base = { day: '2026-09-08', subject: 'Biology', minutes: 25, mission: { kind: 'retry', title: 'Retry cells', retryId: 'one' } };
  const key = examSessionKey(base);
  for (const change of [{ day: '2026-09-09' }, { subject: 'Chemistry' }, { minutes: 45 }, { mission: { ...base.mission, retryId: 'two' } }]) {
    assert.notEqual(examSessionKey({ ...base, ...change }), key);
  }
  assert.equal(examDayKey(new Date(2026, 8, 8, 23, 59)), '2026-09-08');
  assert.equal(examDayKey(new Date(2026, 8, 9, 0, 0)), '2026-09-09');
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
