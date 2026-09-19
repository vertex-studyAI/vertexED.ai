import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('GraphingSuite never surfaces raw plot/parser error.message', () => {
  const source = readFileSync(new URL('../src/pages/study-zone/components/GraphingSuite.tsx', import.meta.url), 'utf8');
  assert.match(source, /Could not plot this function\./);
  assert.doesNotMatch(source, /error instanceof Error \? error\.message/);
});
