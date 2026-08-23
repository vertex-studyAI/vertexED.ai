import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateReviewImages } from '../api/_lib/security.js';

test('missing review image fields are treated as no images', () => {
  assert.deepEqual(validateReviewImages(undefined), { ok: true, images: [] });
  assert.deepEqual(validateReviewImages(null), { ok: true, images: [] });
});

test('malformed non-array review image fields fail closed', () => {
  for (const value of [
    'data:image/png;base64,AAAA',
    { src: 'data:image/png;base64,AAAA' },
    42,
    true,
  ]) {
    const result = validateReviewImages(value);
    assert.equal(result.ok, false);
    assert.match(result.error, /array/i);
  }
});

test('valid review image arrays remain accepted', () => {
  const result = validateReviewImages([{ id: 'image-1', src: 'data:image/png;base64,AAAA' }]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.images, ['data:image/png;base64,AAAA']);
});
