import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { isStudyArtifactTimestamp } from '../src/lib/studyArtifactTimestamp.mjs';

const userContentSource = fs.readFileSync('src/lib/userContent.ts', 'utf8');

test('accepts browser and Postgres timestamptz response shapes', () => {
  for (const value of [
    '2026-10-04T18:07:32.123Z',
    '2026-10-04T18:07:32Z',
    '2026-10-04T18:07:32.123456+00:00',
    '2026-10-05T07:37:32.12+13:30',
    '2024-02-29T23:59:59-08:00',
  ]) {
    assert.equal(isStudyArtifactTimestamp(value), true, value);
  }
});

test('rejects calendar dates that Date.parse silently rolls forward', () => {
  for (const value of [
    '2026-02-29T00:00:00Z',
    '2026-02-30T00:00:00Z',
    '2026-04-31T00:00:00Z',
    '2026-13-01T00:00:00Z',
  ]) {
    assert.equal(isStudyArtifactTimestamp(value), false, value);
  }
});

test('rejects ambiguous, malformed, and out-of-range timestamps', () => {
  for (const value of [
    null,
    '2026-10-04',
    'Sun, 04 Oct 2026 18:07:32 GMT',
    '2026-10-04 18:07:32Z',
    '2026-10-04T24:00:00Z',
    '2026-10-04T18:60:00Z',
    '2026-10-04T18:07:60Z',
    '2026-10-04T18:07:32.1234567Z',
    '2026-10-04T18:07:32+14:01',
    '2026-10-04T18:07:32+15:00',
    ' 2026-10-04T18:07:32Z',
  ]) {
    assert.equal(isStudyArtifactTimestamp(value), false, String(value));
  }
});

test('cloud and device recovery records use the shared strict boundary', () => {
  assert.match(
    userContentSource,
    /import \{ isStudyArtifactTimestamp \} from '@\/lib\/studyArtifactTimestamp\.mjs';/,
  );
  assert.match(
    userContentSource,
    /!isStudyArtifactTimestamp\(value\.created_at\) \|\| !isStudyArtifactTimestamp\(value\.updated_at\)/,
  );
  assert.doesNotMatch(userContentSource, /function isStoredTimestamp[\s\S]*?Date\.parse/);
});
