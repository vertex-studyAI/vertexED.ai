import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const curriculum = fs.readFileSync('src/lib/curriculum.ts', 'utf8');
const learnerProfile = fs.readFileSync('src/lib/learnerProfile.ts', 'utf8');
const readiness = fs.readFileSync('src/lib/examReadiness.ts', 'utf8');
const portal = fs.readFileSync('src/lib/portalFeatures.ts', 'utf8');
const pulse = fs.readFileSync('src/lib/retrievalPulse.ts', 'utf8');

test('exam countdown treats date-only profile values as calendar dates', () => {
  assert.match(curriculum, /Date\.UTC\(year, month - 1, day\)/);
  assert.match(curriculum, /Date\.UTC\(now\.getFullYear\(\), now\.getMonth\(\), now\.getDate\(\)\)/);
  assert.doesNotMatch(curriculum, /new Date\(examDate\);[\s\S]*target\.setHours/);
});

test('past exam dates cannot activate cram or exam-night recommendations', () => {
  for (const source of [learnerProfile, readiness, portal, pulse]) {
    assert.match(source, /examDays[^\n]*>= 0/);
  }
});
