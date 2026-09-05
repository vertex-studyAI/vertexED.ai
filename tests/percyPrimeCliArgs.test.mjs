import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const primePath = new URL('../tools/percy-runtime/prime.mjs', import.meta.url);

const runPrime = (args) => spawnSync(process.execPath, [primePath.pathname, ...args], {
  encoding: 'utf8',
  env: { ...process.env, NODE_NO_WARNINGS: '1' },
});

test('Percy Prime rejects unknown and duplicate CLI arguments instead of silently ignoring them', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-prime-args-'));
  const db = join(dir, 'percy.sqlite');
  try {
    const valid = runPrime(['doctor', '--db', db]);
    assert.equal(valid.status, 0, valid.stderr);

    const unknown = runPrime(['doctor', '--db', db, '--typo-flag']);
    assert.notEqual(unknown.status, 0);
    assert.match(unknown.stderr, /unexpected argument\(s\): --typo-flag/);

    const duplicate = runPrime([
      'doctor',
      '--db', db,
      '--max-active', '1',
      '--max-active', '2',
    ]);
    assert.notEqual(duplicate.status, 0);
    assert.match(duplicate.stderr, /unexpected argument\(s\): --max-active 2/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
