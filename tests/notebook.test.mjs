import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildGroundingPayload, countWords, createNotebook, listNotebooks, addTextSource, setNotebookStorageScope, saveOutput, saveNotebookQuizResponse } from '../src/lib/notebook.ts';

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

function quizNotebook() {
  const notebook = createNotebook('Mechanics', 'Physics');
  const output = { kind: 'quiz', title: 'Practice', content: 'Questions', generatedAt: new Date().toISOString(),
    quiz: [0, 1].map(() => ({ id: 'duplicate-model-id', type: 'short', question: 'What is impulse?', options: [], answer: 'Change in momentum', explanation: 'Impulse changes momentum.', marks: 1 })) };
  return { notebook: saveOutput(notebook.id, output), output };
}

test('quiz answers and confidence persist by position and remain account-scoped', () => {
  const { notebook } = quizNotebook();
  const outputId = notebook.outputs[0].id;
  saveNotebookQuizResponse(notebook.id, outputId, 0, { answer: 'Change in velocity', confidence: 80 });
  saveNotebookQuizResponse(notebook.id, outputId, 1, { answer: 'Change in momentum', confidence: 40 });
  const saved = listNotebooks()[0].outputs[0].quizResponses;
  assert.equal(saved[0].answer, 'Change in velocity');
  assert.equal(saved[1].confidence, 40);
  setNotebookStorageScope('other-owner');
  assert.equal(listNotebooks().length, 0);
  assert.throws(() => saveNotebookQuizResponse(notebook.id, outputId, 0, { answer: 'Cross-account' }), /no longer available/);
  setNotebookStorageScope('test-owner');
  assert.deepEqual(listNotebooks()[0].outputs[0].quizResponses, saved);
});

test('revealing preserves original responses and confidence but permits saved reflection', () => {
  const { notebook } = quizNotebook();
  const outputId = notebook.outputs[0].id;
  saveNotebookQuizResponse(notebook.id, outputId, 0, { answer: 'Velocity', confidence: 80 });
  const revealedAt = '2026-09-21T10:00:00Z';
  saveNotebookQuizResponse(notebook.id, outputId, 0, { revealedAt });
  assert.throws(() => saveNotebookQuizResponse(notebook.id, outputId, 0, { answer: 'Changed' }), /original response/);
  assert.throws(() => saveNotebookQuizResponse(notebook.id, outputId, 0, { confidence: undefined }), /original response/);
  saveNotebookQuizResponse(notebook.id, outputId, 0, { reflection: 'needs-review', revealedAt: '2026-09-22T10:00:00Z' });
  const response = listNotebooks()[0].outputs[0].quizResponses[0];
  assert.equal(response.revealedAt, revealedAt);
  assert.equal(response.reflection, 'needs-review');
  assert.equal(response.evidence, undefined, 'self-checks cannot masquerade as measured mastery');
});

test('regenerating a quiz retains attempted versions and source references', () => {
  const { notebook, output } = quizNotebook();
  const firstId = notebook.outputs[0].id;
  saveNotebookQuizResponse(notebook.id, firstId, 0, { answer: 'Saved work' });
  const updated = saveOutput(notebook.id, { ...output, sourceIds: ['source-1'] });
  assert.equal(updated.outputs.length, 2);
  assert.deepEqual(updated.outputs[0].sourceIds, ['source-1']);
  assert.equal(updated.outputs[1].id, firstId);
  assert.equal(updated.outputs[1].quizResponses[0].answer, 'Saved work');
  assert.equal(saveOutput(notebook.id, output).outputs.length, 2, 'untouched preview can be replaced');
});

test('invalid or failed quiz writes preserve existing notebook data', () => {
  const { notebook } = quizNotebook();
  const outputId = notebook.outputs[0].id;
  const saved = listNotebooks();
  for (const patch of [{ answer: 'x'.repeat(12001) }, { confidence: 73 }, { reflection: 'understood' }, { revealedAt: 'invalid-date' }]) {
    assert.throws(() => saveNotebookQuizResponse(notebook.id, outputId, 0, patch));
    assert.deepEqual(listNotebooks(), saved);
  }
  assert.throws(() => saveNotebookQuizResponse(notebook.id, outputId, 9, { answer: 'Missing question' }));
  const setItem = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => saveNotebookQuizResponse(notebook.id, outputId, 0, { answer: 'Not saved' }), /Quota/);
  globalThis.localStorage.setItem = setItem;
  assert.deepEqual(listNotebooks(), saved);
});
