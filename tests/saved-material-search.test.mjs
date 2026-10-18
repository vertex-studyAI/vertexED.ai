import assert from 'node:assert/strict';
import test from 'node:test';
import { filterSavedWork } from '../src/lib/filterSavedWork.mjs';
import { notebookSearchEntries, resolveNotebookSearchLocation, studyMaterialText } from '../src/lib/savedWorkText.mjs';
import { mergedSavedWorkSearchEntries, savedWorkSearchEntries } from '../src/lib/savedWorkSearch.ts';
import { learningSearchEntries, readPersonalSearchIndex } from '../src/lib/learningSearch.ts';

const longSource = `${'Earlier passage. '.repeat(2000)}Late-page distinction between impulse and force.`;
const notebook = { id: 'notebook&1', title: 'Mechanics notebook', subject: 'Physics', sources: [
  { id: 'source/2?x', title: 'Worksheet Δp', content: longSource },
], outputs: [{ title: 'Generated retrieval', content: 'Check the supplied source.', quiz: [{ question: 'Why does the collision last longer?', answer: 'The force is smaller.' }] }] };
const artifact = (id, kind, payload) => ({ id, kind, title: `Saved ${kind}`, payload, updated_at: '2026-10-16T00:00:00Z' });
const items = [
  artifact('notebook', 'notebook', { notebooks: [notebook] }),
  artifact('conversation', 'conversation', { version: 1, threads: [{ id: 'thread-1', messages: [{ id: 'message-1', role: 'user', text: 'Explain angular acceleration.' }] }] }),
  artifact('paper', 'paper', { paper: { sections: [{ questions: [{ prompt: 'Compare isotopes of carbon.' }] }] } }),
  artifact('review', 'review', { review: 'Distinguish mass from weight.', metadata: { answer: 'The gravitational field acts on the object.' } }),
  artifact('note', 'note', { notes: 'A short note.', flashcards: [{ front: 'Define osmosis.', back: 'Water moves across a partially permeable membrane.' }] }),
  artifact('planner', 'planner', { tasks: [{ title: 'Revisit photosynthesis', description: 'Use the chloroplast diagram.' }] }),
];

test('saved-work search reaches sources, generated questions, papers, answers, conversations and plans', () => {
  for (const [query, expected] of [
    ['Late-page distinction', 'notebook'], ['Worksheet Δp', 'notebook'], ['collision last longer', 'notebook'],
    ['angular acceleration', 'conversation'], ['isotopes', 'paper'], ['gravitational field', 'review'],
    ['partially permeable', 'note'], ['chloroplast', 'planner'],
  ]) assert.deepEqual(filterSavedWork(items, { query }).map(item => item.id), [expected], query);
  assert.deepEqual(filterSavedWork(items, { query: 'angular acceleration', kind: 'conversation' }).map(item => item.id), ['conversation']);
  assert.deepEqual(filterSavedWork(items, { query: 'angular acceleration', kind: 'note' }), []);
});

test('global notebook source results preserve full late passages and an exact encoded source destination', () => {
  const entries = savedWorkSearchEntries([items[0]]);
  const source = entries.find(entry => entry.title === 'Worksheet Δp');
  assert.ok(source.keywords.includes('Late-page distinction'));
  const url = new URL(source.to, 'https://study.test');
  assert.equal(url.pathname, '/study-notebook');
  assert.equal(url.searchParams.get('notebook'), notebook.id);
  assert.equal(url.searchParams.get('source'), notebook.sources[0].id);
  assert.ok(entries.every(entry => entry.account));
  assert.ok(entries.find(entry => entry.title === notebook.title).keywords.includes('collision last longer'));
});

test('source destinations only resolve inside the selected notebook and fail clearly after deletion', () => {
  assert.deepEqual(resolveNotebookSearchLocation([notebook], notebook.id, notebook.sources[0].id),
    { notebookId: notebook.id, sourceId: notebook.sources[0].id, error: null });
  const missingSource = resolveNotebookSearchLocation([{ ...notebook, sources: [] }], notebook.id, notebook.sources[0].id);
  assert.equal(missingSource.sourceId, null);
  assert.match(missingSource.error, /no longer/);
  const missingNotebook = resolveNotebookSearchLocation([], notebook.id, notebook.sources[0].id);
  assert.equal(missingNotebook.notebookId, null);
  assert.match(missingNotebook.error, /unavailable in this account/);
});

