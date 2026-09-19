import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('examSessionStore never surfaces raw storage exception messages', () => {
  const source = readFileSync(new URL('../src/lib/examSessionStore.ts', import.meta.url), 'utf8');
  assert.match(source, /Session history is unavailable on this device\./);
  assert.doesNotMatch(source, /error instanceof Error \? error\.message/);
});
