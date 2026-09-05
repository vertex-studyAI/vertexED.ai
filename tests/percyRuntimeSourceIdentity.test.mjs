import assert from 'node:assert/strict';
import test from 'node:test';

import { diagnosePercyRuntimeReadiness } from '../scripts/percy-runtime-readiness.mjs';

function durableSnapshots() {
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

function runtime(head) {
  return {
    schema_version: 1,
    as_of: '2026-08-28T11:55:00.000Z',
    source: { available: true, head },
    process: { state: 'RUNNING', pid: 4242, command: 'python -m percy daemon' },
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
    providers: [{ name: 'shell', required: true, available: true }],
  };
}

function diagnose(head) {
  const snapshots = durableSnapshots();
  return diagnosePercyRuntimeReadiness({
    ...snapshots,
    runtime: runtime(head),
    now: new Date('2026-08-28T12:00:00.000Z'),
    maxAgeHours: 24,
  });
}

test('runtime readiness accepts only an exact immutable lowercase commit SHA', () => {
  const exact = '0123456789abcdef0123456789abcdef01234567';
  const diagnosis = diagnose(exact);
  assert.equal(diagnosis.verdict, 'READY_TO_RESUME');
  assert.equal(diagnosis.runtimeEvidence, true);
  assert.equal(diagnosis.runtime.sourceHead, exact);
  assert.ok(!diagnosis.blockers.some((item) => item.code === 'RUNTIME_HEAD_NOT_IMMUTABLE'));
});

test('runtime readiness rejects mutable, abbreviated, uppercase, and padded source heads', () => {
  const invalid = [
    'main',
    '0123456',
    '0123456789ABCDEF0123456789ABCDEF01234567',
    ' 0123456789abcdef0123456789abcdef01234567 ',
    '0123456789abcdef0123456789abcdef012345678',
  ];

  for (const head of invalid) {
    const diagnosis = diagnose(head);
    assert.equal(diagnosis.verdict, 'BLOCKED_RUNTIME_EVIDENCE', head);
    assert.equal(diagnosis.runtimeEvidence, false, head);
    assert.ok(
      diagnosis.blockers.some((item) => item.code === 'RUNTIME_HEAD_NOT_IMMUTABLE'),
      head,
    );
  }
});
