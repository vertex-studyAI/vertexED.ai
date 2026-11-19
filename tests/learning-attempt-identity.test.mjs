import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS, buildKnowledgeModel, buildLearningPlan, selectLearningQuestion, parseLearningRecords } from '../src/lib/learningModel.mjs';
import { buildMistakeNotebook, sessionEvidenceChanges } from '../src/lib/learningJourney.mjs';

// Synthetic revisions exercise identity handling without approving real content.
const NOW = Date.parse('2026-11-15T12:00:00Z');
const systemNow = Date.now;
Date.now = () => NOW;
after(() => { Date.now = systemNow; });
const questions = LEARNING_QUESTIONS.map(q => ({ ...q,
  contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` }));
const question = id => questions.find(q => q.id === id);
const attempt = (id, qid = 'math-modulus-01', patch = {}) => ({
  id: `attempt:identity-${id}`, questionId: qid,
  contentRevision: question(qid).contentRevision,
  answer: String(question(qid).answer.value), confidence: 4, hinted: false,
  seconds: 30, at: '2026-11-12T12:00:00Z', mode: 'mixed', ...patch,
});
const model = rows => buildKnowledgeModel(rows, NOW, questions);
const modulus = rows => model(rows).find(n => n.id === 'mathematics:modulus');
const permutations = rows => rows.length < 2 ? [rows] : rows.flatMap((row, i) =>
  permutations(rows.filter((_r, j) => j !== i)).map(tail => [row, ...tail]));

test('a copied saved answer cannot manufacture mastery or delay review', () => {
  const first = attempt('success-01');
  const second = attempt('success-02', 'math-modulus-02', { at: '2026-11-13T12:00:00Z' });
  const raw = JSON.stringify([first, second, { ...second }]);
  const rows = parseLearningRecords(raw, 'practice_attempt');
  assert.equal(rows.length, 3, 'Reading history must preserve every saved record');
  const expected = modulus([first, second]);
  assert.equal(expected.status, 'developing');
  assert.equal(expected.intervalDays, 4);
  assert.deepEqual(modulus(rows), expected);
  assert.equal(JSON.stringify(rows), raw);
});

test('a repeated error is one observation, not evidence of repeated weakness', () => {
  const wrong = attempt('wrong-0001', 'math-modulus-01', { answer: '7' });
  const expected = modulus([wrong]);
  assert.equal(expected.status, 'developing');
  for (const count of [2, 5, 10]) assert.deepEqual(modulus(Array.from({ length: count }, () => ({ ...wrong }))), expected);
});

test('distinct attempt identities keep their genuine repeated-practice evidence', () => {
  const rows = [attempt('distinct-1'),
    attempt('distinct-2', 'math-modulus-02', { at: '2026-11-13T12:00:00Z' }),
    attempt('distinct-3', 'math-modulus-01', { at: '2026-11-14T12:00:00Z' })];
  assert.equal(modulus(rows).status, 'mastered');
  assert.equal(modulus(rows).attempts, 3);
  assert.equal(modulus(rows).independentCorrect, 3);
});

test('duplicate identities follow the newest saved record, independent of array order', () => {
  const older = attempt('updated-01', 'math-modulus-01', { answer: '7' });
  const newer = { ...older, answer: '5', at: '2026-11-13T12:00:00Z' };
  const rows = [older, newer, { ...older }];
  for (const order of permutations(rows)) assert.deepEqual(model(order), model([newer]));
});

test('equal-time conflicting facts are held rather than chosen by array order', () => {
  const good = attempt('conflict-1');
  const conflicts = [
    { ...good, answer: '7' }, { ...good, hinted: true }, { ...good, confidence: 1 },
    { ...good, seconds: 40 }, { ...good, mode: 'diagnostic' },
    { ...good, contentRevision: `sha256:${'0'.repeat(64)}` },
    { ...good, questionId: 'math-modulus-02', contentRevision: question('math-modulus-02').contentRevision },
  ];
  for (const conflicting of conflicts) for (const order of permutations([good, conflicting, { ...good }])) {
    assert.deepEqual(model(order), model([]));
  }
});

test('a later unambiguous version can replace an earlier conflicting identity', () => {
  const good = attempt('conflict-2');
  const bad = { ...good, answer: '7' };
  const latest = { ...good, at: '2026-11-14T12:00:00Z' };
  for (const order of permutations([good, bad, latest])) assert.deepEqual(model(order), model([latest]));
});

test('equivalent timestamp spellings and derived-result differences do not add observations', () => {
  const first = attempt('timezone-1');
  const copy = { ...first, at: '2026-11-12T17:30:00+05:30', correct: false,
    recordedResult: { correct: false }, historicalNote: 'Preserve this extra field' };
  for (const order of [[first, copy], [copy, first]]) {
    const node = modulus(order);
    assert.equal(node.attempts, 1);
    assert.equal(node.independentCorrect, 1);
    assert.equal(node.dueAt, modulus([first]).dueAt);
  }
});

test('invalid or future copies cannot suppress an existing valid observation', () => {
  const row = attempt('future-001');
  for (const other of [
    { ...row, answer: '7', at: new Date(NOW + 60_000).toISOString() },
    { ...row, confidence: 99 }, { ...row, at: 'invalid' },
  ]) for (const rows of [[row, other], [other, row]]) assert.deepEqual(model(rows), model([row]));
});

test('an invalid evaluation clock retains the existing no-evidence behavior', () => {
  const row = attempt('invalid-now');
  for (const now of [NaN, -Infinity]) {
    assert.ok(buildKnowledgeModel([row], now, questions).every(node => node.attempts === 0));
  }
});

test('a newer held revision does not resurrect an older grade for the same attempt', () => {
  const row = attempt('revision-1');
  const held = { ...row, at: '2026-11-13T12:00:00Z', contentRevision: undefined };
  for (const rows of [[row, held], [held, row]]) assert.deepEqual(model(rows), model([]));
});

test('the planner and selector use unique evidence without changing raw saved facts', () => {
  const wrong = attempt('select-001', 'math-modulus-01', { answer: '7' });
  const rows = [wrong, { ...wrong }];
  const original = JSON.stringify(rows);
  const options = { questions, now: NOW, subjects: ['Mathematics'], minutes: 15 };
  assert.deepEqual(buildLearningPlan({ ...options, attempts: rows }), buildLearningPlan({ ...options, attempts: [wrong] }));
  for (const mode of ['diagnostic', 'targeted', 'mixed']) {
    assert.deepEqual(selectLearningQuestion({ questions, now: NOW, mode, attempts: rows }),
      selectLearningQuestion({ questions, now: NOW, mode, attempts: [wrong] }));
  }
  assert.equal(JSON.stringify(rows), original);
});

test('mistake and session projections count an identity once and hold equal-time conflicts', () => {
  const error = attempt('notebook-1', 'math-modulus-01', { answer: '7' });
  const other = attempt('notebook-2', 'math-modulus-02', { at: '2026-11-13T12:00:00Z' });
  const rows = [error, { ...error }, other];
  const notebook = buildMistakeNotebook(rows, [], questions);
  assert.equal(notebook[0].history.length, 1);
  assert.equal(notebook[0].errors.length, 1);
  assert.deepEqual(buildMistakeNotebook([error, { ...error, answer: '5' }], [], questions), []);
  const session = { startedAt: Date.parse(error.at) - 1000,
    responses: { [error.questionId]: { submitted: error.id }, [other.questionId]: { submitted: other.id } } };
  assert.deepEqual(sessionEvidenceChanges(session, rows, questions), sessionEvidenceChanges(session, [error, other], questions));
});

test('deriving unique evidence leaves frozen duplicate history and metadata untouched', () => {
  const row = attempt('preserve-1', 'math-modulus-01', { historicalNote: { original: 'Only saved copy' } });
  const rows = [row, structuredClone(row)];
  const before = JSON.stringify(rows);
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  freeze(rows);
  modulus(rows);
  buildMistakeNotebook(rows, [], questions);
  assert.equal(JSON.stringify(rows), before);
});
