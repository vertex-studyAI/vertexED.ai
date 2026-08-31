import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { diagnosePercySnapshots, exitCodeForDiagnosis } from '../scripts/percy-state-doctor.mjs';

function validSnapshots() {
  return {
    state: {
      schema_version: 1,
      engine: 'PERCY 16384X',
      run_started_at: '2026-08-02T15:42:00+05:30',
      completed_iterations: 11,
      last_completed_iteration: 'PERCY-00011',
      next_iteration: 'PERCY-00012',
    },
    queue: {
      schema_version: 1,
      as_of: '2026-08-02T15:42:00+05:30',
      tasks: [
        { rank: 1, action: 'First' },
        { rank: 2, action: 'Second' },
      ],
    },
    blockers: {
      schema_version: 1,
      as_of: '2026-08-02T15:42:00+05:30',
      blockers: [
        { id: 'BLOCKER-1', status: 'OPEN' },
      ],
    },
  };
}

test('valid but old Percy snapshots are explicitly stale, not runtime evidence', () => {
  const diagnosis = diagnosePercySnapshots({
    ...validSnapshots(),
    now: new Date('2026-08-12T18:00:00+05:30'),
    maxAgeHours: 72,
  });

  assert.equal(diagnosis.verdict, 'STALE_SNAPSHOT');
  assert.equal(diagnosis.errors.length, 0);
  assert.equal(diagnosis.freshness.status, 'STALE');
  assert.equal(diagnosis.runtimeEvidence, false);
  assert.equal(exitCodeForDiagnosis(diagnosis), 0);
  assert.equal(exitCodeForDiagnosis(diagnosis, { requireFresh: true }), 2);
});

test('one fresh file cannot mask an older required snapshot', () => {
  const snapshots = validSnapshots();
  snapshots.queue.as_of = '2026-08-05T15:42:00+05:30';
  snapshots.blockers.as_of = '2026-08-05T15:42:00+05:30';

  const diagnosis = diagnosePercySnapshots({
    ...snapshots,
    now: new Date('2026-08-05T16:00:00+05:30'),
    maxAgeHours: 24,
  });

  assert.equal(diagnosis.verdict, 'STALE_SNAPSHOT');
  assert.equal(diagnosis.freshness.status, 'STALE');
  assert.equal(diagnosis.freshness.oldestSnapshotAt, '2026-08-02T10:12:00.000Z');
  assert.match(diagnosis.warnings.join('\n'), /oldest required snapshot/);
  assert.equal(exitCodeForDiagnosis(diagnosis, { requireFresh: true }), 2);
});

test('iteration discontinuity fails closed', () => {
  const snapshots = validSnapshots();
  snapshots.state.next_iteration = 'PERCY-00015';

  const diagnosis = diagnosePercySnapshots({
    ...snapshots,
    now: new Date('2026-08-02T16:00:00+05:30'),
  });

  assert.equal(diagnosis.verdict, 'INVALID');
  assert.match(diagnosis.errors.join('\n'), /must immediately follow/);
  assert.equal(exitCodeForDiagnosis(diagnosis), 1);
});

test('duplicate queue ranks and blocker ids fail closed', () => {
  const snapshots = validSnapshots();
  snapshots.queue.tasks[1].rank = 1;
  snapshots.blockers.blockers.push({ id: 'BLOCKER-1', status: 'OPEN' });

  const diagnosis = diagnosePercySnapshots({
    ...snapshots,
    now: new Date('2026-08-02T16:00:00+05:30'),
  });

  assert.equal(diagnosis.verdict, 'INVALID');
  assert.match(diagnosis.errors.join('\n'), /task ranks must be unique/);
  assert.match(diagnosis.errors.join('\n'), /blocker ids must be unique/);
});

test('repository Percy durable snapshot is structurally valid and never treated as live runtime proof', () => {
  const state = JSON.parse(fs.readFileSync('.percy/state.json', 'utf8'));
  const queue = JSON.parse(fs.readFileSync('.percy/task_queue.json', 'utf8'));
  const blockers = JSON.parse(fs.readFileSync('.percy/blockers.json', 'utf8'));

  const diagnosis = diagnosePercySnapshots({
    state,
    queue,
    blockers,
    now: new Date(),
  });

  assert.notEqual(diagnosis.verdict, 'INVALID', diagnosis.errors.join('\n'));
  assert.equal(diagnosis.runtimeEvidence, false);
  assert.equal(diagnosis.iteration.completed, state.completed_iterations);
  assert.equal(diagnosis.queue.taskCount, queue.tasks.length);
  assert.equal(diagnosis.blockers.count, blockers.blockers.length);
});
