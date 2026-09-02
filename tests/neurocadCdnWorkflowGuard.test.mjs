import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cdnWorkflowPath = '.github/workflows/neurocad-alpha-public-cdn.yml';
const browserWorkflowPath = '.github/workflows/neurocad-alpha-browser.yml';

const CHECKOUT_V5_SHA = 'fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09';
const SETUP_NODE_V6_SHA = '249970729cb0ef3589644e2896645e5dc5ba9c38';
const UPLOAD_ARTIFACT_V7_SHA = '043fb46d1a93c77aae656e7c1c64a875d1fc6a0a';

test('artifact CDN release materializes quarantined NeuroCAD explicitly before the deploy-shaped build', async () => {
  const workflow = await readFile(cdnWorkflowPath, 'utf8');

  const materializeIndex = workflow.indexOf('node scripts/publish-neurocad-alpha.mjs');
  const buildIndex = workflow.indexOf('npm run build:ci');
  const verifyIndex = workflow.indexOf('Verify exact artifact stamps');

  assert.notEqual(materializeIndex, -1, 'explicit NeuroCAD artifact materialization step missing');
  assert.notEqual(buildIndex, -1, 'deploy-shaped build step missing');
  assert.notEqual(verifyIndex, -1, 'exact artifact verification step missing');
  assert.ok(materializeIndex < buildIndex, 'quarantined NeuroCAD artifact must be materialized before build:ci');
  assert.ok(buildIndex < verifyIndex, 'artifact stamps must be verified after the deploy-shaped build');
});

test('artifact CDN release pins third-party Actions used in the privileged release path', async () => {
  const workflow = await readFile(cdnWorkflowPath, 'utf8');

  assert.match(workflow, new RegExp(`actions/checkout@${CHECKOUT_V5_SHA}`));
  assert.match(workflow, new RegExp(`actions/setup-node@${SETUP_NODE_V6_SHA}`));
  assert.match(workflow, new RegExp(`actions/upload-artifact@${UPLOAD_ARTIFACT_V7_SHA}`));
  assert.doesNotMatch(workflow, /actions\/checkout@v\d+/);
  assert.doesNotMatch(workflow, /actions\/setup-node@v\d+/);
  assert.doesNotMatch(workflow, /actions\/upload-artifact@v\d+/);
});

test('artifact CDN release copies the exact build before switching release branches', async () => {
  const workflow = await readFile(cdnWorkflowPath, 'utf8');

  const copyIndex = workflow.indexOf('cp -R dist/neurocad/. "$release_dir/"');
  const resetIndex = workflow.indexOf('git reset --hard HEAD');
  const checkoutIndex = workflow.indexOf('git checkout -B neurocad-public refs/remotes/origin/neurocad-public');

  assert.notEqual(copyIndex, -1, 'release artifact copy step missing');
  assert.notEqual(resetIndex, -1, 'generated-source cleanup step missing');
  assert.notEqual(checkoutIndex, -1, 'release branch checkout step missing');
  assert.ok(copyIndex < resetIndex, 'artifact must be copied out before generated source changes are restored');
  assert.ok(resetIndex < checkoutIndex, 'generated source changes must be restored before release branch checkout');
});

test('jsDelivr is treated as immutable artifact transport, never as browser certification', async () => {
  const workflow = await readFile(cdnWorkflowPath, 'utf8');

  assert.match(workflow, /neurocad-build-revision/);
  assert.match(workflow, /neurocad-artifact-revision/);
  assert.match(workflow, /Verify immutable CDN artifact transport/);
  assert.match(workflow, /text\/plain/);
  assert.match(workflow, /g12_status=OPEN_REQUIRES_EXECUTABLE_PUBLIC_HOST/);
  assert.doesNotMatch(workflow, /Run public flagship browser certification/);
  assert.doesNotMatch(workflow, /playwright test/);
});

test('G12 production smoke excludes jsDelivr and requires an executable canonical host', async () => {
  const workflow = await readFile(browserWorkflowPath, 'utf8');
  const productionSmoke = workflow.slice(workflow.indexOf('production-smoke:'));

  assert.match(productionSmoke, /https:\/\/www\.vertexed\.app\/neurocad\//);
  assert.match(productionSmoke, /github\.io\/\$\{repo_name\}\/neurocad\//);
  assert.match(productionSmoke, /Run production flagship browser smoke/);
  assert.match(productionSmoke, /npx playwright test e2e\/neurocad-alpha\.spec\.ts/);
  assert.doesNotMatch(productionSmoke, /cdn\.jsdelivr\.net/);
});
