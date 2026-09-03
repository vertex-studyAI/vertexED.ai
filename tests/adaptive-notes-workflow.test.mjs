import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { buildAdaptiveNoteRoute, resolveAdaptiveNoteTarget } from '../src/lib/adaptiveNotes.mjs';

const weakness = {
  subject: 'Mathematics',
  topic: 'Quadratic factorisation',
  avgPercent: 42.4,
  attempts: 3,
  lastSeen: '2026-09-03T00:00:00.000Z',
};

test('adaptive note links carry only the selected subject and topic', () => {
  assert.equal(
    buildAdaptiveNoteRoute(weakness),
    '/notetaker?adaptive=1&subject=Mathematics&topic=Quadratic+factorisation',
  );
  assert.equal(buildAdaptiveNoteRoute({ subject: '', topic: 'Vectors' }), '/notetaker');
});

test('adaptive note targets must match current measured weakness state', () => {
  const params = new URLSearchParams('adaptive=1&subject=Mathematics&topic=Quadratic+factorisation');
  assert.deepEqual(resolveAdaptiveNoteTarget(params, [weakness]), {
    subject: 'Mathematics',
    topic: 'Quadratic factorisation',
    avgPercent: 42.4,
    attempts: 3,
  });

  assert.equal(resolveAdaptiveNoteTarget(params, []), null);
  assert.equal(
    resolveAdaptiveNoteTarget(new URLSearchParams('adaptive=1&subject=Mathematics&topic=Forged'), [weakness]),
    null,
  );
});

test('timed mocks never manufacture a mastery score from answer completion', () => {
  const source = fs.readFileSync('src/components/MockExamMode.tsx', 'utf8');
  assert.doesNotMatch(source, /recordWeakness/);
  assert.doesNotMatch(source, /completionRate/);
  assert.match(source, /No score has been estimated/);
  assert.match(source, /onClick=\{handleComplete\}/);
});

test('free-form answer reviewer output is not promoted into measured weakness data', () => {
  const source = fs.readFileSync('src/pages/AnswerReviewer.tsx', 'utf8');
  assert.doesNotMatch(source, /recordWeakness/);
  assert.doesNotMatch(source, /scoreMatch/);
});

test('adaptive notes explain the evidence and expose real form labels', () => {
  const source = fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8');
  assert.match(source, /Based on your verified quiz results/);
  assert.match(source, /htmlFor="notes-topic"/);
  assert.match(source, /htmlFor="notes-format"/);
  assert.match(source, /htmlFor="notes-brief"/);
});
