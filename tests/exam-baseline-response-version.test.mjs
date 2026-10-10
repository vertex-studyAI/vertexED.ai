import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBaselineAttempt, patchBaselineAttemptResponse, summarizeBaselineAttempt, baselineNextAction } from '../src/lib/examBaselineCore.mjs';
const now = '2026-10-01T05:00:00.000Z';
function completeAttempt() {
  const attempt = createBaselineAttempt(['a', 'b', 'c'], { subject: 'Physics', programme: 'IB DP' });
  for (const id of attempt.drillIds) attempt.responses[id] = { answer: 'original response', attemptState: 'attempted', selfCheck: 'demonstrated-here', revealed: true };
  return { ...attempt, completedAt: now };
}
for (const answer of ['revised reasoning', '', '   ']) {
  test(`editing a self-checked response invalidates its evidence and completion (${JSON.stringify(answer)})`, () => {
    const original = completeAttempt();
    const next = patchBaselineAttemptResponse(original, 'a', { answer }, now);
    assert.equal(next.responses.a.selfCheck, null);
    assert.equal(next.completedAt, null);
    assert.equal(next.responses.a.answer, answer);
    assert.equal(original.responses.a.selfCheck, 'demonstrated-here');
    assert.equal(summarizeBaselineAttempt(next).counts['demonstrated-here'], 2);
    assert.equal(summarizeBaselineAttempt(next).unreviewed, 1);
    assert.match(baselineNextAction(next), /fresh self-check/);
  });
}
test('identical text and hiding worked reasoning preserve a valid self-check', () => {
  const original = completeAttempt();
  for (const patch of [{ answer: 'original response' }, { revealed: false }]) {
    const next = patchBaselineAttemptResponse(original, 'a', patch, now);
    assert.equal(next.responses.a.selfCheck, 'demonstrated-here');
    assert.equal(next.completedAt, now);
  }
});
test('a new explicit self-check completes the edited attempt again', () => {
  const edited = patchBaselineAttemptResponse(completeAttempt(), 'a', { answer: 'revised' }, now);
  const next = patchBaselineAttemptResponse(edited, 'a', { selfCheck: 'needs-review' }, now);
  assert.equal(next.completedAt, now);
  assert.equal(summarizeBaselineAttempt(next).unreviewed, 0);
  assert.equal(summarizeBaselineAttempt(next).counts['needs-review'], 1);
});
test('changing the response and a check in one patch cannot preserve stale evidence', () => {
  const next = patchBaselineAttemptResponse(completeAttempt(), 'a', { answer: 'changed', selfCheck: 'demonstrated-here' }, now);
  assert.equal(next.responses.a.selfCheck, null);
});
test('unsure or skipped evidence remains distinct and clears the prior self-check', () => {
  for (const attemptState of ['unsure', 'skipped']) {
    const next = patchBaselineAttemptResponse(completeAttempt(), 'a', { attemptState }, now);
    assert.equal(next.responses.a.selfCheck, null);
    assert.equal(summarizeBaselineAttempt(next)[attemptState], 1);
  }
});
test('unknown response identity changes no attempt', () => {
  const original = completeAttempt();
  assert.equal(patchBaselineAttemptResponse(original, 'unknown', { answer: 'changed' }, now), original);
});
test('the actual component transition uses response-version invalidation', () => {
  const source = readFileSync(new URL('../src/components/ExamBaselinePractice.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('const updateResponse =');
  const bodyStart = source.indexOf('{', start) + 1;
  const end = source.indexOf('\n  };', bodyStart);
  const body = source.slice(bodyStart, end).replace(/ as BaselineAttempt/g, '');
  let stored;
  new Function('attempt', 'persist', 'id', 'patch', 'patchBaselineAttemptResponse', body)(
    completeAttempt(), (x) => { stored = x; }, 'a', { answer: 'changed' }, patchBaselineAttemptResponse,
  );
  assert.equal(stored.responses.a.selfCheck, null);
  assert.equal(stored.completedAt, null);
});
