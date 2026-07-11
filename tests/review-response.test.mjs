import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReviewResponse } from '../api/_lib/reviewResponse.js';

test('normalizeReviewResponse maps plain string output', () => {
  const result = normalizeReviewResponse('  Good work.  ');
  assert.equal(result.safe_text, 'Good work.');
  assert.equal(result.output, 'Good work.');
  assert.equal(result.blocked, false);
});

test('normalizeReviewResponse maps safe_text field', () => {
  const result = normalizeReviewResponse({ safe_text: 'Score: 8/10' });
  assert.equal(result.safe_text, 'Score: 8/10');
  assert.equal(result.blocked, false);
});

test('normalizeReviewResponse blocks on guardrail failure', () => {
  const result = normalizeReviewResponse({ moderation: { failed: true } });
  assert.equal(result.blocked, true);
  assert.match(result.safe_text, /content safety/i);
  assert.equal(result.output, '');
  assert.ok(result.guardrails);
});

test('normalizeReviewResponse handles null', () => {
  const result = normalizeReviewResponse(null);
  assert.equal(result.safe_text, '');
  assert.equal(result.blocked, false);
});