test('edits and deletion update the index without retaining previous source text', () => {
  const changed = structuredClone(notebook);
  changed.sources[0].content = 'Replacement lesson on torque.';
  assert.ok(!notebookSearchEntries([changed]).some(entry => entry.keywords.includes('Late-page distinction')));
  changed.sources = [];
  assert.ok(!notebookSearchEntries([changed]).some(entry => entry.to.includes('&source=')));
  assert.deepEqual(notebookSearchEntries([]), []);
});

test('device material search stays within the requested account', () => {
  const data = {
    'vertex_notebooks:alice:data': JSON.stringify([notebook]),
    'vertex_notebooks:bob:data': JSON.stringify([{ ...notebook, title: 'Other account secret' }]),
  };
  const storage = { getItem: key => data[key] ?? null };
  const entries = learningSearchEntries('alice', storage, storage);
  assert.ok(entries.some(entry => entry.title === 'Worksheet Δp' && entry.keywords.includes('Late-page distinction')));
  assert.ok(!JSON.stringify(entries).includes('Other account secret'));
});

test('malformed optional material and cycles do not break search or index internal metadata', () => {
  const value = { title: 'Real title', generation: { text: 'provider-internal' }, id: 'secret-id', image: 'base64-private' };
  value.sources = [value, null, { content: 'Readable source' }];
  assert.equal(studyMaterialText(value), 'Real title Readable source');
  assert.deepEqual(notebookSearchEntries([null, { id: 'missing-title' }]), []);
  assert.doesNotThrow(() => filterSavedWork([artifact('broken', 'notebook', { notebooks: [null, { sources: 'broken' }] })], { query: 'x' }));
});

test('pending device deletions suppress stale cloud and legacy conversation search results', () => {
  const values = {
    'vertex_notebooks:alice:data': '[]',
    'vertex_notebooks:alice:updated_at:sync': JSON.stringify({ pending: true }),
    'vertex_apex:alice:history-v1': JSON.stringify({ dirty: true, snapshot: { version: 1, threads: [] } }),
    'vertex_apex:alice:apex-main': JSON.stringify([{ text: 'Legacy content that was cleared', role: 'user' }]),
  };
  const storage = { getItem: key => values[key] ?? null };
  const personal = readPersonalSearchIndex('alice', storage, storage);
  const entries = mergedSavedWorkSearchEntries(items.slice(0, 2), personal);
  assert.ok(!entries.some(entry => entry.area === 'Saved work'));
  assert.ok(!JSON.stringify(entries).includes('Legacy content'));
});

test('a verified cloud snapshot replaces a clean stale device index without duplicate results', () => {
  const values = {
    'vertex_notebooks:alice:data': JSON.stringify([{ ...notebook, title: 'Old device title' }]),
    'vertex_notebooks:alice:updated_at': '2026-10-15T00:00:00Z',
    'vertex_notebooks:alice:updated_at:sync': JSON.stringify({ pending: false, syncedLocalTime: '2026-10-15T00:00:00Z' }),
  };
  const storage = { getItem: key => values[key] ?? null };
  const personal = readPersonalSearchIndex('alice', storage, storage);
  const entries = mergedSavedWorkSearchEntries([items[0]], personal);
  assert.ok(!JSON.stringify(entries).includes('Old device title'));
  assert.equal(entries.filter(entry => entry.title === 'Worksheet Δp').length, 1);
});

test('unsynced durable conversations remain searchable offline within their owning account', () => {
  const values = {
    'vertex_apex:alice:history-v1': JSON.stringify({ dirty: true, snapshot: items[1].payload }),
    'vertex_apex:bob:history-v1': JSON.stringify({ dirty: true, snapshot: { version: 1, threads: [{ id: 'private', messages: [{ id: 'private-message', role: 'user', text: 'Other account secret' }] }] } }),
  };
  const storage = { getItem: key => values[key] ?? null };
  const entries = mergedSavedWorkSearchEntries([], readPersonalSearchIndex('alice', storage, storage));
  assert.ok(entries.some(entry => entry.keywords?.includes('angular acceleration')));
  assert.ok(!JSON.stringify(entries).includes('Other account secret'));
});
