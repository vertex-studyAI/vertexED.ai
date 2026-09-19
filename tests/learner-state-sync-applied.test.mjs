import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { partitionLearnerStateSyncResults } from '../src/lib/learnerStateSyncResult.mjs';
import { learnerStateMutationHttpStatus } from '../api/_lib/learnerStateStore.js';

const batch = [
  {
    stateType: 'weakness',
    stateKey: 'topic-a',
    payload: { id: 'topic-a' },
    clientRevision: 'state:0000000000001:aaaaaaaa',
    clientUpdatedAt: '2026-09-19T00:00:01.000Z',
  },
  {
    stateType: 'retry',
    stateKey: 'topic-b',
    payload: { id: 'topic-b' },
    clientRevision: 'state:0000000000002:bbbbbbbb',
    clientUpdatedAt: '2026-09-19T00:00:02.000Z',
  },
];

test('partitionLearnerStateSyncResults only treats applied:true as durable success', () => {
  const { applied, rejected, unresolved } = partitionLearnerStateSyncResults(batch, [
    {
      requestedRevision: 'state:0000000000001:aaaaaaaa',
      currentRevision: 'state:0000000000001:aaaaaaaa',
      applied: true,
    },
    {
      requestedRevision: 'state:0000000000002:bbbbbbbb',
      currentRevision: 'state:0000000000009:winnerxx',
      applied: false,
    },
  ]);

  assert.deepEqual(applied.map((item) => item.clientRevision), ['state:0000000000001:aaaaaaaa']);
  assert.deepEqual(rejected.map((item) => item.clientRevision), ['state:0000000000002:bbbbbbbb']);
  assert.deepEqual(unresolved, []);
});

test('partitionLearnerStateSyncResults keeps rows without results unresolved', () => {
  const { applied, rejected, unresolved } = partitionLearnerStateSyncResults(batch, [
    {
      requestedRevision: 'state:0000000000001:aaaaaaaa',
      applied: true,
    },
  ]);

  assert.equal(applied.length, 1);
  assert.equal(rejected.length, 0);
  assert.deepEqual(unresolved.map((item) => item.clientRevision), ['state:0000000000002:bbbbbbbb']);
});

test('learner-state mutation HTTP status is 409 when every write lost the CAS race', () => {
  assert.equal(
    learnerStateMutationHttpStatus([
      { requestedRevision: 'state:0000000000001:aaaaaaaa', applied: false },
      { requestedRevision: 'state:0000000000002:bbbbbbbb', applied: false },
    ]),
    409,
  );
  assert.equal(
    learnerStateMutationHttpStatus([
      { requestedRevision: 'state:0000000000001:aaaaaaaa', applied: false },
      { requestedRevision: 'state:0000000000002:bbbbbbbb', applied: true },
    ]),
    200,
  );
  assert.equal(learnerStateMutationHttpStatus([]), 500);
});

test('sync client confirms only applied writes and stops after rejected CAS rows', () => {
  const syncSource = fs.readFileSync('src/lib/learnerStateSync.ts', 'utf8');
  assert.match(syncSource, /partitionLearnerStateSyncResults\(batch, data\?\.results\)/);
  assert.match(syncSource, /removeConfirmedWrites\(\[\.\.\.applied, \.\.\.rejected\], scope\)/);
  assert.match(syncSource, /synced \+= applied\.length/);
  assert.match(syncSource, /response\.status !== 409/);
  assert.match(syncSource, /if \(rejected\.length \|\| response\.status === 409\) break/);
  assert.doesNotMatch(
    syncSource,
    /data\.results\.map\(\(item[^)]*\) => item\.requestedRevision\)/,
  );
});

test('learner-state handler refuses fake-success 200 when nothing applied', () => {
  const handlerSource = fs.readFileSync('api/_handlers/learner-state.js', 'utf8');
  assert.match(handlerSource, /learnerStateMutationHttpStatus\(results\)/);
  assert.match(handlerSource, /status === 409/);
  assert.match(handlerSource, /No learner-state writes were applied/);
});
