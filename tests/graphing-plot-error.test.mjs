import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { graphingPlotError } from '../src/lib/graphingPlotError.mjs';

test('graphingPlotError preserves controlled plot validation copy', () => {
  assert.equal(graphingPlotError(new Error('Enter a function of x.')), 'Enter a function of x.');
  assert.equal(
    graphingPlotError(new Error('That function has no visible values in this window.')),
    'That function has no visible values in this window.',
  );
});

test('graphingPlotError never echoes raw parser or provider details', () => {
  assert.equal(graphingPlotError(new Error('Unexpected token # at position 4')), 'Could not plot this function.');
  assert.doesNotMatch(graphingPlotError(new Error('openai stack dump')), /openai|stack/i);
  assert.equal(graphingPlotError(new Error('postgres RLS leak')), 'Could not plot this function.');
});

test('GraphingSuite wires graphingPlotError', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/study-zone/components/GraphingSuite.tsx'), 'utf8');
  assert.match(source, /import \{ graphingPlotError \} from '@\/lib\/graphingPlotError\.mjs'/);
  assert.match(source, /graphingPlotError\(error\)/);
  assert.doesNotMatch(source, /error instanceof Error \? error\.message/);
});
