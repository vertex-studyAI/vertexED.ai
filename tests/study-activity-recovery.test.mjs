import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync('src/lib/studyActivity.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace("'@/lib/userContentStorageScope.mjs'", JSON.stringify(new URL('../src/lib/userContentStorageScope.mjs', import.meta.url).href));
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
