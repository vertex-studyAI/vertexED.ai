import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { waitlistAdminError } from '../src/lib/waitlistAdminError.mjs';

test('waitlistAdminError never echoes raw upstream text', () => {
  assert.doesNotMatch(waitlistAdminError(new Error('Postgrest RLS secret'), 'load'), /Postgrest|secret/);
  assert.match(waitlistAdminError(new Error('Postgrest RLS secret'), 'load'), /Could not load the waitlist/i);
  assert.match(waitlistAdminError(new Error('forbidden'), 'update'), /not allowed/i);
});

test('WaitlistAdmin wires waitlistAdminError', () => {
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/pages/admin/WaitlistAdmin.tsx'), 'utf8');
  assert.match(source, /waitlistAdminError\(err, 'load'\)/);
  assert.match(source, /waitlistAdminError\(err, 'update'\)/);
  assert.doesNotMatch(source, /setError\(err instanceof Error \? err\.message/);
});
