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

test('normalizeBuildRevision accepts only hexadecimal Git identifiers', () => {
  assert.equal(normalizeBuildRevision('ABCDEF1'), 'abcdef1');
  assert.equal(normalizeBuildRevision('1234567890abcdef1234567890abcdef12345678'), '1234567890abcdef1234567890abcdef12345678');
  assert.equal(normalizeBuildRevision('not-a-sha'), null);
  assert.equal(normalizeBuildRevision('12345'), null);
});

test('resolveBuildRevision prefers deployment environment identity over Git fallback', () => {
  let gitCalled = false;
  const revision = resolveBuildRevision({
    env: {
      VERCEL_GIT_COMMIT_SHA: '1234567890abcdef1234567890abcdef12345678',
      GITHUB_SHA: 'abcdef1',
    },
    runGit() {
      gitCalled = true;
      return 'fedcba9';
    },
  });

  assert.equal(revision, '1234567890abcdef1234567890abcdef12345678');
  assert.equal(gitCalled, false);
});

test('resolveBuildRevision falls back to the checked-out Git HEAD', () => {
  const revision = resolveBuildRevision({
    env: {},
    runGit(args) {
      assert.deepEqual(args, ['rev-parse', 'HEAD']);
      return 'FEDCBA9\n';
    },
  });

  assert.equal(revision, 'fedcba9');
});

test('Vercel builds automatically require an immutable revision', () => {
  assert.equal(requiresImmutableBuildRevision({ VERCEL: '1' }), true);
  assert.equal(requiresImmutableBuildRevision({ VERTEXED_REQUIRE_BUILD_REVISION: '1' }), true);
  assert.equal(requiresImmutableBuildRevision({}), false);
});

test('writeBuildRevisionModule emits an importable immutable revision literal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-build-revision-'));
  const outputPath = join(root, 'build-revision.js');
  const revision = await writeBuildRevisionModule({
    outputPath,
    env: { GITHUB_SHA: 'ABCDEF1' },
    runGit() {
      throw new Error('Git fallback should not be used');
    },
  });

  assert.equal(revision, 'abcdef1');
  const contents = await readFile(outputPath, 'utf8');
  assert.match(contents, /export const BUILD_REVISION = "abcdef1";/);
});

test('deploy-relevant generation fails closed when no immutable revision exists', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-build-revision-required-'));
  const outputPath = join(root, 'build-revision.js');

  await assert.rejects(
    () => writeBuildRevisionModule({
      outputPath,
      env: { VERTEXED_REQUIRE_BUILD_REVISION: '1' },
      runGit() {
        throw new Error('no git metadata');
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
