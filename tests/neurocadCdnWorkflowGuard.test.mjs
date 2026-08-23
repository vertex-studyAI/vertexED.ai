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

test('CDN release still requires exact source and artifact revision stamps', async () => {
  const workflow = await readFile(workflowPath, 'utf8');
  assert.match(workflow, /neurocad-build-revision/);
  assert.match(workflow, /neurocad-artifact-revision/);
  assert.match(workflow, /Run public flagship browser certification/);
});
