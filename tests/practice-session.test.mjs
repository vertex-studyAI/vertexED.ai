import test from 'node:test';
import assert from 'node:assert/strict';
import { LEARNING_QUESTIONS } from '../src/lib/learningModel.mjs';
import { parsePracticeSession, advancePracticeSession, writePracticeSession } from '../src/lib/practiceSession.mjs';

const ids = LEARNING_QUESTIONS.filter(q => q.subject === 'Physics').slice(0, 4).map(q => q.id);
const response = { answer: '12', confidence: 3, hinted: false, seconds: 10, flagged: false };
const session = () => ({ id: 'session-12345678', ids, index: 0, mode: 'diagnostic', startedAt: 1000, deadline: null, finished: false, responses: {}, subject: 'Physics', topic: '', concept: '', curriculum: '' });

test('session reload retains valid answers and reports broken JSON as preserved data', () => {
  const s = session(); s.responses[ids[0]] = { ...response, submitted: `attempt:${s.id}-0` };
  assert.deepEqual(parsePracticeSession(JSON.stringify(s)), s);
  assert.equal(parsePracticeSession(null), null);
  for (const raw of ['', '{', 'null', '[]']) assert.throws(() => parsePracticeSession(raw), /original data is preserved/);
});

test('rejects duplicate, dangling and misbound question or attempt references', () => {
  for (const patch of [
    { ids: [ids[0], ids[0]] }, { ids: ['missing-question'] }, { index: 25 },
    { responses: [] }, { responses: { unknown: response } },
    { responses: { [ids[0]]: { ...response, submitted: 'attempt:another-session-0' } } },
    { responses: { [ids[0]]: { ...response, seconds: -1 } } },
    { responses: { [ids[0]]: { ...response, seconds: 86401 } } },
    { mode: 'exam', deadline: null }, { curriculum: null },
  ]) assert.throws(() => parsePracticeSession(JSON.stringify({ ...session(), ...patch })), /preserved/);
});

test('back navigation cannot reshuffle an already visited diagnostic or change submitted IDs', () => {
  const s = session();
  s.responses[ids[0]] = { ...response, submitted: `attempt:${s.id}-0` };
  s.responses[ids[1]] = { ...response, submitted: `attempt:${s.id}-1` };
  const next = advancePracticeSession(s, []);
  assert.deepEqual(next.ids, ids);
  assert.equal(next.index, 1);
  assert.equal(next.responses[ids[1]].submitted, `attempt:${s.id}-1`);
  assert.deepEqual(parsePracticeSession(JSON.stringify(next)), next);
});

test('a newly visited question is fixed even before typing or a timer tick', () => {
  const next = advancePracticeSession(session(), []);
  assert.ok(Object.hasOwn(next.responses, next.ids[1]));
  const backThenForward = advancePracticeSession({ ...next, index: 0 }, []);
  assert.deepEqual(backThenForward.ids, next.ids);
});

test('finished reviews never adapt questions and exam navigation preserves answers', () => {
  for (const s of [{ ...session(), finished: true }, { ...session(), mode: 'exam', deadline: 2000 }]) {
    const next = advancePracticeSession(s, []);
    assert.deepEqual(next.ids, s.ids);
  }
});

test('a stale tab cannot overwrite a newer session or corrupt saved bytes', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const original = writePracticeSession(storage, 'account-a', null, session());
  const newer = writePracticeSession(storage, 'account-a', original, { ...session(), index: 1 });
  assert.throws(() => writePracticeSession(storage, 'account-a', original, session()), /another tab/);
  assert.equal(values.get('account-a'), newer);
  values.set('account-b', '{broken');
  assert.throws(() => writePracticeSession(storage, 'account-b', null, session()), /another tab/);
  assert.equal(values.get('account-b'), '{broken');
});
