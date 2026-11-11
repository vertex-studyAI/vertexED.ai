import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS, selectLearningQuestion, buildKnowledgeModel, normalisePracticeAttempt, parseLearningRecords } from '../src/lib/learningModel.mjs';
import { advancePracticeSession } from '../src/lib/practiceSession.mjs';

// Synthetic exact-revision fixtures exercise the engine. They grant no content
// publication permission and do not alter the real approval register.
const NOW = Date.parse('2026-11-11T13:00:00Z');
const systemNow = Date.now;
Date.now = () => NOW;
after(() => { Date.now = systemNow; });
const questions = LEARNING_QUESTIONS.map(q => ({ ...q,
  contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` }));
const question = id => questions.find(q => q.id === id);
const answer = q => String(q.type === 'multiple-choice' ? q.answer.choice : q.answer.value);
const attempt = (id, qid = 'math-argument-01', patch = {}) => ({
  id: `attempt:selection-${id}`, questionId: qid,
  contentRevision: question(qid).contentRevision, answer: '-123456',
  confidence: null, hinted: false, seconds: 30,
  at: '2026-11-09T12:00:00Z', mode: 'diagnostic', ...patch,
});
const choose = (attempts, options = {}) => selectLearningQuestion({
  questions, subject: 'Mathematics', mode: 'mixed', attempts, now: NOW, ...options,
})?.id;
const perms = values => values.length < 2 ? [values] : values.flatMap((value, index) =>
  perms(values.filter((_v, i) => i !== index)).map(rest => [value, ...rest]));

test('selection recomputes answer evidence instead of trusting a saved correct flag', () => {
  const original = attempt('wrong-0001');
  const expected = choose([original]);
  for (const correct of [true, false, null, undefined]) {
    assert.equal(choose([{ ...original, correct }]), expected);
  }
  assert.equal(normalisePracticeAttempt({ ...original, correct: true }, { questions }).correct, false);
});

test('legacy and changed-revision derived records do not trigger targeted repair', () => {
  const q = question('math-modulus-01');
  const checked = normalisePracticeAttempt(attempt('verified-1', q.id, { answer: answer(q) }), { questions });
  const expected = choose([checked], { mode: 'targeted' });
  assert.notEqual(expected, q.id);
  for (const contentRevision of [undefined, `sha256:${'0'.repeat(64)}`]) {
    const raw = attempt('held-00001', q.id, {
      contentRevision, correct: true, at: '2026-11-10T12:00:00Z',
    });
    const held = normalisePracticeAttempt(raw, { questions });
    assert.equal(held.assessmentStatus, 'held');
    assert.equal(held.correct, null);
    assert.equal(choose([checked, held], { mode: 'targeted' }), expected);
  }
});

test('an unknown historical question does not override later verified difficulty evidence', () => {
  const q = question('math-argument-01');
  const checked = attempt('known-0001', q.id, { answer: answer(q), correct: true });
  const unknown = { ...attempt('unknown-01'), questionId: 'archived-item-unknown', correct: false,
    at: '2026-11-10T12:00:00Z' };
  assert.equal(choose([checked, unknown]), choose([checked]));
});

test('future exact-revision attempts do not influence unseen status, repair or difficulty', () => {
  const future = attempt('future-001', 'math-argument-01', {
    at: new Date(NOW + 60 * 60 * 1000).toISOString(), correct: false,
  });
  assert.equal(normalisePracticeAttempt(future, { questions }).assessmentStatus, 'verified');
  for (const mode of ['diagnostic', 'targeted', 'mixed']) {
    assert.equal(choose([future], { mode }), choose([], { mode }));
  }
});

test('invalid records cannot change a derived recommendation or crash its ranking', () => {
  const expected = choose([], { mode: 'targeted' });
  for (const row of [null, {}, attempt('bad-conf-1', 'math-argument-01', { confidence: 99 }),
    attempt('bad-date-1', 'math-argument-01', { at: 'not-a-date' })]) {
    assert.equal(choose([row], { mode: 'targeted' }), expected);
  }
});

test('difficulty and targeted repair use the latest instant, independent of cloud array order', () => {
  const q = question('math-argument-01');
  const rows = [
    attempt('old-ok-001', q.id, { answer: answer(q), correct: true, at: '2026-11-09T12:00:00Z' }),
    attempt('new-no-001', q.id, { correct: false, at: '2026-11-10T12:00:00Z' }),
    attempt('old-held-1', q.id, { contentRevision: undefined, correct: null, at: '2026-11-08T12:00:00Z' }),
  ];
  for (const mode of ['diagnostic', 'targeted', 'mixed']) {
    const expected = choose(rows, { mode });
    for (const order of perms(rows)) assert.equal(choose(order, { mode }), expected);
  }
});

test('timezone spellings are ordered by instants rather than date text or array placement', () => {
  const q = question('math-argument-01');
  const earlier = attempt('offset-001', q.id, { answer: answer(q), correct: true, at: '2026-11-10T01:30:00+02:00' });
  const later = attempt('offset-002', q.id, { correct: false, at: '2026-11-09T23:45:00Z' });
  assert.ok(Date.parse(earlier.at) < Date.parse(later.at));
  const expected = choose([earlier, later]);
  assert.equal(choose([later, earlier]), expected);
  assert.equal(choose([later, earlier].map(a => ({ ...a, at: new Date(a.at).toISOString() }))), expected);
});

test('equal-instant input permutations have a deterministic identity tie break', () => {
  const q = question('math-argument-01');
  const rows = [attempt('same-00001', q.id, { answer: answer(q), correct: true }),
    attempt('same-00002', q.id, { correct: false })];
  assert.equal(choose(rows), choose([...rows].reverse()));
  assert.deepEqual(buildKnowledgeModel(rows, NOW, questions), buildKnowledgeModel([...rows].reverse(), NOW, questions));
});

test('valid success, error and assisted success retain their intended distinct effects', () => {
  const q = question('math-argument-01');
  const success = attempt('genuine-ok', q.id, { answer: answer(q) });
  const error = attempt('genuine-no', q.id);
  assert.notEqual(choose([success]), choose([error]));
  assert.equal(choose([{ ...success, hinted: true }]), choose([error]));
});

test('selection and model projections preserve original answers, dates, metadata and storage bytes', () => {
  const rows = [attempt('preserve-1', 'math-argument-01', { correct: true,
    at: '2026-11-09T07:00:00-05:00', note: { retained: 'Only saved copy' } }),
    attempt('preserve-2', 'math-argument-01', { contentRevision: undefined, correct: false })];
  const raw = JSON.stringify(rows);
  const parsed = parseLearningRecords(raw, 'practice_attempt');
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  freeze(parsed);
  choose(parsed);
  buildKnowledgeModel(parsed, NOW, questions);
  assert.equal(JSON.stringify(parsed), raw);
});

test('scope, exclusion and explicit target selection retain their existing contract', () => {
  const q = question('math-argument-01');
  assert.equal(choose([], { targetId: q.id }), q.id);
  assert.notEqual(choose([], { targetId: q.id, exclude: [q.id] }), q.id);
  assert.equal(choose([], { curriculum: 'nonexistent' }), undefined);
  assert.equal(choose([], { exclude: questions.map(q => q.id) }), undefined);
  const selected = selectLearningQuestion({ subject: 'Physics', questions, now: NOW });
  assert.equal(selected.subject, 'Physics');
});

test('diagnostic session adaptation is unchanged by held history or record permutation', () => {
  const ids = ['math-argument-01', 'math-argument-02', 'math-polar-01', 'math-polar-02'];
  const session = { id: 'selection-session-01', ids, index: 0, mode: 'diagnostic',
    contentRevisions: Object.fromEntries(ids.map(id => [id, question(id).contentRevision])),
    startedAt: Date.parse('2026-11-09T00:00:00Z'), deadline: null, finished: false,
    subject: 'Mathematics', topic: '', concept: '', curriculum: '', responses: {} };
  const q = question(ids[0]);
  const rows = [attempt('session-ok', q.id, { answer: answer(q), correct: true }),
    attempt('session-no', q.id, { correct: false, at: '2026-11-10T12:00:00Z' })];
  const expected = advancePracticeSession(session, rows, { questions });
  const held = normalisePracticeAttempt(attempt('session-hi', q.id, { contentRevision: undefined, at: '2026-11-10T13:00:00Z' }), { questions });
  assert.deepEqual(advancePracticeSession(session, [...rows].reverse(), { questions }), expected);
  assert.deepEqual(advancePracticeSession(session, [...rows, held], { questions }), expected);
  assert.equal(expected.ids[0], session.ids[0]);
  assert.equal(new Set(expected.ids).size, expected.ids.length);
});
