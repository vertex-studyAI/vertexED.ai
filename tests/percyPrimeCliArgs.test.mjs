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

test('Percy Prime rejects timer values that Node would truncate, overflow, or clamp', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-prime-timers-'));
  const db = join(dir, 'percy.sqlite');
  const log = join(dir, 'percy.jsonl');
  const base = [
    'work',
    '--db', db,
    '--workers', '1',
    '--max-idle-ms', '1',
    '--idle-ms', '1',
    '--max-idle-sleep-ms', '1',
    '--log', log,
  ];

  try {
    for (const timeoutMs of ['1.5', '2147483648', 'Infinity', 'NaN']) {
      const result = runPrime([...base, '--timeout-ms', timeoutMs]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /--timeout-ms must be an integer in \[1,2147483647\]/);
    }

    for (const leaseMs of ['100.5', '2147483648', 'Infinity', 'NaN']) {
      const result = runPrime([...base, '--lease-ms', leaseMs]);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /--lease-ms must be an integer in \[100,2147483647\]/);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Percy Prime canonicalizes class-limit whitespace and rejects duplicate provider classes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-prime-class-limits-'));
  const db = join(dir, 'percy.sqlite');
  const log = join(dir, 'percy.jsonl');
  const baseWorkArgs = [
    'work',
    '--db', db,
    '--workers', '1',
    '--idle-ms', '1',
    '--max-idle-sleep-ms', '1',
    '--max-idle-ms', '1',
    '--log', log,
  ];

  try {
    const whitespace = runPrime([
      ...baseWorkArgs,
      '--class-limits', ' default = 1 , gpu = 2 ',
    ]);
    assert.equal(whitespace.status, 0, whitespace.stderr);
    assert.match(whitespace.stdout, /"draining": false/);

    const duplicateClass = runPrime([
      ...baseWorkArgs,
      '--class-limits', 'default=1,gpu=2,gpu=3',
    ]);
    assert.notEqual(duplicateClass.status, 0);
    assert.match(duplicateClass.stderr, /duplicate class limit: gpu/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
