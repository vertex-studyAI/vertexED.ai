import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeReviewImages } from '../api/_lib/reviewVision.js';

test('unpriced review image requests fail before any SDK provider call', async () => {
  let calls = 0;
  const client = { responses: { create: async () => { calls++; return { output_text: 'unsafe paid request' }; } } };
  await assert.rejects(describeReviewImages(client, ['data:image/png;base64,AAAA']), { code: 'AI_MODEL_UNSUPPORTED' });
  assert.equal(calls, 0);
});

test('model overrides cannot enable unpriced image dispatch', async t => {
  const original = process.env.OPENAI_REVIEW_VISION_MODEL;
  process.env.OPENAI_REVIEW_VISION_MODEL = 'gpt-4.1-mini';
  t.after(() => { if (original === undefined) delete process.env.OPENAI_REVIEW_VISION_MODEL; else process.env.OPENAI_REVIEW_VISION_MODEL = original; });
  await assert.rejects(describeReviewImages({ responses: { create: () => assert.fail('must not dispatch') } }, ['data:image/jpeg;base64,AAAA']), { code: 'AI_MODEL_UNSUPPORTED' });
});

test('describeReviewImages is a no-op for text-only reviews', async () => {
  assert.equal(await describeReviewImages({ responses: { create: () => assert.fail('must not dispatch') } }, []), '');
});
