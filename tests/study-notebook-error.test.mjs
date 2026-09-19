import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { studyNotebookError } from '../src/lib/studyNotebookError.mjs';

test('studyNotebookError never echoes raw provider/storage details', () => {
  assert.match(studyNotebookError(new Error('QuotaExceededError: persistence failed'), 'save'), /storage/i);
  assert.doesNotMatch(studyNotebookError(new Error('QuotaExceededError: persistence failed'), 'save'), /QuotaExceededError/);
  assert.match(studyNotebookError(new Error('OpenAI 503 upstream xyz'), 'generate'), /Could not generate notebook output/i);
  assert.doesNotMatch(studyNotebookError(new Error('OpenAI 503 upstream xyz'), 'generate'), /upstream xyz/);
});

test('StudyNotebook wires studyNotebookError for save and generate failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/StudyNotebook.tsx'), 'utf8');
  assert.match(source, /import \{ studyNotebookError \} from '@\/lib\/studyNotebookError\.mjs'/);
  assert.match(source, /studyNotebookError\(error, ['"]save['"]\)/);
  assert.match(source, /studyNotebookError\(e, ['"]generate['"]\)/);
  assert.doesNotMatch(source, /description: error instanceof Error \? error\.message/);
  assert.doesNotMatch(source, /description: e instanceof Error \? e\.message/);
});
