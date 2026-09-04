import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import {
  buildImagePresentManifest,
  SPLIT_MAPPING
} from '../research/multimodal-calibration/freeze-dataset.mjs';

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

test('ScienceQA split mapping is frozen to val development and test evaluation', () => {
  assert.deepEqual(SPLIT_MAPPING, { development: 'val', evaluation: 'test' });
});

test('image-present manifest preserves official split order and excludes text-only rows', () => {
  const result = buildImagePresentManifest({
    splitName: 'val',
    ids: ['11', '7', '19', '2'],
    problems: {
      '11': { image: '11/image.png' },
      '7': { image: null },
      '19': { image: '19/image.png' },
      '2': { image: '' }
    }
  });

  assert.deepEqual(result.rows, [
    { id: '11', source_split: 'val', image: '11/image.png' },
    { id: '19', source_split: 'val', image: '19/image.png' }
  ]);
  assert.equal(result.sha256, sha256(result.bytes));
  assert.equal(result.bytes.toString('utf8'),
    '{"id":"11","source_split":"val","image":"11/image.png"}\n' +
    '{"id":"19","source_split":"val","image":"19/image.png"}\n');
});

test('image-present manifest is byte deterministic', () => {
  const input = {
    splitName: 'test',
    ids: ['1', '2'],
    problems: {
      '1': { image: '1/image.png' },
      '2': { image: '2/image.png' }
    }
  };
  const first = buildImagePresentManifest(input);
  const second = buildImagePresentManifest(input);
  assert.deepEqual(first.bytes, second.bytes);
  assert.equal(first.sha256, second.sha256);
});

test('dataset freeze logic fails closed on duplicates, missing records, bad image types, and empty image subsets', () => {
  assert.throws(
    () => buildImagePresentManifest({ splitName: 'val', ids: ['1', '1'], problems: { '1': { image: 'x.png' } } }),
    /duplicate record id 1/
  );
  assert.throws(
    () => buildImagePresentManifest({ splitName: 'val', ids: ['1'], problems: {} }),
    /problem 1 must be an object/
  );
  assert.throws(
    () => buildImagePresentManifest({ splitName: 'val', ids: ['1'], problems: { '1': { image: 42 } } }),
    /image must be a string, empty, or null/
  );
  assert.throws(
    () => buildImagePresentManifest({ splitName: 'val', ids: ['1'], problems: { '1': { image: null } } }),
    /image-present subset is empty/
  );
});
