import test from 'node:test';
import assert from 'node:assert/strict';
import { filterSavedWork } from '../src/lib/filterSavedWork.mjs';

const items = [
  { id: 'a', title: 'Velocity', kind: 'note', updated_at: '2026-09-20', payload: { notes: 'Momentum depends on mass' } },
  { id: 'b', title: 'Biology attempt', kind: 'review', updated_at: '2026-09-21', localOnly: true, payload: { metadata: { subject: 'Biology', question: 'Explain osmosis' } } },
  { id: 'c', title: null, kind: 'notebook', updated_at: '2026-09-19', payload: {} },
];
test('saved work filters combine source search, type and actual save location without changing the collection', () => {
  assert.deepEqual(filterSavedWork(items, { query: 'BIOLOGY osmosis', kind: 'review', location: 'device' }).map(item => item.id), ['b']);
  assert.equal(filterSavedWork(items, { query: 'osmosis', location: 'cloud' }).length, 0);
  assert.deepEqual(filterSavedWork(items, { query: 'momentum mass' }).map(item => item.id), ['a']);
  assert.deepEqual(filterSavedWork(items).map(item => item.id), ['b', 'a', 'c']);
  assert.deepEqual(filterSavedWork(items, { sort: 'title' }).map(item => item.id), ['b', 'c', 'a']);
  assert.deepEqual(items.map(item => item.id), ['a', 'b', 'c']);
});
