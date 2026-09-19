import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { buildCiEvidenceManifest } from '../scripts/build-ci-evidence-manifest.mjs';

test('manifest binds sorted evidence hashes to an immutable CI run URL', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-ci-evidence-'));
  await mkdir(join(root, 'nested'));
  await writeFile(join(root, 'z.log'), 'passed\n');
  await writeFile(join(root, 'nested', 'a.json'), '{"ok":true}\n');
  const manifest = await buildCiEvidenceManifest({
    evidenceDir: root,
    env: {
      GITHUB_SHA: 'A'.repeat(40),
      GITHUB_RUN_ID: '12345',
      GITHUB_RUN_ATTEMPT: '2',
      GITHUB_REPOSITORY: 'owner/repo',
      GITHUB_SERVER_URL: 'https://github.example',
      GITHUB_WORKFLOW: 'CI',
      GITHUB_JOB: 'smoke',
    },
  });
  assert.equal(manifest.source_sha, 'a'.repeat(40));
  assert.equal(manifest.run_url, 'https://github.example/owner/repo/actions/runs/12345');
  assert.deepEqual(manifest.files.map(({ path }) => path), ['nested/a.json', 'z.log']);
  assert.deepEqual(JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8')), manifest);
});

test('manifest fails closed without immutable source and run identity', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-ci-evidence-'));
  await writeFile(join(root, 'result.log'), 'passed\n');
  await assert.rejects(buildCiEvidenceManifest({ evidenceDir: root, env: {} }), /GITHUB_SHA/);
});
