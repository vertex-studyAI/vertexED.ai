import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { savedWorkError } from '../src/lib/savedWorkError.mjs';

test('savedWorkError never echoes raw provider/stack details', () => {
  assert.match(savedWorkError(new Error('401 unauthorized token=abc'), 'delete'), /Sign in again/);
  assert.doesNotMatch(savedWorkError(new Error('401 unauthorized token=abc'), 'delete'), /token=abc/);
  assert.match(savedWorkError('429 Too Many Requests'), /Too many saved-work requests/);
  assert.match(savedWorkError(new Error('Failed to fetch'), 'delete'), /connection/i);
  assert.match(savedWorkError(new Error('QuotaExceededError'), 'delete'), /Browser storage/);
  assert.match(savedWorkError(new Error('ECONNREFUSED 127.0.0.1 password=secret'), 'delete'), /Could not delete/);
  assert.doesNotMatch(savedWorkError(new Error('ECONNREFUSED 127.0.0.1 password=secret'), 'delete'), /password|ECONNREFUSED|127\.0\.0\.1/);
  assert.match(savedWorkError(new Error('boom'), 'open'), /Could not open/);
});

test('SavedWorkList wires savedWorkError for delete toast failures', () => {
  const source = fs.readFileSync('src/components/SavedWorkList.tsx', 'utf8');
  assert.match(source, /import \{ savedWorkError \} from ['"]@\/lib\/savedWorkError\.mjs['"]/);
  assert.match(source, /savedWorkError\(result\.error, ['"]delete['"]\)/);
  assert.doesNotMatch(source, /description:\s*result\.error/);
});
