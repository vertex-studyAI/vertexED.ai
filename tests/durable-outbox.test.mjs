import assert from 'node:assert/strict';
import test from 'node:test';

import {
  deleteDurableOutboxRecord,
  listDurableOutboxRecords,
  putDurableOutboxRecord,
} from '../src/lib/durableOutbox.ts';

test('durable outbox fails safely when IndexedDB is unavailable', async () => {
  assert.equal(await putDurableOutboxRecord({
    channel: 'learner-state',
    scope: 'account',
    logicalKey: 'retry:item',
    revision: 'revision',
    payload: {},
    updatedAt: '2026-09-06T00:00:00.000Z',
  }), false);
  assert.deepEqual(await listDurableOutboxRecords('learner-state', 'account'), []);
  assert.equal(await deleteDurableOutboxRecord('learner-state', 'account', 'retry:item', 'revision'), false);
});
