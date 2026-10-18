import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { buildCiEvidenceManifest } from '../scripts/build-ci-evidence-manifest.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-ci-evidence-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init');
  git('-c', 'user.name=VertexED test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', 'fixture source');
  const sha = git('rev-parse', 'HEAD');
  const evidenceDir = join(root, 'evidence');
  await mkdir(join(evidenceDir, 'nested'), { recursive: true });
  await writeFile(join(evidenceDir, 'z.log'), 'passed\n');
  await writeFile(join(evidenceDir, 'nested', 'a.json'), '{"ok":true}\n');
  return { root, evidenceDir, sha, env: { GITHUB_SHA: sha, GITHUB_RUN_ID: '12345', GITHUB_REPOSITORY: 'owner/repo' } };
}

test('manifest binds sorted evidence hashes to an immutable CI run URL and actual checkout', async (t) => {
  const { root, evidenceDir, sha, env } = await fixture(t);
  const manifest = await buildCiEvidenceManifest({
    evidenceDir,
    checkoutDir: root,
    env: {
      ...env,
      GITHUB_SHA: sha.toUpperCase(),
      GITHUB_RUN_ATTEMPT: '2',
      GITHUB_REPOSITORY: 'owner/repo',
      GITHUB_SERVER_URL: 'https://github.example',
      GITHUB_WORKFLOW: 'CI',
      GITHUB_JOB: 'smoke',
    },
  });
  assert.equal(manifest.source_sha, sha);
  assert.equal(manifest.workflow_sha, sha);
  assert.equal(manifest.run_url, 'https://github.example/owner/repo/actions/runs/12345');
  assert.deepEqual(manifest.files.map(({ path }) => path), ['nested/a.json', 'z.log']);
  assert.deepEqual(JSON.parse(await readFile(join(evidenceDir, 'manifest.json'), 'utf8')), manifest);
});

test('pull-request receipts bind the tested head while retaining the workflow merge commit', async (t) => {
  const { root, evidenceDir, sha, env } = await fixture(t);
  const manifest = await buildCiEvidenceManifest({
    evidenceDir, checkoutDir: root,
    env: { ...env, SOURCE_SHA: sha, GITHUB_SHA: 'a'.repeat(40) },
  });
  assert.equal(manifest.source_sha, sha);
  assert.equal(manifest.workflow_sha, 'a'.repeat(40));
});

test('manifest rejects another source commit and an explicitly empty source override', async (t) => {
  const { root, evidenceDir, env } = await fixture(t);
  await assert.rejects(buildCiEvidenceManifest({ evidenceDir, checkoutDir: root, env: { ...env, SOURCE_SHA: 'b'.repeat(40) } }), /does not match the checked-out source/);
  await assert.rejects(buildCiEvidenceManifest({ evidenceDir, checkoutDir: root, env: { ...env, SOURCE_SHA: '' } }), /SOURCE_SHA must be/);
  await assert.rejects(readFile(join(evidenceDir, 'manifest.json')), { code: 'ENOENT' });
});

test('manifest fails closed without immutable source and run identity', async (t) => {
  const { root, evidenceDir, env } = await fixture(t);
  await assert.rejects(buildCiEvidenceManifest({ evidenceDir, checkoutDir: root, env: {} }), /GITHUB_SHA/);
  await assert.rejects(buildCiEvidenceManifest({ evidenceDir, checkoutDir: root, env: { ...env, GITHUB_RUN_ID: '' } }), /GITHUB_RUN_ID/);
});
