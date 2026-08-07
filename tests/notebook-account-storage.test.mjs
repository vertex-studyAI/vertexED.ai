import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  normalizeNotebookStorageScope,
  notebookStorageKeys,
} from '../src/lib/notebookStorageScope.mjs';

const notebookSource = fs.readFileSync('src/lib/notebook.ts', 'utf8');
const syncSource = fs.readFileSync('src/lib/notebookSync.ts', 'utf8');

test('Study Notebook device keys are isolated per account', () => {
  const first = notebookStorageKeys('11111111-1111-4111-8111-111111111111');
  const second = notebookStorageKeys('22222222-2222-4222-8222-222222222222');

  assert.notEqual(first.notebooks, second.notebooks);
  assert.notEqual(first.updatedAt, second.updatedAt);
  assert.match(first.notebooks, /^vertex_notebooks:/);
  assert.match(second.notebooks, /^vertex_notebooks:/);
});

test('unhydrated storage cannot fall through to the legacy shared notebook key', () => {
  assert.equal(normalizeNotebookStorageScope(null), 'unhydrated');
  assert.equal(normalizeNotebookStorageScope('  '), 'unhydrated');
  assert.equal(normalizeNotebookStorageScope('user/name@example.com'), 'user%2Fname%40example.com');
  assert.doesNotMatch(notebookSource, /vertex_study_notebooks_v1/);
  assert.match(notebookSource, /activeNotebookStorageKey\(\)/);
});

test('notebook sync resolves the authenticated account before local reads and writes', () => {
  assert.match(syncSource, /supabase\.auth\.getSession\(\)/);
  assert.match(syncSource, /const resolvedScope = await resolveStorageScope\(storageScope\)/);
  assert.match(syncSource, /setNotebookStorageScope\(resolvedScope\)/);
  assert.match(syncSource, /readLocalSnapshot\(resolvedScope\)/);
  assert.match(syncSource, /writeLocalNotebookSnapshot\(snapshot, resolvedScope\)/);
});

test('account rehydration invalidates notebook write ownership before network work', () => {
  assert.match(syncSource, /let hydratedStorageScope: string \| null \| undefined/);
  assert.match(syncSource, /hydratedStorageScope = undefined;\n  const resolvedScope = await resolveStorageScope/);
  assert.match(syncSource, /hydratedStorageScope = resolvedScope/);
  assert.match(syncSource, /hydratedStorageScope === undefined \|\| hydratedStorageScope !== resolvedScope/);
  assert.match(syncSource, /Waiting for the current account notebook snapshot to finish loading/);
});
