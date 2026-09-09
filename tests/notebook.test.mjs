import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildGroundingPayload, countWords, createNotebook, listNotebooks, addTextSource, setNotebookStorageScope } from '../src/lib/notebook.ts';

beforeEach(() => {
  const data = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  setNotebookStorageScope('test-owner');
});

test('actual notebook grounding respects enabled sources and the character budget', () => {
  const sources = [
    { id: 'a', title: 'A', content: 'hello world', enabled: true },
    { id: 'b', title: 'B', content: 'hidden', enabled: false },
  ];
  assert.deepEqual(buildGroundingPayload({ sources }), [{ id: 'a', title: 'A', excerpt: 'hello world' }]);
  const large = buildGroundingPayload({ sources: [{ id: 'c', title: 'Big', content: 'x'.repeat(150_000), enabled: true }] });
  assert.ok(large[0].excerpt.length <= 100_000);
});

test('countWords handles empty and normal text', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('one two three'), 3);
});

test('domain mutations preserve structurally broken notebook records', () => {
  const key = 'vertex_notebooks:test-owner:data';
  for (const raw of ['{broken', '[null]', '[{"id":"broken","sources":[null]}]']) {
    globalThis.localStorage.setItem(key, raw);
    assert.throws(() => createNotebook('Do not overwrite'));
    assert.equal(globalThis.localStorage.getItem(key), raw);
  }
});

test('creating a thirteenth notebook cannot silently delete existing study work', () => {
  for (let i = 0; i < 12; i++) createNotebook(`Notebook ${i}`);
  const saved = listNotebooks();
  assert.throws(() => createNotebook('Overflow'), /12-notebook limit/);
  assert.deepEqual(listNotebooks(), saved);
});

test('source limits reject explicitly and preserve the notebook', () => {
  const notebook = createNotebook('Sources');
  assert.throws(() => addTextSource(notebook.id, 'Too long', 'x'.repeat(50_001)), /50,000/);
  assert.equal(listNotebooks()[0].sources.length, 0);
  for (let i = 0; i < 20; i++) addTextSource(notebook.id, String(i), 'study');
  const saved = listNotebooks();
  assert.throws(() => addTextSource(notebook.id, 'Overflow', 'study'), /20 sources/);
  assert.deepEqual(listNotebooks(), saved);
});

test('notebook output modes are defined in handler', async () => {
  const { NOTEBOOK_OUTPUT_MODES } = await import('../api/_lib/grounding.js');
  assert.ok(NOTEBOOK_OUTPUT_MODES['study-guide']);
  assert.ok(NOTEBOOK_OUTPUT_MODES['audio-debate']);
  assert.ok(NOTEBOOK_OUTPUT_MODES.quiz?.quiz);
  assert.ok(NOTEBOOK_OUTPUT_MODES['mind-map']);
  assert.ok(Object.keys(NOTEBOOK_OUTPUT_MODES).length >= 14);
});
