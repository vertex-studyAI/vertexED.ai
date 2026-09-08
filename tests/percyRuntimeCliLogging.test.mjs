import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cliPath = fileURLToPath(new URL('../tools/percy-runtime/cli.mjs', import.meta.url));

function runCli(args) {
  const result = spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, `CLI failed: ${result.stderr || result.stdout}`);
  return result;
}

test('work-one redacts secrets from its durable audit trail and console result', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-cli-log-'));
  const db = join(dir, 'percy.sqlite');
  const log = join(dir, 'events.jsonl');
  const secret = 'cli-secret-token-123456';

  try {
    runCli([
      'submit', '--db', db, '--kind', 'echo', '--payload',
      JSON.stringify({ message: 'hello', token: secret }),
    ]);
    const work = runCli([
      'work-one', '--db', db, '--log', log, '--worker-id', 'audit-worker',
      '--lease-ms', '30000', '--timeout-ms', '10000',
    ]);

    const raw = readFileSync(log, 'utf8').trim();
    const rows = raw.split('\n').map((line) => JSON.parse(line));
    const output = JSON.parse(work.stdout.trim());
    assert.deepEqual(rows.map(({ event }) => event), ['task_claimed', 'task_started', 'task_complete']);
    assert.doesNotMatch(raw, new RegExp(secret));
    assert.doesNotMatch(work.stdout, new RegExp(secret));
    assert.equal(rows[2].result.token, '[REDACTED]');
    assert.equal(rows[2].result.message, 'hello');
    assert.equal(rows[2].workerId, 'audit-worker');
    assert.equal(output.result.token, '[REDACTED]');
    assert.equal(output.result.message, 'hello');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
