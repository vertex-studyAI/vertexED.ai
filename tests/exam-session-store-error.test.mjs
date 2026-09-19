import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { studySyncError } from '../src/lib/studySyncError.mjs';

test('examSessionStore sanitizes history read failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/lib/examSessionStore.ts'), 'utf8');
  assert.match(source, /studySyncError\(/);
  assert.doesNotMatch(source, /error instanceof Error \? error\.message : 'Session history/);
});

test('studySyncError preserves session-history unavailable copy', () => {
  assert.equal(
    studySyncError('Session history is unavailable on this device.', 'load'),
    'Session history is unavailable on this device.',
  );
  assert.doesNotMatch(studySyncError(new Error('postgres RLS jwt leak'), 'load'), /postgres|jwt|RLS/i);
});
