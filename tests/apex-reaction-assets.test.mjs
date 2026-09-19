import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const appearances = ['paper', 'stack', 'focus', 'compass'];

test('every Apex appearance has reaction-safe blink and page-turn assets', () => {
  for (const appearance of appearances) {
    for (const reaction of ['blink', 'page-turn']) {
      const path = resolve(
        repoRoot,
        'public',
        'companions',
        `apex-${appearance}-${reaction}-v4.png`,
      );
      assert.equal(
        existsSync(path),
        true,
        `${appearance} ${reaction} reaction asset must exist`,
      );
    }
  }
});
