import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  describeReviewImages,
  ReviewImageProcessingError,
} from '../api/_lib/reviewVision.js';

function mockClient(create) {
  return { chat: { completions: { create } } };
}

test('describeReviewImages returns trimmed evidence and forwards every image', async () => {
  let captured;
  const client = mockClient(async (request) => {
    captured = request;
    return { choices: [{ message: { content: '  Question: solve x. Answer: x = 2.  ' } }] };
  });

  const images = [
    'data:image/png;base64,AAAA',
    'data:image/jpeg;base64,BBBB',
  ];
  const result = await describeReviewImages(client, images);

  assert.equal(result, 'Question: solve x. Answer: x = 2.');
  assert.equal(captured.model, 'gpt-4o');
  assert.equal(captured.messages[0].content.length, 3);
  assert.equal(captured.messages[0].content[1].image_url.url, images[0]);
  assert.equal(captured.messages[0].content[2].image_url.url, images[1]);
});

test('describeReviewImages fails closed on provider errors', async () => {
  const client = mockClient(async () => {
    throw new Error('provider unavailable');
  });

  await assert.rejects(
    () => describeReviewImages(client, ['data:image/png;base64,AAAA']),
    (error) => error instanceof ReviewImageProcessingError && error.retryable === true,
  );
});

test('describeReviewImages fails closed on empty vision output', async () => {
  const client = mockClient(async () => ({ choices: [{ message: { content: '   ' } }] }));

  await assert.rejects(
    () => describeReviewImages(client, ['data:image/png;base64,AAAA']),
    (error) => error instanceof ReviewImageProcessingError,
  );
});

test('describeReviewImages is a no-op for text-only reviews', async () => {
  let calls = 0;
  const client = mockClient(async () => {
    calls += 1;
    return { choices: [] };
  });

  assert.equal(await describeReviewImages(client, []), '');
  assert.equal(calls, 0);
});
