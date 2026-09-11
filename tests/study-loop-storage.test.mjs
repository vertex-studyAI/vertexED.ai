import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { normalizeStudyLoopWeek } from '../src/lib/studyLoopStorage.mjs';

const currentWeek = '2026-W37';

test('study-loop state rejects malformed, stale, and invalid completion values', () => {
  assert.deepEqual(normalizeStudyLoopWeek(null, currentWeek), { weekKey: currentWeek, steps: {} });
  assert.deepEqual(normalizeStudyLoopWeek([], currentWeek), { weekKey: currentWeek, steps: {} });
  assert.deepEqual(normalizeStudyLoopWeek({ weekKey: currentWeek }, currentWeek), { weekKey: currentWeek, steps: {} });
  assert.deepEqual(
    normalizeStudyLoopWeek({ weekKey: '2026-W36', steps: { plan: '2026-09-07T08:00:00.000Z' } }, currentWeek),
    { weekKey: currentWeek, steps: {} },
  );
  assert.deepEqual(
    normalizeStudyLoopWeek({
      weekKey: currentWeek,
      steps: {
        plan: '2026-09-07T08:00:00.000Z',
        focus: 'not-a-date',
        review: 42,
        unknown: '2026-09-08T08:00:00.000Z',
      },
    }, currentWeek),
    { weekKey: currentWeek, steps: { plan: '2026-09-07T08:00:00.000Z' } },
  );
});

test('study-loop tracker routes persistence through fail-closed storage helpers', () => {
  const source = fs.readFileSync('src/lib/studyLoopTracker.ts', 'utf8');
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /safeStorageSet/);
  assert.match(source, /normalizeStudyLoopWeek/);
  assert.doesNotMatch(source, /window\.localStorage\.(?:getItem|setItem)/);
});
