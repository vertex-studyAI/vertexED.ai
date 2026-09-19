import assert from 'node:assert/strict';
import test from 'node:test';
import { studyGuideLoadError } from '../src/lib/studyGuideLoadError.mjs';

test('studyGuideLoadError never echoes raw upstream text', () => {
  assert.doesNotMatch(
    studyGuideLoadError(new Error('CMS 502 upstream token abc'), 'index'),
    /CMS 502|token abc/,
  );
  assert.match(studyGuideLoadError(new Error('CMS 502 upstream token abc'), 'index'), /index could not be loaded/i);
  assert.match(studyGuideLoadError(new Error('not found'), 'page'), /could not be found/i);
});
