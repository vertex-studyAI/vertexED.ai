import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const sourceText = fs.readFileSync('src/lib/studyActivity.ts', 'utf8');
const source = ts.transpileModule(sourceText, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
  .replace("'@/lib/browserStorage.mjs'", JSON.stringify(new URL('../src/lib/browserStorage.mjs', import.meta.url).href))
  .replace("'@/lib/userContentStorageScope.mjs'", JSON.stringify(new URL('../src/lib/userContentStorageScope.mjs', import.meta.url).href));
const { getLastStudySession, rememberStudySession, logStudyActivity } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('optional study activity survives blocked storage and rejects invalid resume locations', () => {
  let stored = null;
  const storage = { getItem: () => stored, setItem: (_key, value) => { stored = value; } };
  globalThis.window = { sessionStorage: storage, localStorage: storage };
  try {
    rememberStudySession('/notetaker?mode=study', 'Flashcards');
    assert.equal(getLastStudySession().path, '/notetaker?mode=study');
    for (const path of ['https://example.com', '//example.com', '/\\example.com']) {
      stored = JSON.stringify({ path, label: 'Resume', at: new Date().toISOString() });
      assert.equal(getLastStudySession(), null);
    }
    stored = JSON.stringify({ path: '/planner', label: 'Plan', at: 'invalid' });
    assert.equal(getLastStudySession(), null);
    stored = '{}';
    assert.doesNotThrow(() => logStudyActivity('Saved notes'));
    const blocked = { getItem() { throw new Error('Storage blocked'); }, setItem() { throw new Error('Quota exceeded'); } };
    globalThis.window = { sessionStorage: blocked, localStorage: blocked };
    assert.equal(getLastStudySession(), null);
    assert.doesNotThrow(() => rememberStudySession('/planner', 'Plan'));
    assert.doesNotThrow(() => logStudyActivity('Saved notes'));
  } finally {
    delete globalThis.window;
  }
});

test('study activity drops malformed persisted rows before appending a new entry', () => {
  let stored = JSON.stringify([
    null,
    { id: '', message: 'missing id', createdAt: '2026-09-11T12:00:00.000Z' },
    { id: 'bad-time', message: 'bad timestamp', createdAt: 'not-a-date' },
    { id: 'valid', message: 'Earlier study', createdAt: '2026-09-11T12:00:00.000Z' },
  ]);
  const storage = { getItem: () => stored, setItem: (_key, value) => { stored = value; } };
  globalThis.window = { localStorage: storage, sessionStorage: storage };
  try {
    assert.doesNotThrow(() => logStudyActivity('Saved notes'));
    const persisted = JSON.parse(stored);
    assert.equal(persisted.length, 2);
    assert.equal(persisted[0].message, 'Saved notes');
    assert.equal(persisted[1].id, 'valid');
  } finally {
    delete globalThis.window;
  }
});

test('study activity uses the shared fail-closed browser storage boundary', () => {
  assert.match(sourceText, /resolveLocalStorage/);
  assert.match(sourceText, /resolveSessionStorage/);
  assert.match(sourceText, /safeStorageGet/);
  assert.match(sourceText, /safeStorageSet/);
  assert.match(sourceText, /parseStoredArray/);
  assert.match(sourceText, /parseStoredObject/);
  assert.doesNotMatch(sourceText, /window\.localStorage\.(?:getItem|setItem)/);
  assert.doesNotMatch(sourceText, /window\.sessionStorage\.(?:getItem|setItem)/);
});
