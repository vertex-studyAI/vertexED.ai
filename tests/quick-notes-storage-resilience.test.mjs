import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  MAX_QUICK_NOTE_CONTENT,
  MAX_QUICK_NOTE_TITLE,
  MAX_QUICK_NOTES,
  normalizeQuickNotes,
} from '../src/lib/quickNotesStorage.mjs';

const source = fs.readFileSync('src/pages/study-zone/components/NoteTaker.tsx', 'utf8');
const studyStatsSource = fs.readFileSync('src/lib/studyStats.ts', 'utf8');

const valid = {
  id: 'note-1',
  title: 'Exam prep outline',
  content: '<p>Review cubic factorisation.</p>',
  updatedAt: '2026-09-19T10:00:00.000Z',
};

test('quick-notes normalization rejects malformed roots and rows', () => {
  assert.deepEqual(normalizeQuickNotes(null), []);
  assert.deepEqual(normalizeQuickNotes({ id: 'not-an-array' }), []);

  const normalized = normalizeQuickNotes([
    null,
    'bad',
    { ...valid, id: '' },
    { ...valid, title: '' },
    { ...valid, content: '   ' },
    { ...valid, updatedAt: 'not-a-date' },
    { ...valid, content: 42 },
    valid,
    { ...valid, title: 'duplicate id' },
  ]);

  assert.deepEqual(normalized, [valid]);
});

test('quick-notes normalization bounds stored state and trims oversized fields', () => {
  const rows = Array.from({ length: MAX_QUICK_NOTES + 4 }, (_, index) => ({
    id: `note-${index}`,
    title: `  ${'t'.repeat(MAX_QUICK_NOTE_TITLE + 20)}  `,
    content: `  ${'c'.repeat(MAX_QUICK_NOTE_CONTENT + 20)}  `,
    updatedAt: `2026-09-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
  }));
  const normalized = normalizeQuickNotes(rows);

  assert.equal(normalized.length, MAX_QUICK_NOTES);
  assert.equal(normalized[0].title.length, MAX_QUICK_NOTE_TITLE);
  assert.equal(normalized[0].content.length, MAX_QUICK_NOTE_CONTENT);
  assert.equal(normalized[0].id, 'note-0');
});

test('NoteTaker normalizes stored state and avoids silent empty saves', () => {
  assert.match(source, /useLocalStorage<unknown>\(notesKey, \[\]\)/);
  assert.match(source, /normalizeQuickNotes\(storedNotes\)/);
  assert.match(source, /normalizeQuickNotes\(next\)/);
  assert.match(source, /Add a title and some note text before saving\./);
  assert.match(source, /Quick notes stay on this account on the current device\./);
  assert.doesNotMatch(source, /useLocalStorage<Note\[\]>/);
  assert.doesNotMatch(source, /window\.localStorage\.(?:getItem|setItem|removeItem)/);
});

test('study stats counts only structurally valid quick notes', () => {
  assert.match(studyStatsSource, /normalizeQuickNotes\(readArray\(quickNotes\)\)/);
});
