import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/components/SavedWorkList.tsx', 'utf8');

test('saved work restore handoff fails closed when temporary storage throws', () => {
  const openItem = source.match(/const openItem = \(item: StudyArtifact\) => \{([\s\S]*?)\n\s*\};/);
  assert.ok(openItem, 'openItem handler must exist');
  assert.match(openItem[1], /try\s*\{/);
  assert.match(openItem[1], /queueArtifactRestore\(item\);\s*\n\s*navigate\(artifactTargetRoute\(item\.kind\)\);/);
  assert.match(openItem[1], /catch\s*\{/);
  assert.match(openItem[1], /Could not open saved work/);
  assert.match(openItem[1], /Your saved work was not changed/);
});

test('restore handoff only navigates after the storage handoff attempt', () => {
  const queueIndex = source.indexOf('queueArtifactRestore(item);');
  const navigateIndex = source.indexOf('navigate(artifactTargetRoute(item.kind));');
  const catchIndex = source.indexOf('} catch {', queueIndex);
  assert.ok(queueIndex >= 0 && navigateIndex > queueIndex && catchIndex > navigateIndex);
});
