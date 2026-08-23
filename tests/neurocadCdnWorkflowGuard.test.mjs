import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cdnWorkflowPath = '.github/workflows/neurocad-alpha-public-cdn.yml';
const browserWorkflowPath = '.github/workflows/neurocad-alpha-browser.yml';

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
