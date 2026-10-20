import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { artifactFolder, artifactFolderNames, normaliseArtifactFolder, withArtifactFolder } from '../src/lib/artifactFolders.mjs';
import { filterSavedWork } from '../src/lib/filterSavedWork.mjs';

const note = { id: 'note-1', kind: 'note', title: 'Cells', updated_at: '2026-10-20T12:00:00.000Z', payload: { notes: 'Membranes', organisation: { folder: ' Biology   HL ' } } };

test('folder metadata is bounded, namespaced and preserves a study payload', () => {
  assert.equal(normaliseArtifactFolder('  Biology   HL  '), 'Biology HL');
  assert.equal(normaliseArtifactFolder(''), null);
  assert.equal(artifactFolder(note), 'Biology HL');
  assert.deepEqual(withArtifactFolder(note.payload, 'Revision'), { notes: 'Membranes', organisation: { folder: 'Revision' } });
  assert.deepEqual(withArtifactFolder(note.payload, null), { notes: 'Membranes' });
});

test('folder names and filters use persisted artifact metadata only', () => {
  const other = { ...note, id: 'note-2', payload: { notes: 'Equilibrium', organisation: { folder: 'Chemistry' } } };
  assert.deepEqual(artifactFolderNames([note, other, note]), ['Biology HL', 'Chemistry']);
  assert.deepEqual(filterSavedWork([note, other], { folder: 'Chemistry' }).map((item) => item.id), ['note-2']);
});

test('saved work uses the account-scoped update API for moves, renames and removal', () => {
  const list = fs.readFileSync('src/components/SavedWorkList.tsx', 'utf8');
  const page = fs.readFileSync('src/pages/SavedWork.tsx', 'utf8');
  assert.match(list, /updateStudyArtifact\(item\.id, \{ payload: withArtifactFolder/);
  assert.match(list, /Create new folder/);
  assert.match(page, /Rename folder/);
  assert.match(page, /Load more first if more work is available/);
});
