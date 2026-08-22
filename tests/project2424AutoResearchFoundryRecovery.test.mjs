import test from 'node:test';
import assert from 'node:assert/strict';

import {
  acquireTaskOwnership,
  appendEvidenceRecord,
  recoverTaskStates,
  releaseTaskOwnership,
  restoreFoundryState,
  snapshotFoundryState,
  verifyEvidenceJournal,
} from '../portfolio/project2424/projects/T2424-0046/src/integration.mjs';

test('hash chain detects evidence tampering', () => {
  let journal = appendEvidenceRecord([], {
    taskId: 'baseline', owner: 'worker-a', state: 'RUNNING', evidenceDigest: 'sha256:input',
  });
  journal = appendEvidenceRecord(journal, {
    taskId: 'baseline', owner: 'worker-a', state: 'DONE', evidenceDigest: 'sha256:result',
  });

  assert.equal(verifyEvidenceJournal(journal).valid, true);

  const tampered = structuredClone(journal);
  tampered[0].evidenceDigest = 'sha256:forged';
  assert.deepEqual(verifyEvidenceJournal(tampered), {
    valid: false,
    index: 0,
    reason: 'HASH_MISMATCH',
  });
});

test('ownership is exclusive and token-bound', () => {
  const first = acquireTaskOwnership({}, 'baseline', 'worker-a', 'lease-1');
  assert.equal(first.acquired, true);

  const conflict = acquireTaskOwnership(first.ownership, 'baseline', 'worker-b', 'lease-2');
  assert.equal(conflict.acquired, false);
  assert.equal(conflict.reason, 'OWNED_BY_OTHER');

  const badRelease = releaseTaskOwnership(first.ownership, 'baseline', 'worker-a', 'wrong-token');
  assert.equal(badRelease.released, false);

  const released = releaseTaskOwnership(first.ownership, 'baseline', 'worker-a', 'lease-1');
  assert.equal(released.released, true);
});

test('snapshot round-trip recovers task state after interruption', () => {
  const ownership = acquireTaskOwnership({}, 'ablation', 'worker-a', 'lease-7').ownership;
  let journal = appendEvidenceRecord([], {
    taskId: 'baseline', owner: 'worker-a', state: 'DONE', evidenceDigest: 'sha256:baseline',
  });
  journal = appendEvidenceRecord(journal, {
    taskId: 'ablation', owner: 'worker-a', state: 'RUNNING', evidenceDigest: 'sha256:checkpoint',
  });

  const snapshot = snapshotFoundryState({ journal, ownership });
  const restored = restoreFoundryState(snapshot);

  assert.equal(restored.recoveredStates.baseline.state, 'DONE');
  assert.equal(restored.recoveredStates.ablation.state, 'RUNNING');
  assert.deepEqual(restored.ownership.ablation, { owner: 'worker-a', token: 'lease-7' });
  assert.deepEqual(recoverTaskStates(restored.journal), restored.recoveredStates);
});

test('corrupted snapshot fails closed', () => {
  const journal = appendEvidenceRecord([], {
    taskId: 'baseline', owner: 'worker-a', state: 'DONE', evidenceDigest: 'sha256:baseline',
  });
  const parsed = JSON.parse(snapshotFoundryState({ journal, ownership: {} }));
  parsed.journal[0].hash = '0'.repeat(64);
  assert.throws(() => restoreFoundryState(JSON.stringify(parsed)), /invalid evidence journal/);
});
