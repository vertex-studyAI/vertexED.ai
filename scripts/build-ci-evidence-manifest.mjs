#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import process from 'node:process';

const MANIFEST_NAME = 'manifest.json';

async function filesUnder(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(root, path));
    else if (entry.isFile() && relative(root, path) !== MANIFEST_NAME) files.push(path);
  }
  return files;
}

export async function buildCiEvidenceManifest({ evidenceDir, env = process.env }) {
  const root = resolve(evidenceDir);
  const sourceSha = String(env.GITHUB_SHA ?? '').trim();
  const runId = String(env.GITHUB_RUN_ID ?? '').trim();
  const repository = String(env.GITHUB_REPOSITORY ?? '').trim();
  const serverUrl = String(env.GITHUB_SERVER_URL ?? 'https://github.com').replace(/\/$/, '');
  if (!/^[0-9a-f]{40}$/i.test(sourceSha)) throw new Error('GITHUB_SHA must be a full 40-character commit');
  if (!/^\d+$/.test(runId)) throw new Error('GITHUB_RUN_ID must be numeric');
  if (!/^[^/]+\/[^/]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY must be owner/name');

  const files = [];
  for (const path of await filesUnder(root)) {
    const bytes = await readFile(path);
    files.push({
      path: relative(root, path).split('\\').join('/'),
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
  if (files.length === 0) throw new Error('CI evidence directory contains no files');

  const manifest = {
    schema_version: 1,
    source_sha: sourceSha.toLowerCase(),
    run_id: runId,
    run_attempt: String(env.GITHUB_RUN_ATTEMPT ?? ''),
    workflow: String(env.GITHUB_WORKFLOW ?? ''),
    job: String(env.GITHUB_JOB ?? ''),
    run_url: `${serverUrl}/${repository}/actions/runs/${runId}`,
    files,
  };
  await writeFile(resolve(root, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const flag = process.argv.indexOf('--evidence-dir');
  const evidenceDir = flag >= 0 ? process.argv[flag + 1] : 'ci-evidence';
  buildCiEvidenceManifest({ evidenceDir }).then(
    (manifest) => console.log(`Bound ${manifest.files.length} evidence files to ${manifest.run_url}`),
    (error) => { console.error(error.message); process.exitCode = 1; },
  );
}
