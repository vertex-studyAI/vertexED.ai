import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { apexChatError } from '../src/lib/apexChatError.mjs';

test('apexChatError never echoes raw provider or payload details', () => {
  assert.match(apexChatError(new Error('OpenAI org-secret quota dump'), 503), /temporarily unavailable/i);
  assert.doesNotMatch(apexChatError(new Error('OpenAI org-secret quota dump'), 503), /org-secret|OpenAI/);
  assert.match(apexChatError(new Error('postgres jwt rls leak'), 500), /temporarily unavailable/i);
  assert.doesNotMatch(apexChatError(new Error('postgres jwt rls leak'), 500), /postgres|jwt|rls/i);
  assert.match(apexChatError(new Error('Failed to fetch'), null), /connection|reach/i);
  assert.match(apexChatError(new Error('too many requests'), 429), /too quickly/i);
  assert.match(apexChatError(new Error('unauthorized token'), 401), /log in again/i);
  assert.match(apexChatError(new Error('upstream dump without status')), /temporarily unavailable/i);
  assert.doesNotMatch(apexChatError(new Error('upstream dump without status')), /upstream dump/);
});

test('useApexChat wires apexChatError for request failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/hooks/useApexChat.ts'), 'utf8');
  assert.match(source, /import \{ apexChatError \} from ['"]@\/lib\/apexChatError\.mjs['"]/);
  assert.match(source, /apexChatError\(err,\s*status\)/);
  assert.doesNotMatch(source, /status === 503 && err instanceof Error\s*\n\s*\? err\.message/);
  assert.doesNotMatch(source, /err instanceof Error\s*\n\s*\? err\.message/);
});
