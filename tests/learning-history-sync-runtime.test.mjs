import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { setUserContentStorageScope } from '../src/lib/userContentStorageScope.mjs';

const asModule = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const authMock = asModule(`export const getAccessToken = async () => 'fixture';
export const authFetchWithAccessToken = async () => ({ ok: true, json: async () => ({ items: globalThis.__learningHistorySyncFixture.items }) });`);
const durableMock = asModule(`export const listDurableOutboxRecords = async () => [];
export const deleteDurableOutboxRecord = async () => {};
export const putDurableOutboxRecord = async () => {};`);
let source = ts.transpileModule(fs.readFileSync('src/lib/learnerStateSync.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
source = source.replace(/(['"])(@\/lib\/[^'"]+|\.\/[^'"]+)\1/g, (_match, _quote, specifier) => {
  if (specifier === '@/lib/apiAuth') return JSON.stringify(authMock);
  if (specifier === './durableOutbox' || specifier === '@/lib/durableOutbox') return JSON.stringify(durableMock);
  return JSON.stringify(new URL(`../src/lib/${specifier.replace(/^@\/lib\/|^\.\//, '')}`, import.meta.url).href);
});
const { hydrateLearnerState } = await import(asModule(source));

const reflection = { id: 'mistake:historical-1234', questionId: 'archived-question-unknown', cause: 'conceptual', reflection: 'Original reflection', correction: 'Original correction', updatedAt: '2026-10-01T12:34:56+00:00', historicalNote: 'Only original copy' };
const attempt = { id: 'attempt:historical-1234', questionId: reflection.questionId, answer: '7', confidence: 4, hinted: false, seconds: 42.5, at: reflection.updatedAt, mode: 'mixed', correct: true, historicalNote: 'Only original attempt copy' };

async function withStorage(run) {
  const scope = 'history-sync-account';
  const keys = { practice_mistake: `vertex_content:${scope}:practice_mistakes`, practice_attempt: `vertex_content:${scope}:practice_attempts` };
  const values = new Map([[keys.practice_mistake, JSON.stringify([reflection])], [keys.practice_attempt, JSON.stringify([attempt])]]);
  const oldWindow = globalThis.window;
  globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }, dispatchEvent() {} };
  setUserContentStorageScope(scope);
  try { await run(values, keys); }
  finally { globalThis.window = oldWindow; delete globalThis.__learningHistorySyncFixture; setUserContentStorageScope(null); }
}

test('real hydrate runtime retains richer raw device history when old cloud normalization has the same facts', async () => {
  await withStorage(async (values, keys) => {
    const originals = new Map(values);
    globalThis.__learningHistorySyncFixture = { items: [
      { stateType: 'practice_mistake', stateKey: reflection.id, clientUpdatedAt: '2026-10-01T12:34:56.000Z', payload: { ...reflection, updatedAt: '2026-10-01T12:34:56.000Z' } },
      { stateType: 'practice_attempt', stateKey: attempt.id, clientUpdatedAt: '2026-10-01T12:34:56.000Z', payload: { ...attempt, at: '2026-10-01T12:34:56.000Z', correct: null, assessmentStatus: 'held', recordedResult: { correct: true } } },
    ] };
    for (const item of globalThis.__learningHistorySyncFixture.items) delete item.payload.historicalNote;
    assert.equal(await hydrateLearnerState(), 2);
    for (const key of Object.values(keys)) assert.equal(values.get(key), originals.get(key));
  });
});

test('real hydrate runtime reports equal-instant conflicts and leaves the original device bytes untouched', async () => {
  await withStorage(async (values, keys) => {
    const originalRaw = values.get(keys.practice_mistake);
    globalThis.__learningHistorySyncFixture = { items: [{ stateType: 'practice_mistake', stateKey: reflection.id, clientUpdatedAt: '2026-10-01T12:34:56.000Z', payload: { ...reflection, updatedAt: '2026-10-01T12:34:56.000Z', reflection: 'Conflicting cloud reflection' } }] };
    await assert.rejects(hydrateLearnerState(), /1 learner records could not be restored/);
    assert.equal(values.get(keys.practice_mistake), originalRaw);
  });
});

test('real hydrate runtime does not overwrite malformed empty-string history with cloud records', async () => {
  await withStorage(async (values, keys) => {
    for (const key of Object.values(keys)) values.set(key, '');
    globalThis.__learningHistorySyncFixture = { items: [
      { stateType: 'practice_mistake', stateKey: reflection.id, clientUpdatedAt: reflection.updatedAt, payload: reflection },
      { stateType: 'practice_attempt', stateKey: attempt.id, clientUpdatedAt: attempt.at, payload: attempt },
    ] };
    await assert.rejects(hydrateLearnerState(), /2 learner records could not be restored/);
    for (const key of Object.values(keys)) assert.equal(values.get(key), '');
  });
});
