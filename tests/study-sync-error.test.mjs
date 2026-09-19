import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { studySyncError } from '../src/lib/studySyncError.mjs';

test('studySyncError never echoes raw provider or database details', () => {
  assert.doesNotMatch(studySyncError(new Error('postgres RLS policy detail')), /postgres|RLS/);
  assert.doesNotMatch(studySyncError(new Error('OpenAI 429 org-secret')), /org-secret|OpenAI/);
  assert.match(studySyncError(new Error('Failed to fetch')), /could not reach cloud sync/i);
  assert.match(studySyncError(new Error('429 rate limit')), /Too many sync requests/i);
  assert.match(studySyncError(new Error('stack dump'), 'update'), /Could not update/i);
  assert.match(studySyncError(new Error('stack dump'), 'delete'), /Could not delete/i);
  assert.match(studySyncError(new Error('stack dump'), 'load'), /showing device saves/i);
});

test('studySyncError preserves known product sync copy', () => {
  assert.equal(studySyncError(new Error('Your session is unavailable.')), 'Your session is unavailable.');
  assert.equal(
    studySyncError(new Error('Invalid cloud snapshot. Local work was preserved.'), 'local-fallback'),
    'Invalid cloud snapshot. Local work was preserved.',
  );
  assert.equal(
    studySyncError('Session history is unavailable on this device.', 'load'),
    'Session history is unavailable on this device.',
  );

  assert.equal(
    studySyncError(new Error('Cloud sync timed out; using planner saved on this device')),
    'Cloud sync timed out; using planner saved on this device',
  );
});

test('userContent plannerSync and notebookSync wire studySyncError', () => {
  const userContent = readFileSync(new URL('../src/lib/userContent.ts', import.meta.url), 'utf8');
  const planner = readFileSync(new URL('../src/lib/plannerSync.ts', import.meta.url), 'utf8');
  const notebook = readFileSync(new URL('../src/lib/notebookSync.ts', import.meta.url), 'utf8');
  const admin = readFileSync(new URL('../api/_handlers/admin-status.js', import.meta.url), 'utf8');
  assert.match(userContent, /studySyncError\(err, 'update'\)/);
  assert.match(userContent, /studySyncError\(err, 'delete'\)/);
  assert.match(userContent, /studySyncError\(err, 'load'\)/);
  assert.doesNotMatch(userContent, /error: err instanceof Error \? err\.message/);
  assert.match(planner, /studySyncError\(err, 'local-fallback'\)/);
  assert.doesNotMatch(planner, /err instanceof Error \? err\.message/);
  assert.match(notebook, /studySyncError\(err, 'local-fallback'\)/);
  assert.doesNotMatch(notebook, /err instanceof Error \? err\.message/);
  assert.match(admin, /rateLimitUserEndpoint\(user\.id, 'admin-status'/);
});
