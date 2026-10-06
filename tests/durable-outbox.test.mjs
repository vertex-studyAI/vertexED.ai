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

function installReadTransaction(t, rows) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
  const read = { result: rows };
  const transaction = { objectStore: () => ({ getAll: () => read }) };
  let closes = 0;
  const open = {
    result: {
      transaction: () => transaction,
      close: () => { closes += 1; },
    },
  };
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: { open: () => open },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'indexedDB', original);
    else delete globalThis.indexedDB;
  });
  return { open, read, transaction, closes: () => closes };
}

const accountRecord = {
  id: '["artifact","account","note:1"]',
  channel: 'artifact',
  scope: 'account',
  logicalKey: 'note:1',
  revision: 'revision',
  payload: { text: 'Unsynced study notes' },
  updatedAt: '2026-10-06T00:00:00.000Z',
};

test('outbox reads wait for transaction completion and preserve account/channel filtering', async (t) => {
  const db = installReadTransaction(t, [
    accountRecord,
    { ...accountRecord, scope: 'another-account' },
    { ...accountRecord, channel: 'learner-state' },
  ]);
  let settled = false;
  const result = listDurableOutboxRecords('artifact', 'account', true);
  void result.then(() => { settled = true; });
  db.open.onsuccess();
  await new Promise(setImmediate);
  db.read.onsuccess();
  await new Promise(setImmediate);

  assert.equal(settled, false, 'request success alone does not prove a completed read');
  assert.equal(db.closes(), 0);
  db.transaction.oncomplete();
  assert.deepEqual(await result, [accountRecord]);
  assert.equal(db.closes(), 1);
});

test('strict account exports reject an abort after a successful outbox request', async (t) => {
  const db = installReadTransaction(t, [accountRecord]);
  const result = listDurableOutboxRecords('artifact', 'account', true);
  const rejected = assert.rejects(result, /Could not finish reading recovery storage/);
  db.open.onsuccess();
  await new Promise(setImmediate);
  db.read.onsuccess();
  db.transaction.onabort();

  await rejected;
  assert.equal(db.closes(), 1);
});

test('ordinary recovery discards records from an aborted read transaction', async (t) => {
  const db = installReadTransaction(t, [accountRecord]);
  const result = listDurableOutboxRecords('artifact', 'account');
  db.open.onsuccess();
  await new Promise(setImmediate);
  db.read.onsuccess();
  db.transaction.onabort();

  assert.deepEqual(await result, []);
  assert.equal(db.closes(), 1);
});
