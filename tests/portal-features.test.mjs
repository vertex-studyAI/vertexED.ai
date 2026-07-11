import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Mirrors the subject/weakest resolution in buildPortalIntelligence
 * without importing browser-only modules.
 */
function resolveInterleaveAndWeakSprint(curriculumSubjects, masteryBySubject, heatmap) {
  const subjects = masteryBySubject.map((m) => m.subject);
  const interleaveSubjects =
    curriculumSubjects.length >= 2
      ? [curriculumSubjects[0], curriculumSubjects[1]]
      : subjects.length >= 2
        ? [subjects[0], subjects[1]]
        : [];
  const weakest = heatmap[0] ?? null;
  const weakSprint = weakest
    ? { topic: weakest.topic, subject: weakest.subject }
    : null;
  return { interleaveSubjects, weakSprint };
}

test('portal intelligence falls back to mastery subjects for interleave', () => {
  const { interleaveSubjects } = resolveInterleaveAndWeakSprint(
    [],
    [{ subject: 'Math' }, { subject: 'Physics' }],
    [],
  );
  assert.deepEqual(interleaveSubjects, ['Math', 'Physics']);
});

test('portal intelligence weak sprint uses weakest heatmap entry', () => {
  const { weakSprint } = resolveInterleaveAndWeakSprint(
    ['Math'],
    [{ subject: 'Math' }],
    [{ topic: 'Algebra', subject: 'Math', avgPercent: 40 }],
  );
  assert.equal(weakSprint.topic, 'Algebra');
  assert.equal(weakSprint.subject, 'Math');
});

test('portal intelligence weak sprint is null without heatmap data', () => {
  const { weakSprint } = resolveInterleaveAndWeakSprint(['Math'], [{ subject: 'Math' }], []);
  assert.equal(weakSprint, null);
});
