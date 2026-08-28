import assert from 'node:assert/strict';
import test from 'node:test';

import {
  diagnosePercyRuntimeReadiness,
  exitCodeForRuntimeReadiness,
} from '../scripts/percy-runtime-readiness.mjs';

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
    blockerSnapshot: {
      schema_version: 1,
      as_of: '2026-08-28T11:30:00.000Z',
      blockers: [],
    },
  };
}

function healthyRuntime() {
  return {
    schema_version: 1,
    source: { available: true, head: '0123456789abcdef0123456789abcdef01234567' },
    process: { state: 'RUNNING', pid: 4242, command: 'python -m percy daemon' },
    database: { reachable: true, migration_state: 'CURRENT' },
    queue: { persistent: true },
    heartbeat: { fresh: true },
    disk: {
      free_bytes: 20_000_000_000,
      hard_stop_free_bytes: 10_000_000_000,
    },
    memory: {
      physical_bytes: 16_000_000_000,
      available_bytes: 6_000_000_000,
      hard_stop_available_bytes: 2_000_000_000,
      swap_used_bytes: 1_000_000_000,
      hard_stop_swap_used_bytes: 4_000_000_000,
    },
    providers: [
      { name: 'codex', required: true, available: true },
      { name: 'shell', required: true, available: true },
    ],
  };
}

function diagnose(runtime) {
  const { state, queue, blockerSnapshot } = snapshots();
  return diagnosePercyRuntimeReadiness({
    state,
    queue,
    blockers: blockerSnapshot,
    runtime,
    now: new Date('2026-08-28T12:00:00.000Z'),
    maxAgeHours: 24,
  });
}

test('healthy fresh runtime evidence is the only ready-to-resume state', () => {
  const diagnosis = diagnose(healthyRuntime());
  assert.equal(diagnosis.verdict, 'READY_TO_RESUME');
  assert.equal(diagnosis.runtimeEvidence, true);
  assert.deepEqual(diagnosis.blockers, []);
  assert.equal(exitCodeForRuntimeReadiness(diagnosis), 0);
});

test('missing runtime evidence fails closed even when durable snapshots are fresh', () => {
  const diagnosis = diagnose(null);
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.equal(diagnosis.runtimeEvidence, false);
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'MISSING_RUNTIME_EVIDENCE'));
  assert.equal(exitCodeForRuntimeReadiness(diagnosis), 2);
});

test('interactive shell without a real agent process is not treated as running', () => {
  const runtime = healthyRuntime();
  runtime.process.state = 'SHELL_ONLY';
  runtime.process.command = 'zsh';
  const diagnosis = diagnose(runtime);
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'WORKER_NOT_RUNNING'));
  assert.equal(diagnosis.runtimeEvidence, false);
});

test('disk threshold is a hard stop rather than a warning', () => {
  const runtime = healthyRuntime();
  runtime.disk.free_bytes = 8_000_000_000;
  runtime.disk.hard_stop_free_bytes = 10_000_000_000;
  const diagnosis = diagnose(runtime);
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'DISK_HARD_STOP'));
  assert.equal(exitCodeForRuntimeReadiness(diagnosis), 2);
});

test('low available memory is a hard stop', () => {
  const runtime = healthyRuntime();
  runtime.memory.available_bytes = 1_000_000_000;
  const diagnosis = diagnose(runtime);
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'MEMORY_HARD_STOP'));
  assert.equal(diagnosis.runtime.memory.availableBytes, 1_000_000_000);
});

test('swap pressure reaching the configured ceiling is a hard stop', () => {
  const runtime = healthyRuntime();
  runtime.memory.swap_used_bytes = 4_000_000_000;
  const diagnosis = diagnose(runtime);
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'SWAP_HARD_STOP'));
});

test('missing or nonsensical resource thresholds fail closed', () => {
  const runtime = healthyRuntime();
  runtime.disk.hard_stop_free_bytes = 0;
  runtime.memory.available_bytes = runtime.memory.physical_bytes + 1;
  runtime.memory.hard_stop_swap_used_bytes = 0;
  const diagnosis = diagnose(runtime);
  const codes = diagnosis.blockers.map((blocker) => blocker.code);
  assert.ok(codes.includes('DISK_EVIDENCE_INVALID'));
  assert.ok(codes.includes('MEMORY_EVIDENCE_INVALID'));
  assert.ok(codes.includes('SWAP_EVIDENCE_INVALID'));
});

test('stale heartbeat, database migration, queue persistence, and required provider each block resume', () => {
  const runtime = healthyRuntime();
  runtime.heartbeat.fresh = false;
  runtime.database.migration_state = 'PENDING';
  runtime.queue.persistent = false;
  runtime.providers[0].available = false;
  const diagnosis = diagnose(runtime);
  const codes = diagnosis.blockers.map((blocker) => blocker.code);
  assert.ok(codes.includes('HEARTBEAT_STALE'));
  assert.ok(codes.includes('DATABASE_SCHEMA_NOT_CURRENT'));
  assert.ok(codes.includes('QUEUE_NOT_PERSISTENT'));
  assert.ok(codes.includes('REQUIRED_PROVIDER_UNAVAILABLE'));
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
});

test('stale durable snapshots block resume even with otherwise healthy runtime evidence', () => {
  const { state, queue, blockerSnapshot } = snapshots();
  const diagnosis = diagnosePercyRuntimeReadiness({
    state,
    queue,
    blockers: blockerSnapshot,
    runtime: healthyRuntime(),
    now: new Date('2026-08-30T12:00:00.000Z'),
    maxAgeHours: 24,
  });
  assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE');
  assert.ok(diagnosis.blockers.some((blocker) => blocker.code === 'STALE_DURABLE_STATE'));
});
