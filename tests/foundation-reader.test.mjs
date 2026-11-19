import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { contentHash } from '../scripts/content-publication.mjs';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';
import { checkFoundationAnswer, emptyFoundationProgress, foundationProgressKey, loadFoundationLesson, loadFoundationManifest,
  readFoundationProgress, saveFoundationProgress, verifyFoundationBytes } from '../src/lib/foundationLibrary.mjs';

const manifest = JSON.parse(await readFile('public/learning-library/manifest.json', 'utf8'));
const entry = manifest.entries.find(entry => entry.id === 'linear-equations');
const body = await readFile(`public${entry.json}`, 'utf8');
const lesson = JSON.parse(body);
const memory = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }; };

test('reader verifies catalogue schema, matching identity and exact content bytes', async () => {
  const loaded = await loadFoundationManifest(undefined, async () => new Response(JSON.stringify(manifest)));
  assert.equal(loaded.entries.length, manifest.entries.length);
  assert.deepEqual(await loadFoundationLesson(entry, undefined, async () => new Response(body)), lesson);
  await assert.rejects(verifyFoundationBytes(`${body} `, entry.contentHash), /changed or is incomplete/);
  await assert.rejects(loadFoundationLesson(entry, undefined, async () => new Response(body, { status: 403 })), /awaiting subject review/);
  await assert.rejects(loadFoundationLesson({ ...entry, revision: 'wrong' }, undefined, async () => new Response(body)), /catalogue revision/);
  await assert.rejects(loadFoundationManifest(undefined, async () => new Response('{}')), /schemaVersion/);
  await assert.rejects(loadFoundationManifest(undefined, async () => new Response(JSON.stringify({ ...manifest, entries: [{ ...entry, json: 'https://evil.test/lesson.json' }] }))), /asset path/);
  await assert.rejects(loadFoundationManifest(undefined, async () => new Response(JSON.stringify({ ...manifest, entries: [entry, entry] }))), /Duplicate lesson/);
  const changed = JSON.stringify({ ...lesson, questions: [] });
  await assert.rejects(loadFoundationLesson({ ...entry, contentHash: contentHash(changed) }, undefined, async () => new Response(changed)), /questions/);
});

test('checking never awards full marks for a numeric-only extended response or evaluates code', () => {
  assert.equal(checkFoundationAnswer(lesson.questions[0], '5').status, 'match');
  assert.equal(checkFoundationAnswer(lesson.questions[0], '4').status, 'different');
  for (const value of ['', '5;globalThis.compromised=true', 'Infinity', '0x5', '5 km']) {
    assert.notEqual(checkFoundationAnswer(lesson.questions[0], value).status, 'match');
  }
  assert.equal(checkFoundationAnswer(lesson.questions.find(q => q.type === 'extended'), '7').status, 'review');
  const mcq = lesson.questions.find(q => q.type === 'mcq');
  assert.equal(checkFoundationAnswer(mcq, mcq.answer).status, 'match');
  assert.equal(checkFoundationAnswer(mcq, 'not an option').status, 'different');
  assert.equal(checkFoundationAnswer({ type: 'short' }, 'An explanation.').status, 'review');
});

test('progress round trips by account and exact content revision without cross-account reuse', () => {
  const storage = memory(); const key = foundationProgressKey('learner-a', entry);
  const state = { ...emptyFoundationProgress(), bookmarked: true, answers: { q1: '5' }, reviewed: ['0'] };
  const raw = saveFoundationProgress(storage, key, state, null);
  assert.deepEqual(readFoundationProgress(storage, key).value, state);
  assert.equal(readFoundationProgress(storage, key).raw, raw);
  assert.equal(readFoundationProgress(storage, foundationProgressKey('learner-b', entry)).raw, null);
  assert.equal(readFoundationProgress(storage, foundationProgressKey('learner-a', { ...entry, contentHash: `sha256:${'1'.repeat(64)}` })).raw, null);
});

test('corrupt storage, quota refusal and another-tab changes cannot be reported as saved', () => {
  const storage = memory(); const key = foundationProgressKey('learner', entry);
  storage.setItem(key, '{corrupt');
  assert.match(readFoundationProgress(storage, key).error, /preserved/);
  assert.equal(storage.getItem(key), '{corrupt');
  assert.throws(() => saveFoundationProgress(storage, key, emptyFoundationProgress(), null), /another tab/);
  assert.throws(() => saveFoundationProgress({ getItem: () => null, setItem: () => { throw new Error('quota'); } }, key, emptyFoundationProgress(), null), /not saved/);
  assert.match(readFoundationProgress(null, key).error, /preserved/);
  assert.throws(() => saveFoundationProgress(null, key, emptyFoundationProgress(), null), /unavailable/);
});

test('foundation progress participates in complete device export and owner-only cleanup', () => {
  const map = new Map();
  const storage = { get length() { return map.size; }, key: index => [...map.keys()][index],
    getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
  const first = foundationProgressKey('learner:a', entry);
  const nextRevision = foundationProgressKey('learner:a', { ...entry, contentHash: `sha256:${'2'.repeat(64)}` });
  const other = foundationProgressKey('learner:a:other', entry);
  saveFoundationProgress(storage, first, emptyFoundationProgress(), null);
  storage.setItem(nextRevision, '{damaged-but-recoverable');
  saveFoundationProgress(storage, other, emptyFoundationProgress(), null);
  const exported = collectAccountStorage(storage, 'learner:a');
  assert.deepEqual(Object.keys(exported).sort(), [first, nextRevision].sort());
  assert.equal(exported[nextRevision], '{damaged-but-recoverable');
  clearAccountStorage(storage, 'learner:a');
  assert.equal(storage.getItem(first), null);
  assert.equal(storage.getItem(nextRevision), null);
  assert.notEqual(storage.getItem(other), null);
});
