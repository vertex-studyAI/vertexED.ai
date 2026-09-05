// Integration refresh marker: validate this unchanged behavior against main 662de36 / monitoring PR #243.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  normalizeBuildRevision,
  requiresImmutableBuildRevision,
  resolveBuildRevision,
  writeBuildRevisionModule,
} from '../scripts/generate-build-revision.mjs';

const SHA_A = '1234567890abcdef1234567890abcdef12345678';
const SHA_B = 'fedcba0987654321fedcba0987654321fedcba09';

test('normalizeBuildRevision accepts only full hexadecimal Git SHAs', () => {
  assert.equal(normalizeBuildRevision(SHA_A.toUpperCase()), SHA_A);
  assert.equal(normalizeBuildRevision('abcdef1'), null);
  assert.equal(normalizeBuildRevision('1234567890abcdef1234567890abcdef1234567'), null);
  assert.equal(normalizeBuildRevision('1234567890abcdef1234567890abcdef123456789'), null);
  assert.equal(normalizeBuildRevision('not-a-sha'), null);
});

test('resolveBuildRevision prefers exact deployment environment identity over Git fallback', () => {
  let gitCalled = false;
  const revision = resolveBuildRevision({
    env: {
      VERCEL_GIT_COMMIT_SHA: SHA_A,
      GITHUB_SHA: SHA_B,
    },
    runGit() {
      gitCalled = true;
      return SHA_B;
    },
  });

  assert.equal(revision, SHA_A);
  assert.equal(gitCalled, false);
});

test('resolveBuildRevision ignores ambiguous short environment identifiers and uses exact Git HEAD', () => {
  const revision = resolveBuildRevision({
    env: {
      VERCEL_GIT_COMMIT_SHA: 'abcdef1',
      GITHUB_SHA: 'fedcba9',
    },
    runGit(args) {
      assert.deepEqual(args, ['rev-parse', 'HEAD']);
      return `${SHA_B}\n`;
    },
  });

  assert.equal(revision, SHA_B);
});

test('resolveBuildRevision falls back to the checked-out exact Git HEAD', () => {
  const revision = resolveBuildRevision({
    env: {},
    runGit(args) {
      assert.deepEqual(args, ['rev-parse', 'HEAD']);
      return `${SHA_B.toUpperCase()}\n`;
    },
  });

  assert.equal(revision, SHA_B);
});

test('Vercel builds automatically require an immutable revision', () => {
  assert.equal(requiresImmutableBuildRevision({ VERCEL: '1' }), true);
  assert.equal(requiresImmutableBuildRevision({ VERTEXED_REQUIRE_BUILD_REVISION: '1' }), true);
  assert.equal(requiresImmutableBuildRevision({}), false);
});

test('writeBuildRevisionModule emits an importable full immutable revision literal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-build-revision-'));
  const outputPath = join(root, 'build-revision.js');
  const revision = await writeBuildRevisionModule({
    outputPath,
    env: { GITHUB_SHA: SHA_A.toUpperCase() },
    runGit() {
      throw new Error('Git fallback should not be used');
    },
  });

  assert.equal(revision, SHA_A);
  const contents = await readFile(outputPath, 'utf8');
  assert.match(contents, new RegExp(`export const BUILD_REVISION = "${SHA_A}";`));
});

test('deploy-relevant generation fails closed when no full immutable revision exists', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-build-revision-required-'));
  const outputPath = join(root, 'build-revision.js');

  await assert.rejects(
    () => writeBuildRevisionModule({
      outputPath,
      env: {
        VERTEXED_REQUIRE_BUILD_REVISION: '1',
        GITHUB_SHA: 'abcdef1',
      },
      runGit() {
        return 'fedcba9';
      },
    }),
    /Refusing to produce an unverifiable deployment artifact/,
  );
});

test('Vercel generation fails closed when deployment revision and Git metadata are unavailable', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-build-revision-vercel-'));
  const outputPath = join(root, 'build-revision.js');

  await assert.rejects(
    () => writeBuildRevisionModule({
      outputPath,
      env: { VERCEL: '1' },
      runGit() {
        throw new Error('no git metadata');
      },
    }),
    /Refusing to produce an unverifiable deployment artifact/,
  );
});
