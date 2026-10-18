import test from 'node:test';
import assert from 'node:assert/strict';
import { searchResources, normaliseResourceQuery } from '../src/lib/resourceSearch.ts';

const entries = [
  { title: 'Physics', description: 'Subject learning', keywords: 'waves electricity', meta: 'MYP' },
  { title: 'Wave speed', description: 'Connect speed and frequency', keywords: 'physics wavelength', meta: 'Formula' },
  { title: 'Español', description: 'Language practice', keywords: 'Spanish', meta: 'MYP' },
];

test('resource search matches multiple words across fields regardless of order', () => {
  assert.equal(searchResources(entries, 'frequency physics')[0].title, 'Wave speed');
  assert.equal(searchResources(entries, 'physics frequency')[0].title, 'Wave speed');
  assert.deepEqual(searchResources(entries, 'physics unavailable'), []);
});

test('exact titles rank first and accents, case and punctuation are normalised', () => {
  assert.equal(searchResources(entries, 'PHYSICS')[0].title, 'Physics');
  assert.equal(searchResources(entries, 'espanol')[0].title, 'Español');
  assert.equal(searchResources(entries, 'wave-speed')[0].title, 'Wave speed');
  assert.equal(normaliseResourceQuery('  P.H.  '), 'p h');
  assert.deepEqual(searchResources(entries, '   '), entries);
  assert.deepEqual(searchResources(entries, '!!!'), entries);
});

test('ranking is stable and does not mutate the input registry', () => {
  const before = structuredClone(entries);
  searchResources(entries, 'waves');
  assert.deepEqual(entries, before);
  const ties = entries.map((entry) => ({ ...entry, keywords: 'shared' }));
  assert.deepEqual(searchResources(ties, 'shared'), ties);
});
