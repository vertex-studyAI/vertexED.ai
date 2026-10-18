import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS } from '../src/lib/learningModel.mjs';
import { parsePracticeSession, practiceSessionNeedsReview, archiveHeldPracticeSession, advancePracticeSession as advanceSession, writePracticeSession as writeSession } from '../src/lib/practiceSession.mjs';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';

const questions = LEARNING_QUESTIONS.map(q => ({ ...q, contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` }));
const ids = questions.filter(q => q.subject === 'Physics').slice(0, 4).map(q => q.id);
const advancePracticeSession = (session, attempts) => advanceSession(session, attempts, { questions });
const writePracticeSession = (storage, key, expectedRaw, session) => writeSession(storage, key, expectedRaw, session, { questions });
const response = { answer: '12', confidence: 3, hinted: false, seconds: 10, flagged: false };
const session = () => ({ id: 'session-12345678', ids, contentRevisions: Object.fromEntries(ids.map(id => [id, questions.find(q => q.id === id).contentRevision])), index: 0, mode: 'diagnostic', startedAt: 1000, deadline: null, finished: false, responses: {}, subject: 'Physics', topic: '', concept: '', curriculum: '' });

test('session reload retains valid answers and reports broken JSON as preserved data', () => {
  const s = session(); s.responses[ids[0]] = { ...response, submitted: `attempt:${s.id}-0` };
  assert.deepEqual(parsePracticeSession(JSON.stringify(s)), s);
  assert.equal(parsePracticeSession(null), null);
  for (const raw of ['', '{', 'null', '[]']) assert.throws(() => parsePracticeSession(raw), /original data is preserved/);
});

test('rejects duplicate, corrupt and misbound question or attempt references', () => {
  for (const patch of [
    { ids: [ids[0], ids[0]] }, { ids: ['bad question!'] }, { index: 25 },
    { responses: [] }, { responses: { unknown: response } },
    { responses: { [ids[0]]: { ...response, submitted: 'attempt:another-session-0' } } },
    { responses: { [ids[0]]: { ...response, seconds: -1 } } },
    { responses: { [ids[0]]: { ...response, seconds: 86401 } } },
    { mode: 'exam', deadline: null }, { curriculum: null },
  ]) assert.throws(() => parsePracticeSession(JSON.stringify({ ...session(), ...patch })), /preserved/);
});

test('unknown historical references remain readable but cannot resume grading', () => {
  const s = { ...session(), ids: ['missing-question'], contentRevisions: undefined };
  const raw = JSON.stringify(s);
  const restored = parsePracticeSession(raw);
  assert.equal(restored.ids[0], 'missing-question');
  assert.equal(practiceSessionNeedsReview(restored, questions), true);
  assert.equal(JSON.stringify(restored), raw);
  assert.equal(advancePracticeSession(restored, []), restored);
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

const heldFixture = () => {
  const held = { ...session(), contentRevisions: undefined, responses: { [ids[0]]: response }, historicalNote: 'Keep original session fields' };
  const raw = JSON.stringify(held, null, 2);
  const key = 'vertex_content:account-a:practice_session';
  const values = new Map([[key, raw]]);
  const storage = { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  return { held: parsePracticeSession(raw), raw, key, values, storage };
};

test('archiving held sessions retains exact active bytes, is idempotent, and joins account export/delete', () => {
  const { held, raw, key, values, storage } = heldFixture();
  archiveHeldPracticeSession(storage, key, raw, held);
  assert.equal(storage.getItem(key), raw);
  const archiveRaw = storage.getItem(`${key}:held-history`);
  assert.equal(JSON.parse(archiveRaw)[0].raw, raw);
  archiveHeldPracticeSession(storage, key, raw, held);
  assert.equal(storage.getItem(`${key}:held-history`), archiveRaw);
  assert.equal(collectAccountStorage(storage, 'account-a')[`${key}:held-history`][0].raw, raw);
  values.set('vertex_content:account-b:practice_session', 'other account');
  clearAccountStorage(storage, 'account-a');
  assert.equal(storage.getItem(`${key}:held-history`), null);
  assert.equal(storage.getItem('vertex_content:account-b:practice_session'), 'other account');
});

test('archive refuses stale sessions, corrupt or full history, quota failures and silent failed writes', () => {
  for (const archive of ['{broken', '{}', '[{}]', ...[100, 101].map(length => JSON.stringify(Array.from({ length }, () => ({ sessionId: 'session-12345678', raw: JSON.stringify(session()), archivedAt: new Date().toISOString() }))))]) {
    const { held, raw, key, storage } = heldFixture();
    storage.setItem(`${key}:held-history`, archive);
    assert.throws(() => archiveHeldPracticeSession(storage, key, raw, held), /preserved/);
    assert.equal(storage.getItem(key), raw);
    assert.equal(storage.getItem(`${key}:held-history`), archive);
  }
  for (const setItem of [() => { throw new Error('Quota exceeded'); }, () => undefined]) {
    const { held, raw, key, storage } = heldFixture();
    assert.throws(() => archiveHeldPracticeSession({ ...storage, setItem }, key, raw, held), /could not be archived/);
    assert.equal(storage.getItem(key), raw);
  }
  const { held, raw, key, storage } = heldFixture();
  assert.throws(() => archiveHeldPracticeSession(storage, key, raw, { ...held, index: 1 }), /differs/);
  storage.setItem(key, 'changed');
  assert.throws(() => archiveHeldPracticeSession(storage, key, raw, held), /another tab/);
  assert.equal(storage.getItem(`${key}:held-history`), null);
  assert.equal(storage.getItem(key), 'changed');
});
