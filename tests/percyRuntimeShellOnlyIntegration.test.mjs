import assert from 'node:assert/strict';
import test from 'node:test';

import { diagnosePercyRuntimeReadiness } from '../scripts/percy-runtime-readiness.mjs';

function snapshots() {
  return {
    state: {
      schema_version: 1,
      engine: 'PERCY 16384X',
      run_started_at: '2026-08-28T11:30:00.000Z',
      completed_iterations: 11,
      last_completed_iteration: 'PERCY-00011',
      next_iteration: 'PERCY-00012',
    },
    queue: {
      schema_version: 1,
      as_of: '2026-08-28T11:30:00.000Z',
      tasks: [{ rank: 1, action: 'Audit runtime readiness' }],
    },
    blockers: {
      schema_version: 1,
      as_of: '2026-08-28T11:30:00.000Z',
      blockers: [],
    },
  };
}

function runtime(command) {
  return {
    schema_version: 1,
    as_of: '2026-08-28T11:55:00.000Z',
    source: { available: true, head: '0123456789abcdef0123456789abcdef01234567' },
    process: { state: 'RUNNING', pid: 4242, command },
    database: { reachable: true, migration_state: 'CURRENT' },
    queue: { persistent: true },
    heartbeat: { fresh: true },
    disk: { free_bytes: 20_000_000_000, hard_stop_free_bytes: 10_000_000_000 },
    memory: {
      physical_bytes: 16_000_000_000,
      available_bytes: 6_000_000_000,
      hard_stop_available_bytes: 2_000_000_000,
      swap_used_bytes: 1_000_000_000,
      hard_stop_swap_used_bytes: 4_000_000_000,
    },
    providers: [{ name: 'codex', required: true, available: true }],
  };
}

function diagnose(command) {
  const evidence = snapshots();
  return diagnosePercyRuntimeReadiness({
    state: evidence.state,
    queue: evidence.queue,
    blockers: evidence.blockers,
    runtime: runtime(command),
    now: new Date('2026-08-28T12:00:00.000Z'),
    maxAgeHours: 24,
  });
}

test('reported RUNNING plus a bare zsh pane fails closed as SHELL_ONLY', () => {
  const diagnosis = diagnose('zsh');
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.equal(diagnosis.runtime.processState, 'SHELL_ONLY');
  assert.equal(diagnosis.runtime.reportedProcessState, 'RUNNING');
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'WORKER_NOT_RUNNING'));
});

test('a concrete worker command can still be RUNNING when the other evidence is healthy', () => {
  const diagnosis = diagnose('node tools/percy-runtime/cli.mjs work-one');
  assert.equal(diagnosis.verdict, 'READY_TO_RESUME');
  assert.equal(diagnosis.runtime.processState, 'RUNNING');
  assert.equal(diagnosis.runtime.reportedProcessState, 'RUNNING');
});
