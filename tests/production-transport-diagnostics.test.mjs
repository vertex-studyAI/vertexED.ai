import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const scriptUrl = new URL('../scripts/diagnose-production-transport.mjs', import.meta.url);
const workflowUrl = new URL('../.github/workflows/production-transport-diagnostics.yml', import.meta.url);
const scriptSource = await readFile(scriptUrl, 'utf8');
const workflowSource = await readFile(workflowUrl, 'utf8');

test('transport diagnostic script is syntax-valid and captures each network layer', () => {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(scriptUrl)], {
    encoding: 'utf8',
  });

  assert.equal(syntax.status, 0, syntax.stderr);
  assert.match(scriptSource, /dns\.lookup/);
  assert.match(scriptSource, /dns\.resolveCname/);
  assert.match(scriptSource, /net\.connect/);
  assert.match(scriptSource, /tls\.connect/);
  assert.match(scriptSource, /https\.get/);
  assert.match(scriptSource, /rejectUnauthorized: true/);
  assert.match(scriptSource, /x-vertexed-revision/);
  assert.match(scriptSource, /x-vertexed-health/);
});

test('DNS evidence preserves bounded CNAME routing without making CNAME absence a failure', () => {
  assert.match(scriptSource, /DNS_CNAME_MAX_HOPS = 8/);
  assert.match(scriptSource, /CNAME loop detected/);
  assert.match(scriptSource, /CNAME chain exceeded/);
  assert.match(scriptSource, /error\?\.code === 'ENODATA'/);
  assert.match(scriptSource, /error\?\.code === 'ENOTFOUND'/);
  assert.match(scriptSource, /cname,/);
  assert.match(scriptSource, /ok: addresses\.length > 0/);
  assert.doesNotMatch(scriptSource, /ok: addresses\.length > 0 && cname\.ok/);
});

test('transport diagnostic preserves nested network error causes without exposing secrets', () => {
  assert.match(scriptSource, /current\.cause/);
  assert.match(scriptSource, /current\.errors/);
  assert.match(scriptSource, /code=/);
  assert.match(scriptSource, /errno=/);
  assert.match(scriptSource, /syscall=/);
  assert.doesNotMatch(scriptSource, /process\.env\.(?:VERCEL|SUPABASE|OPENAI|GOOGLE|GEMINI|API_KEY)/);
});

test('workflow runs only after failed main release checks or explicit manual dispatch', () => {
  assert.match(workflowSource, /workflow_run:/);
  assert.match(workflowSource, /- CI/);
  assert.match(workflowSource, /- Production Health Monitor/);
  assert.match(workflowSource, /head_branch == 'main'/);
  assert.match(workflowSource, /conclusion == 'failure'/);
  assert.match(workflowSource, /workflow_run\.head_sha \|\| github\.sha/);
  assert.match(workflowSource, /persist-credentials: false/);
  assert.match(workflowSource, /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/);
  assert.match(workflowSource, /test "\$\(git rev-parse HEAD\)" = "\$\{SOURCE_SHA\}"/);
  assert.match(workflowSource, /actions\/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38/);
  assert.match(workflowSource, /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/);
  assert.doesNotMatch(workflowSource, /pull_request:/);
  assert.doesNotMatch(workflowSource, /push:/);
});
