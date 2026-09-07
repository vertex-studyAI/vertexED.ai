import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

test('third-party GitHub Actions are pinned to immutable commit SHAs', async () => {
  const directory = new URL('../.github/workflows/', import.meta.url);
  const files = (await readdir(directory)).filter((name) => /\.ya?ml$/.test(name));
  for (const file of files) {
    const source = await readFile(new URL(file, directory), 'utf8');
    for (const match of source.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)) {
      const use = match[1];
      if (use.startsWith('./') || use.startsWith('docker://')) continue;
      assert.match(use, /@[0-9a-f]{40}$/i, `${file}: ${use}`);
    }
  }
});
