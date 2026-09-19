import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { onboardingError } from '../src/lib/onboardingError.mjs';

test('onboardingError never echoes Auth/Postgres/provider details', () => {
  assert.match(onboardingError(new Error('AuthApiError: JWT expired secret')), /session is not ready/i);
  assert.doesNotMatch(onboardingError(new Error('AuthApiError: JWT expired secret')), /JWT expired|secret/);
  assert.match(onboardingError(new Error('postgres RLS policy detail')), /Could not save your setup/i);
  assert.doesNotMatch(onboardingError(new Error('postgres RLS policy detail')), /postgres|RLS/);
  assert.match(onboardingError(new Error('Failed to fetch')), /connection/i);
  assert.match(onboardingError(new Error('too many requests')), /Too many save attempts/i);
  assert.equal(
    onboardingError(new Error('Invalid cloud response. Local work was preserved.')),
    'Invalid cloud response. Local work was preserved.',
  );
  assert.equal(
    onboardingError(new Error('Invalid cloud snapshot. Local work was preserved.')),
    'Invalid cloud snapshot. Local work was preserved.',
  );
});

test('Onboarding wires onboardingError instead of raw err.message', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/pages/Onboarding.tsx'), 'utf8');
  assert.match(source, /import \{ onboardingError \} from ["']@\/lib\/onboardingError\.mjs["']/);
  assert.match(source, /setError\(onboardingError\(err\)\)/);
  assert.doesNotMatch(source, /function getErrorMessage/);
  assert.doesNotMatch(source, /setError\(getErrorMessage\(/);
  assert.doesNotMatch(source, /return \(err as \{ message: string \}\)\.message/);
});
