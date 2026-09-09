import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileSnapshot, serializeSnapshotWrite } from '../src/lib/snapshotConcurrency.mjs';
import { replaceSingletonArtifact } from '../api/_lib/userContentStore.js';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';
import { isApprovedGuide } from '../api/_lib/studyGuideRetrieval.js';

const oldTime = '2026-09-01T00:00:00.000Z';
const newTime = '2026-09-02T00:00:00.000Z';

test('concurrent device changes preserve local data and the old comparison revision', () => {
 const local = { tasks: [{ id: 'local' }], updatedAt: newTime };
 const cloud = { tasks: [{ id: 'cloud' }], updatedAt: newTime };
 const metadata = { revision: oldTime, pending: true };
 const result = reconcileSnapshot({ local, cloud, metadata });
 assert.equal(result.conflict, true);
 assert.equal(result.snapshot, local);
 assert.equal(result.metadata.revision, oldTime);
 assert.equal(reconcileSnapshot({ local, cloud, metadata, acceptCloud: true }).snapshot, cloud);
});

test('offline dirty snapshot keeps its changes when remote baseline has not changed', () => {
 const local = { tasks: ['new'], updatedAt: newTime };
 const result = reconcileSnapshot({ local, cloud: { tasks: ['old'], updatedAt: oldTime }, metadata: { revision: oldTime, pending: true } });
 assert.equal(result.snapshot, local);
 assert.equal(result.conflict, false);
 assert.equal(result.cloudSynced, false);
});

test('writes run sequentially even after the previous write failed', async () => {
 const order = [];
 const first = serializeSnapshotWrite('test', async () => { await new Promise(r => setTimeout(r, 10)); order.push(1); throw Error('offline'); });
 const second = serializeSnapshotWrite('test', async () => { order.push(2); return 'saved'; });
 await assert.rejects(first);
 assert.equal(await second, 'saved');
 assert.deepEqual(order, [1, 2]);
});

function database() {
 let row = { user_id: 'owner', kind: 'planner', updated_at: oldTime, payload: { tasks: ['old'] } };
 return { get row() { return row; }, from() {
  const filters = {};
  let update;
  const chain = {
   update(value) { update = value; return chain; },
   eq(key, value) { filters[key] = value; return chain; },
   select() { return chain; },
   async maybeSingle() { if (!Object.entries(filters).every(([key, value]) => row[key] === value)) return { data: null, error: null }; row = { ...row, ...update }; return { data: row, error: null }; },
   insert() { return { select() { return { async single() { return { data: null, error: { code: '23505' } }; } }; } }; },
  }; return chain;
 } };
}

test('conditional server writes reject stale and wrong-owner snapshots', async () => {
 const db = database();
 const save = options => replaceSingletonArtifact(db, { userId: 'owner', kind: 'planner', title: 'Plan', payload: { tasks: ['new'] }, expectedUpdatedAt: oldTime, ...options });
 assert.equal((await save({ updatedAt: newTime })).conflict, undefined);
 assert.equal((await save({ payload: { tasks: ['stale'] } })).conflict, true);
 assert.equal((await save({ userId: 'other', expectedUpdatedAt: newTime })).conflict, true);
 assert.deepEqual(db.row.payload.tasks, ['new']);
 assert.equal((await save({ expectedUpdatedAt: null })).conflict, true);
});

test('device collection and cleanup cover all stores for exactly one account', () => {
 const map = new Map([['vertex_content:a:artifacts', '[1]'], ['vertex_planner:a:updated_at:sync', '{}'], ['vertex_notebooks:a:data', '[2]'], ['vertex_content:ab:artifacts', '[3]'], ['vertex_apex:a:chat', '[4]'], ['vertex_apex:ab:chat', '[5]'], ['unrelated', 'keep']]);
 const storage = { get length() { return map.size; }, key: i => [...map.keys()][i], getItem: k => map.get(k), removeItem: k => map.delete(k) };
 assert.equal(Object.keys(collectAccountStorage(storage, 'a')).length, 4);
 clearAccountStorage(storage, 'a');
 assert.deepEqual([...map.keys()], ['vertex_content:ab:artifacts', 'vertex_apex:ab:chat', 'unrelated']);
});

test('editorial quarantine and missing provenance cannot enter approved retrieval', () => {
 const approved = { editorialStatus: 'approved', source: 'Official source', factualReviewer: 'Reviewer', reviewedAt: newTime, license: 'permitted', permittedUse: 'study' };
 assert.equal(isApprovedGuide(approved), true);
 assert.equal(isApprovedGuide({ ...approved, editorialStatus: 'quarantined' }), false);
 assert.equal(isApprovedGuide({ ...approved, source: null }), false);
});

test('another tab cannot advance this tab’s comparison revision through shared storage', async () => {
 const { captureSnapshotRevision, expectedSnapshotRevision } = await import('../src/lib/snapshotConcurrency.mjs');
 const key = 'tab-isolation';
 captureSnapshotRevision(key, oldTime);
 assert.equal(expectedSnapshotRevision(key, newTime), oldTime);
 captureSnapshotRevision(key, newTime);
 assert.equal(expectedSnapshotRevision(key), newTime);
});
