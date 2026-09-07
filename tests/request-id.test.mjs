import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeRequestId } from '../api/[[...path]].js';

test('request IDs accept bounded trace tokens and replace unsafe input', () => {
  assert.equal(normalizeRequestId('trace_123:child-4'), 'trace_123:child-4');
  const unsafe = normalizeRequestId('bad\nheader');
  assert.match(unsafe, /^[0-9a-f-]{36}$/i);
  assert.notEqual(normalizeRequestId('x'.repeat(81)), 'x'.repeat(81));
});
