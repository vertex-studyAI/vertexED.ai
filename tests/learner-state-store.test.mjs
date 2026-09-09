import assert from 'node:assert/strict';
import test from 'node:test';

import {
  listLearnerStateItems,
  normalizeLearnerStateItem,
  syncLearnerStateItem,
  syncLearnerStateItems,
} from '../api/_lib/learnerStateStore.js';

const validItem = {
  stateType: 'retry',
  stateKey: 'retry:biology:photosynthesis',
  payload: { id: 'retry:biology:photosynthesis', status: 'scheduled' },
  clientRevision: 'state:1788652800000:00000000-0000-4000-8000-000000000001',
  clientUpdatedAt: '2026-09-06T00:00:00.000Z',
};

test('learner-state writes accept only bounded typed records and safe revisions', () => {
  assert.deepEqual(normalizeLearnerStateItem(validItem), validItem);
  assert.equal(normalizeLearnerStateItem({ ...validItem, stateType: 'profile' }), null);
  assert.equal(normalizeLearnerStateItem({ ...validItem, stateKey: '../other-user' }), null);
  assert.equal(normalizeLearnerStateItem({ ...validItem, clientRevision: 'newest' }), null);
  assert.equal(normalizeLearnerStateItem({ ...validItem, payload: [] }), null);
  assert.equal(normalizeLearnerStateItem({ ...validItem, payload: { value: 'x'.repeat(262_145) } }), null);
});

test('learner-state batches use one owner-bound RPC call', async () => {
  let call;
  const supabase = { rpc: async (name, args) => { call = { name, args }; return { data: [], error: null }; } };
  await syncLearnerStateItems(supabase, 'owner-id', [validItem]);
  assert.deepEqual(call, {
    name: 'sync_learner_state_items',
    args: { p_user_id: 'owner-id', p_items: [validItem] },
  });
});

test('learner-state RPC binds every write to the verified user id', async () => {
  let call;
  const supabase = {
    rpc: async (name, args) => {
      call = { name, args };
      return { data: [{ applied: true, client_revision: validItem.clientRevision }], error: null };
    },
  };
  const result = await syncLearnerStateItem(supabase, '00000000-0000-4000-8000-000000000099', validItem);
  assert.equal(result.data.applied, true);
  assert.deepEqual(call, {
    name: 'sync_learner_state_item',
    args: {
      p_user_id: '00000000-0000-4000-8000-000000000099',
      p_state_type: validItem.stateType,
      p_state_key: validItem.stateKey,
      p_payload: validItem.payload,
      p_client_revision: validItem.clientRevision,
      p_client_updated_at: validItem.clientUpdatedAt,
    },
  });
});

test('learner-state reads are owner scoped and bounded', async () => {
  const calls = [];
  const chain = {
    select(value) { calls.push(['select', value]); return this; },
    eq(field, value) { calls.push(['eq', field, value]); return this; },
    order(field, options) { calls.push(['order', field, options]); return this; },
    limit(value) { calls.push(['limit', value]); return Promise.resolve({ data: [], error: null }); },
  };
  const supabase = { from(table) { calls.push(['from', table]); return chain; } };
  await listLearnerStateItems(supabase, 'owner-id');
  assert.deepEqual(calls, [
    ['from', 'learner_state_items'],
    ['select', 'state_type, state_key, payload, client_revision, client_updated_at, updated_at'],
    ['eq', 'user_id', 'owner-id'],
    ['order', 'state_type', { ascending: true }],
    ['order', 'state_key', { ascending: true }],
    ['limit', 501],
  ]);
});

test('pagination returns every row across the boundary and rejects injected cursor syntax', async () => {
  const rows = Array.from({ length: 501 }, (_, i) => ({ state_type: 'retry', state_key: `retry:${String(i).padStart(3, '0')}` }));
  let cursorFilter = null;
  const db = { from() { return {
    select() { return this; }, eq() { return this; }, order() { return this; },
    or(value) { cursorFilter = value; return this; },
    async limit() { return { data: cursorFilter ? rows.slice(500) : rows, error: null }; },
  }; } };
  const first = await listLearnerStateItems(db, 'owner');
  assert.equal(first.data.length, 500);
  assert.equal(first.nextCursor, 'retry:retry:499');
  const second = await listLearnerStateItems(db, 'owner', first.nextCursor);
  assert.deepEqual(second.data, [rows[500]]);
  assert.equal(second.nextCursor, null);
  assert.equal(cursorFilter, 'state_type.gt.retry,and(state_type.eq.retry,state_key.gt.retry:499)');
  await assert.rejects(listLearnerStateItems(db, 'owner', 'retry:x),user_id.neq.owner'), /Invalid learner-state cursor/);
});
