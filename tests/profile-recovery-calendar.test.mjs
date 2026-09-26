import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMissingCurriculumRecovery } from '../src/lib/profileRecovery.mjs';

const core = { board: 'IB_DP', grade: 11, subjects: ['Physics HL'] };
const userWithDate = exam_date => ({ user_metadata: { ...core, exam_date } });

for (const date of [
  '2027-02-29', '2026-02-30', '2026-04-31', '2026-06-31',
  '2026-09-31', '2026-11-31', '2026-00-12', '2026-13-01',
  '2026-01-00', '2026-01-32', '1900-02-29', '2100-02-29',
  '0000-01-01', '2026-2-01', '2026-02-1', '2026-01-01T00:00:00Z',
  '', 'not-a-date', null, 20260926, {}, [],
]) {
  test(`recovery excludes invalid optional exam date ${JSON.stringify(date)}`, () => {
    const result = buildMissingCurriculumRecovery(null, userWithDate(date));
    assert.deepEqual(result, core, 'invalid optional dates must not block valid curriculum recovery');
  });
}

for (const date of [
  '0001-01-01', '0099-12-31', '1900-02-28', '2000-02-29',
  '2024-02-29', '2026-04-30', '2026-12-31', '2400-02-29', '9999-12-31',
]) {
  test(`recovery retains real calendar date ${date}`, () => {
    assert.deepEqual(buildMissingCurriculumRecovery(null, userWithDate(date)), {
      ...core, exam_date: date,
    });
  });
}

test('recovery trims a valid date without changing its calendar day', () => {
  assert.equal(buildMissingCurriculumRecovery(null, userWithDate(' 2028-02-29 ')).exam_date, '2028-02-29');
});

test('nested preferences use the same calendar validation', () => {
  for (const [examDate, expected] of [['2027-02-29', undefined], ['2028-02-29', '2028-02-29']]) {
    const result = buildMissingCurriculumRecovery(null, { user_metadata: { preferences: { ...core, examDate } } });
    assert.equal(result.exam_date, expected);
    assert.equal(result.board, 'IB_DP');
  }
});

test('flat metadata remains authoritative over a valid nested fallback', () => {
  const result = buildMissingCurriculumRecovery(null, {
    user_metadata: { ...core, exam_date: '2027-02-29', preferences: { examDate: '2028-02-29' } },
  });
  assert.deepEqual(result, core);
});

test('recovery preserves every populated learner field and does not mutate inputs', () => {
  const profile = Object.freeze({ board: 'AP', grade: 12, subjects: Object.freeze(['Calculus BC']), exam_date: '2027-05-10' });
  const metadata = Object.freeze({ ...core, subjects: Object.freeze([...core.subjects]), exam_date: '2028-02-29' });
  assert.deepEqual(buildMissingCurriculumRecovery(profile, Object.freeze({ user_metadata: metadata })), {});
});

test('an optional valid date never makes incomplete core curriculum recoverable', () => {
  assert.deepEqual(buildMissingCurriculumRecovery(null, { user_metadata: { board: 'IB_DP', exam_date: '2028-02-29' } }), {});
});

test('every candidate day across a 400-year cycle agrees with independent UTC round-trip validation', () => {
  for (let year = 2000; year < 2400; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 1; day <= 31; day += 1) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const parsed = new Date(Date.UTC(year, month - 1, day));
        const valid = parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
        const result = buildMissingCurriculumRecovery(null, userWithDate(date));
        assert.equal(result.exam_date, valid ? date : undefined, date);
      }
    }
  }
});
