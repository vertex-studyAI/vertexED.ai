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

test('Percy CLI redacts secrets from audit and human-readable task surfaces', () => {
  const dir = mkdtempSync(join(tmpdir(), 'percy-cli-log-'));
  const db = join(dir, 'percy.sqlite');
  const log = join(dir, 'events.jsonl');
  const secret = 'cli-secret-token-123456';

  try {
    const submit = runCli([
      'submit', '--db', db, '--kind', 'echo', '--payload',
      JSON.stringify({ message: 'hello', token: secret }),
    ]);
    const taskId = submit.stdout.trim();
    const work = runCli([
      'work-one', '--db', db, '--log', log, '--worker-id', 'audit-worker',
      '--lease-ms', '30000', '--timeout-ms', '10000',
    ]);
    const status = runCli(['status', '--db', db]);
    const verify = runCli(['verify', '--db', db, '--task-id', taskId]);

    const raw = readFileSync(log, 'utf8').trim();
    const rows = raw.split('\n').map((line) => JSON.parse(line));
    const workOutput = JSON.parse(work.stdout.trim());
    const statusOutput = JSON.parse(status.stdout.trim());
    const verifyOutput = JSON.parse(verify.stdout.trim());
    const listedTask = statusOutput.tasks.find(({ id }) => id === taskId);

    assert.deepEqual(rows.map(({ event }) => event), ['task_claimed', 'task_started', 'task_complete']);
    for (const surface of [raw, work.stdout, status.stdout, verify.stdout]) {
      assert.doesNotMatch(surface, new RegExp(secret));
    }

    assert.equal(rows[2].result.token, '[REDACTED]');
    assert.equal(rows[2].result.message, 'hello');
    assert.equal(rows[2].workerId, 'audit-worker');
    assert.equal(workOutput.result.token, '[REDACTED]');
    assert.equal(workOutput.result.message, 'hello');

    assert.ok(listedTask, 'completed task should remain visible in status');
    assert.equal(listedTask.payload.token, '[REDACTED]');
    assert.equal(listedTask.payload.message, 'hello');
    assert.equal(listedTask.result.token, '[REDACTED]');
    assert.equal(listedTask.result.message, 'hello');

    assert.equal(verifyOutput.taskId, taskId);
    assert.equal(verifyOutput.complete, true);
    assert.equal(verifyOutput.evidence.length, 1);
    assert.equal(verifyOutput.evidence[0].kind, 'bounded-task-result');
    assert.equal(verifyOutput.evidence[0].value.token, '[REDACTED]');
    assert.equal(verifyOutput.evidence[0].value.message, 'hello');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
