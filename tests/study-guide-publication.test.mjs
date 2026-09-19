import assert from 'node:assert/strict';
import test from 'node:test';

import { isPublishableGuide, publicationFilteredManifest } from '../src/lib/studyGuidePublication.mjs';

const completeEntry = {
  path: '/study-guides/myp/biology/overview.md',
  editorialStatus: 'approved',
  publicationStatus: 'published',
  source: 'https://example.edu/source',
  factualReviewer: 'Qualified reviewer',
  reviewedAt: '2026-09-14T00:00:00.000Z',
  license: 'CC BY 4.0',
  permittedUse: 'adaptation-with-attribution',
};

test('guide publication fails closed when any evidence field is absent or unresolved', () => {
  assert.equal(isPublishableGuide(completeEntry), true);
  for (const [field, value] of [
    ['editorialStatus', 'unreviewed'],
    ['publicationStatus', 'held-from-index'],
    ['source', null],
    ['factualReviewer', ''],
    ['reviewedAt', 'not-a-date'],
    ['license', 'unknown'],
    ['permittedUse', 'not-yet-determined'],
  ]) {
    assert.equal(isPublishableGuide({ ...completeEntry, [field]: value }), false, field);
  }
});

test('the learner manifest contains only fully publishable pages and removes empty subjects', () => {
  const heldPath = '/study-guides/myp/history/overview.md';
  const manifest = {
    programme: 'MYP',
    subjects: [
      { name: 'Biology', slug: 'biology', pages: [{ path: completeEntry.path, title: 'Biology', relativePath: 'overview.md' }] },
      { name: 'History', slug: 'history', pages: [{ path: heldPath, title: 'History', relativePath: 'overview.md' }] },
    ],
  };
  const filtered = publicationFilteredManifest(manifest, [completeEntry, { ...completeEntry, path: heldPath, editorialStatus: 'quarantined' }]);
  assert.deepEqual(filtered.subjects.map((subject) => subject.slug), ['biology']);
  assert.deepEqual(filtered.subjects[0].pages.map((page) => page.path), [completeEntry.path]);
  assert.equal(manifest.subjects.length, 2, 'the source manifest is not mutated');
});
