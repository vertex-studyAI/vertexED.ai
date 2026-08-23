import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateReviewImages } from '../api/_lib/security.js';

test('review image validation accepts the browser Attachment shape and normalizes it to data URLs', () => {
  const questionImage = {
    id: 'question-1',
    src: 'data:image/png;base64,AAAA',
    name: 'question.png',
  };
  const answerImage = {
    id: 'answer-1',
    src: 'data:image/jpeg;base64,BBBB',
    name: 'answer.jpg',
  };

  const result = validateReviewImages([questionImage, answerImage]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.images, [questionImage.src, answerImage.src]);
});

test('review image validation still fails closed for malformed attachment objects', () => {
  assert.equal(validateReviewImages([{ id: 'missing-src' }]).ok, false);
  assert.equal(validateReviewImages([{ src: 'https://example.com/image.png' }]).ok, false);
  assert.equal(validateReviewImages([{ src: 'data:image/png;base64,%%%%' }]).ok, false);
});

test('review image validation remains backward compatible with raw data URLs', () => {
  const image = 'data:image/webp;base64,AAAA';
  const result = validateReviewImages([image]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.images, [image]);
});
