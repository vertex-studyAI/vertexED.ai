import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeImmutableGitSha } from '../scripts/immutable-revision.mjs';

const FULL_SHA = '9efb041d3d56e0dc617f5808576beff696d08a69';

test('immutable release revision accepts only exact 40-character git SHAs', () => {
  assert.equal(normalizeImmutableGitSha(FULL_SHA), FULL_SHA);
  assert.equal(normalizeImmutableGitSha(`  ${FULL_SHA.toUpperCase()}  `), FULL_SHA);
  assert.equal(normalizeImmutableGitSha(FULL_SHA.slice(0, 7)), null);
  assert.equal(normalizeImmutableGitSha(FULL_SHA.slice(0, 39)), null);
  assert.equal(normalizeImmutableGitSha(`${FULL_SHA}0`), null);
  assert.equal(normalizeImmutableGitSha('main'), null);
  assert.equal(normalizeImmutableGitSha('release/2026-09-05'), null);
  assert.equal(normalizeImmutableGitSha(null), null);
});
