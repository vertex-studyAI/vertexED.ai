import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EXAM_UPLOAD_MAX_BYTES,
  summarizeConfirmedResults,
  validateExamMaterialLink,
  validateExamSetup,
  validateExamUpload,
} from '../src/lib/examSetupCore.mjs';

test('exam setup requires the fields that shape a scheduled assessment', () => {
  const empty = validateExamSetup({});
  assert.equal(empty.ok, false);
  assert.deepEqual(empty.missing, ['assessment type', 'board or programme', 'subject', 'date', 'duration', 'total marks']);

  assert.deepEqual(validateExamSetup({
    assessmentType: 'Mock exam', programme: 'IB MYP', subject: 'Chemistry', date: '2026-10-02',
    durationMinutes: 60, totalMarks: 80,
  }), { ok: true, missing: [] });
});

test('exam uploads enforce extensions, size and duplicate checks before metadata is saved', () => {
  assert.equal(validateExamUpload({ name: 'paper.exe', size: 12 }).ok, false);
  assert.equal(validateExamUpload({ name: 'paper.pdf', size: EXAM_UPLOAD_MAX_BYTES + 1 }).ok, false);
  assert.equal(validateExamUpload({ name: 'paper.pdf', size: 100 }, [{ name: 'PAPER.PDF', size: 100 }]).ok, false);
  assert.deepEqual(validateExamUpload({ name: 'paper.pdf', size: 100 }), { ok: true, extension: 'pdf' });
});

test('material links allow only complete web URLs', () => {
  assert.equal(validateExamMaterialLink('javascript:alert(1)').ok, false);
  assert.equal(validateExamMaterialLink('example.com/paper').ok, false);
  assert.equal(validateExamMaterialLink('https://example.com/paper').ok, true);
});

test('analytics averages only two or more comparable human-confirmed results', () => {
  const setup = { subject: 'Chemistry', assessmentType: 'Mock exam', paper: 'Paper 1', totalMarks: 50 };
  const first = { humanConfirmed: true, subject: 'Chemistry', assessmentType: 'Mock exam', paper: 'Paper 1', score: 30, maxScore: 50, topic: 'Rates', questionType: 'Short answer', commandTerm: 'Explain', durationMinutes: 55 };
  assert.equal(summarizeConfirmedResults([first], setup).averagePercent, null);

  const summary = summarizeConfirmedResults([
    first,
    { ...first, score: 40, durationMinutes: 45 },
    { ...first, score: 50, humanConfirmed: false },
    { ...first, score: 50, paper: 'Paper 2' },
    { ...first, score: 50, maxScore: 60 },
  ], setup);
  assert.equal(summary.confirmed.length, 2);
  assert.equal(summary.averagePercent, 70);
  assert.equal(summary.averageMinutes, 50);
  assert.deepEqual(summary.topics, { Rates: 2 });
});
