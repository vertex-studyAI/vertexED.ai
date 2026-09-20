import assert from 'node:assert/strict';
import test from 'node:test';

import { EXAM_DRILLS } from '../src/content/examPractice.ts';
import {
  baselineNextAction,
  createBaselineAttempt,
  normalizeBaselineAttempt,
  parseBaselineTopics,
  selectBaselineDrills,
  summarizeBaselineAttempt,
} from '../src/lib/examBaselineCore.mjs';

test('baseline selection is fixed-size, subject/programme scoped, and topic-aware', () => {
  const drills = selectBaselineDrills({
    drills: EXAM_DRILLS,
    programme: 'IB MYP',
    subject: 'Chemistry',
    topics: parseBaselineTopics('Environmental chemistry, Reaction rates'),
  });
  assert.equal(drills.length, 3);
  assert.ok(drills.every((drill) => drill.programme === 'IB MYP' && drill.subject === 'Chemistry'));
  assert.equal(new Set(drills.map((drill) => drill.id)).size, 3);
  assert.ok(drills.some((drill) => drill.topic === 'Environmental chemistry'));
});

test('unsupported subject does not silently fall through to unrelated baseline content', () => {
  assert.deepEqual(selectBaselineDrills({
    drills: EXAM_DRILLS,
    programme: 'IB DP',
    subject: 'Physics',
    topics: [],
  }), []);
});

test('account/subject identity mismatch invalidates retained diagnostic state', () => {
  const attempt = createBaselineAttempt(['a', 'b', 'c'], { subject: 'Chemistry', programme: 'IB MYP' });
  assert.ok(normalizeBaselineAttempt(attempt, { subject: 'Chemistry', programme: 'IB MYP' }));
  assert.equal(normalizeBaselineAttempt(attempt, { subject: 'Physics', programme: 'IB MYP' }), null);
});

test('unsure, skipped, and attempted-incorrect evidence remain distinct', () => {
  const attempt = createBaselineAttempt(['a', 'b', 'c'], { subject: 'Chemistry', programme: 'IB MYP' });
  attempt.responses.a = { answer: 'attempt', attemptState: 'attempted', selfCheck: 'needs-review', revealed: true };
  attempt.responses.b = { answer: '', attemptState: 'unsure', selfCheck: 'demonstrated-here', revealed: false };
  attempt.responses.c = { answer: '', attemptState: 'skipped', selfCheck: 'some-evidence', revealed: false };

  const normalized = normalizeBaselineAttempt(attempt, { subject: 'Chemistry', programme: 'IB MYP' });
  assert.equal(normalized.responses.a.selfCheck, 'needs-review');
  assert.equal(normalized.responses.b.selfCheck, null);
  assert.equal(normalized.responses.c.selfCheck, null);

  const summary = summarizeBaselineAttempt(normalized);
  assert.equal(summary.label, 'Needs review');
  assert.equal(summary.attempted, 1);
  assert.equal(summary.unsure, 1);
  assert.equal(summary.skipped, 1);
  assert.equal(summary.counts['needs-review'], 1);
  assert.equal(baselineNextAction(normalized), 'Open focused practice and repair the question you marked needs review.');
});

test('bounded summary never emits a grade or mastery prediction', () => {
  const attempt = createBaselineAttempt(['a', 'b', 'c'], { subject: 'Chemistry', programme: 'IB MYP' });
  for (const id of attempt.drillIds) {
    attempt.responses[id] = { answer: 'response', attemptState: 'attempted', selfCheck: 'demonstrated-here', revealed: true };
  }
  const summary = summarizeBaselineAttempt(attempt);
  assert.equal(summary.label, 'Some evidence');
  assert.doesNotMatch(JSON.stringify(summary), /grade|mastery|predicted/i);
});
