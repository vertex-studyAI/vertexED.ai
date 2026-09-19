import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { resourceGuideError } from '../src/lib/resourceGuideError.mjs';

test('resourceGuideError never echoes raw provider/API details', () => {
  assert.match(resourceGuideError(new Error('OpenAI 429 rate limit exceeded for org-xyz')), /Too many guide requests/i);
  assert.doesNotMatch(resourceGuideError(new Error('OpenAI 429 rate limit exceeded for org-xyz')), /org-xyz/);
  assert.match(resourceGuideError(new Error('Failed to fetch')), /connection/i);
  assert.match(resourceGuideError(new Error('Unauthorized 401')), /Sign in/i);
  assert.match(resourceGuideError(new Error('secret stack trace')), /Could not generate this guide/i);
  assert.doesNotMatch(resourceGuideError(new Error('secret stack trace')), /secret stack trace/);
});

test('ResourceLibrary wires resourceGuideError for generation failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/ResourceLibrary.tsx'), 'utf8');
  assert.match(source, /import \{ resourceGuideError \} from '@\/lib\/resourceGuideError\.mjs'/);
  assert.match(source, /setError\(resourceGuideError\(err\)\)/);
  assert.doesNotMatch(source, /setError\(err instanceof Error \? err\.message/);
});
