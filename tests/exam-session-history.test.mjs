import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeExamSessionHistory, normalizeExamSession, readStoredExamSessionHistory } from '../src/lib/examSessionHistory.mjs';
import { normalizeLearnerStateItem } from '../api/_lib/learnerStateStore.js';

const snapshot = {
  id: 'session-123', day: '2026-09-08', subject: 'Biology', minutes: 25, mode: 'practice',
  mission: { kind: 'practice', title: 'Practise Biology', detail: 'Attempt one question.' },
  completed: ['task:retrieve'], startedAt: '2026-09-08T10:00:00Z', updatedAt: '2026-09-08T10:10:00Z',
};

test('session snapshots validate identity, time, task and completion shape', () => {
  assert.equal(normalizeExamSession(snapshot).id, snapshot.id);
  for (const change of [{ id: '' }, { minutes: 0 }, { updatedAt: 'bad' }, { completed: {} }, { mission: { kind: 'invented' } }]) {
    assert.equal(normalizeExamSession({ ...snapshot, ...change }), null);
  }
  assert.equal(normalizeExamSession(null), null);
});

test('history keeps separate sessions on the same day and does not overwrite a newer snapshot', () => {
  const next = { ...snapshot, id: 'session-456', startedAt: '2026-09-08T11:00:00Z', updatedAt: '2026-09-08T11:10:00Z' };
  const history = mergeExamSessionHistory([snapshot], next);
  assert.equal(history.length, 2);
  const newer = { ...snapshot, completed: [], updatedAt: '2026-09-08T11:10:00Z' };
  assert.deepEqual(mergeExamSessionHistory([newer], snapshot)[0].completed, []);
  assert.deepEqual(mergeExamSessionHistory([snapshot], newer)[0].completed, []);
});

test('history compares actual instants across offsets and rejects invalid timestamp shapes', () => {
  const later = { ...snapshot, completed: [], updatedAt: '2026-09-08T07:00:00-04:00' };
  assert.deepEqual(mergeExamSessionHistory([snapshot], later)[0].completed, []);
  assert.deepEqual(mergeExamSessionHistory([later], snapshot)[0].completed, []);
  const newerStart = { ...later, id: 'session-789', startedAt: '2026-09-08T06:30:00-04:00' };
  assert.equal(mergeExamSessionHistory([snapshot], newerStart)[0].id, newerStart.id);
  for (const updatedAt of [0, '2026-09-08', '2026-02-31T10:00:00Z', '2026-09-08T09:59:00Z']) assert.equal(normalizeExamSession({ ...snapshot, updatedAt }), null);
});

test('damaged history cannot be mistaken for an empty history or silently filtered', () => {
  for (const raw of ['{broken', '{}', '[null]', JSON.stringify([snapshot, { id: 'broken' }])]) {
    let writes = 0;
    const storage = { getItem: () => raw, setItem: () => { writes++; } };
    assert.throws(() => readStoredExamSessionHistory(storage, 'history'), /Original device data is preserved/);
    assert.equal(writes, 0);
  }
  assert.deepEqual(readStoredExamSessionHistory({ getItem: () => null }, 'history'), []);
});

test('API only accepts valid snapshots bound to the requested session key', () => {
  const item = { stateType: 'exam_session', stateKey: snapshot.id, payload: snapshot, clientRevision: 'state:1788861600000:abcdefgh', clientUpdatedAt: snapshot.updatedAt };
  assert.ok(normalizeLearnerStateItem(item));
  assert.equal(normalizeLearnerStateItem({ ...item, stateKey: 'different' }), null);
  assert.equal(normalizeLearnerStateItem({ ...item, payload: {} }), null);
});
