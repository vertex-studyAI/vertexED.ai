import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope, userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
let code = ts.transpileModule(fs.readFileSync('src/lib/examSessionStore.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const queue = encode('export const queueLearnerStateWrite = (...args) => globalThis.__examQueue(...args);');
code = code.replace(/(['"])\.\/([^'"]+)\1/g, (_, quote, file) => JSON.stringify(file === 'learnerStateSync' ? queue : pathToFileURL(`${process.cwd()}/src/lib/${file}`).href));
const { saveExamSessionHistory, readExamSessionHistoryState } = await import(encode(code));
const session = { id: 'session-fixture', day: '2026-09-09', subject: 'Biology', minutes: 25, mode: 'practice', mission: { kind: 'practice', title: 'Recall', detail: 'Attempt one question.' }, completed: [], startedAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:05:00Z' };

test('actual history store refuses to overwrite corrupt bytes but keeps a new session queued for cloud sync', () => {
  setUserContentStorageScope('history-owner');
  const key = userContentStorageKeys().examPrepHistory;
  const map = new Map([[key, '[null]']]);
  const pending = [];
  globalThis.localStorage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
  globalThis.__examQueue = (...args) => pending.push(args);
  try {
    assert.equal(saveExamSessionHistory(session), false);
    assert.equal(map.get(key), '[null]');
    assert.match(readExamSessionHistoryState().error, /Original device data is preserved/);
    assert.equal(pending[0][0], 'exam_session');
    assert.equal(pending[0][1], session.id);
    map.set(key, '[]');
    assert.equal(saveExamSessionHistory(session), true);
    assert.equal(readExamSessionHistoryState().entries.length, 1);
    assert.equal(readExamSessionHistoryState().error, null);
  } finally {
    delete globalThis.localStorage; delete globalThis.__examQueue;
    setUserContentStorageScope(null);
  }
});
