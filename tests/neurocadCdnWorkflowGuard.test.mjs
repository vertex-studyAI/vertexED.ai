import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflowPath = '.github/workflows/neurocad-alpha-public-cdn.yml';

test('CDN release copies the artifact before restoring generated source changes and switching branches', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  const copyIndex = workflow.indexOf('cp -R dist/neurocad/. "$release_dir/"');
  const resetIndex = workflow.indexOf('git reset --hard HEAD');
  const checkoutIndex = workflow.indexOf('git checkout -B neurocad-public refs/remotes/origin/neurocad-public');

  assert.notEqual(copyIndex, -1, 'release artifact copy step missing');
  assert.notEqual(resetIndex, -1, 'generated-source cleanup step missing');
  assert.notEqual(checkoutIndex, -1, 'release branch checkout step missing');
  assert.ok(copyIndex < resetIndex, 'artifact must be copied out before generated source changes are restored');
  assert.ok(resetIndex < checkoutIndex, 'generated source changes must be restored before release branch checkout');
});

test('CDN release restores the exact source tree and project dependencies before browser certification', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  const publishIndex = workflow.indexOf('name: Publish generated artifact to release branch');
  const restoreIndex = workflow.indexOf('name: Restore source checkout for certification');
  const sourceCheckoutIndex = workflow.indexOf('git checkout --force "${GITHUB_SHA}"', restoreIndex);
  const dependencyInstallIndex = workflow.indexOf('npm ci', restoreIndex);
  const configGuardIndex = workflow.indexOf('test -f playwright.config.ts', restoreIndex);
  const browserIndex = workflow.indexOf('name: Run public flagship browser certification');

  assert.notEqual(publishIndex, -1, 'release publish step missing');
  assert.notEqual(restoreIndex, -1, 'source restore step missing');
  assert.notEqual(sourceCheckoutIndex, -1, 'exact source checkout missing');
  assert.notEqual(dependencyInstallIndex, -1, 'post-release dependency restoration missing');
  assert.notEqual(configGuardIndex, -1, 'Playwright config guard missing');
  assert.notEqual(browserIndex, -1, 'public browser certification step missing');

  assert.ok(publishIndex < restoreIndex, 'source should be restored only after release publication');
  assert.ok(restoreIndex < sourceCheckoutIndex, 'exact source checkout must occur inside restore step');
  assert.ok(sourceCheckoutIndex < dependencyInstallIndex, 'dependencies must be restored from the exact source tree');
  assert.ok(dependencyInstallIndex < configGuardIndex, 'config guard should run after dependency/source restoration');
  assert.ok(configGuardIndex < browserIndex, 'source/config restoration must complete before browser certification');
});

test('CDN release still requires exact source and artifact revision stamps', async () => {
  const workflow = await readFile(workflowPath, 'utf8');
  assert.match(workflow, /neurocad-build-revision/);
  assert.match(workflow, /neurocad-artifact-revision/);
  assert.match(workflow, /Run public flagship browser certification/);
});
