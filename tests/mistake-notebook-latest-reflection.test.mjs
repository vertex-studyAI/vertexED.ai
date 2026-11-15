import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildMistakeNotebook } from '../src/lib/learningJourney.mjs';
import { LEARNING_QUESTIONS, parseLearningRecords } from '../src/lib/learningModel.mjs';

const questions = LEARNING_QUESTIONS.map(q => ({ ...q,
  contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` }));
const question = questions.find(q => q.id === 'math-modulus-01');
const error = { id: 'attempt:reflection-error-01', questionId: question.id,
  answer: '7', confidence: null, hinted: false, seconds: 30,
  at: '2026-09-21T12:00:00Z', mode: 'diagnostic', contentRevision: question.contentRevision };
const make = (updatedAt, reflection, extra = {}) => ({ id: 'mistake:notebook-record-01',
  questionId: question.id, cause: 'conceptual', reflection,
  correction: 'Use the magnitude, not the sum of coordinates.', updatedAt, ...extra });
const old = make('2026-09-21T12:10:00Z', 'My first explanation.');
const latest = make('2026-09-22T12:10:00Z', 'My corrected explanation.', { cause: 'arithmetic' });
const notebook = reflections => buildMistakeNotebook([error], reflections, questions);
const permutations = rows => rows.length < 2 ? [rows] : rows.flatMap((row, i) =>
  permutations(rows.filter((_other, j) => i !== j)).map(rest => [row, ...rest]));

test('recovered duplicate revisions open the newest saved reflection in every order', () => {
  const middle = make('2026-09-21T18:00:00Z', 'An intermediate explanation.');
  for (const order of permutations([old, middle, latest])) {
    const raw = JSON.stringify(order);
    const saved = parseLearningRecords(raw, 'practice_mistake');
    const [row] = notebook(saved);
    assert.equal(row.reflection.reflection, latest.reflection);
    assert.equal(row.reflection.cause, latest.cause);
    assert.equal(row.reflection.updatedAt, latest.updatedAt);
    assert.equal(JSON.stringify(saved), raw, 'The derived notebook never rewrites saved history');
  }
});

test('separately created reflection identities for one question show the latest explanation', () => {
  const otherDevice = { ...latest, id: 'mistake:another-device-01' };
  for (const order of permutations([old, otherDevice])) {
    assert.strictEqual(notebook(order)[0].reflection, otherDevice);
  }
});

test('reflection chronology follows timestamp instants rather than local spellings', () => {
  const earlierInstant = make('2026-09-23T01:30:00+02:00', 'Earlier local-date spelling.');
  const laterInstant = make('2026-09-22T23:45:00Z', 'Actually later.');
  for (const order of permutations([earlierInstant, laterInstant])) {
    assert.strictEqual(notebook(order)[0].reflection, laterInstant);
  }
});

test('a later reflection on another question does not displace this question’s reflection', () => {
  const otherQuestion = make('2026-09-25T12:00:00Z', 'Another question.', {
    id: 'mistake:other-question-01', questionId: 'math-modulus-02' });
  for (const order of permutations([old, latest, otherQuestion])) {
    assert.strictEqual(notebook(order)[0].reflection, latest);
  }
});

test('equivalent newest instants retain the existing first-copy selection and all saved metadata', () => {
  const equivalent = { ...latest, updatedAt: '2026-09-22T17:40:00+05:30',
    importedMetadata: { source: 'a second retained copy' } };
  assert.equal(Date.parse(latest.updatedAt), Date.parse(equivalent.updatedAt));
  for (const order of permutations([latest, equivalent])) {
    assert.strictEqual(notebook([old, ...order])[0].reflection, order[0]);
    assert.deepEqual(equivalent.importedMetadata, { source: 'a second retained copy' });
  }
});

test('reflection ordering leaves mistakes, error counts and recovery evidence unchanged', () => {
  const without = notebook([])[0];
  const withLatest = notebook([old, latest])[0];
  const { reflection: _empty, ...before } = without;
  const { reflection: _chosen, ...after } = withLatest;
  assert.deepEqual(after, before);
  assert.equal(notebook([])[0].reflection, undefined);
  assert.strictEqual(notebook([old])[0].reflection, old);
});
