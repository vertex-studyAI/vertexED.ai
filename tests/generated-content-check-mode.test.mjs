import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function trackedPaths() {
  const result = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.split('\0').filter(Boolean);
}

async function trackedHashes(paths) {
  return new Map(await Promise.all(paths.map(async (path) => {
    const content = await readFile(path).catch(() => Buffer.from('<missing>'));
    return [path, createHash('sha256').update(content).digest('hex')];
  })));
}

test('generated-content check modes never modify tracked source', async () => {
  const paths = trackedPaths();
  const before = await trackedHashes(paths);
  const scripts = [
    'scripts/generate-ap-content.mjs',
    'scripts/generate-myp5-content.mjs',
    'scripts/generate-study-guide-provenance.mjs',
  ];

  for (const script of scripts) {
    const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${script}\n${result.stdout}\n${result.stderr}`);
  }

  const after = await trackedHashes(paths);
  const changed = paths.filter((path) => before.get(path) !== after.get(path));
  assert.deepEqual(changed, [], `check mode modified tracked files: ${changed.join(', ')}`);
});
