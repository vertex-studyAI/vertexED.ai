import assert from 'node:assert/strict';
import test from 'node:test';

import { replacePlannerArtifact } from '../api/_lib/userContentStore.js';

function fakeSupabase({ existing = null, lookupError = null, updateError = null, insertError = null } = {}) {
  const calls = [];
  const resultRow = { id: existing?.id ?? 'new-planner', kind: 'planner', title: 'Study Planner' };

  const makeEqChain = (terminal) => {
    const chain = {
      eq(field, value) { calls.push(['eq', field, value]); return chain; },
      order(field, options) { calls.push(['order', field, options]); return chain; },
      limit(value) { calls.push(['limit', value]); return chain; },
      select(fields) { calls.push(['select', fields]); return chain; },
      maybeSingle: async () => terminal('maybeSingle'),
      single: async () => terminal('single'),
    };
    return chain;
  };

  return {
    calls,
    client: {
      from(table) {
        calls.push(['from', table]);
        return {
          select(fields) {
            calls.push(['select', fields]);
            return makeEqChain(async (mode) => {
              calls.push([mode]);
              return { data: existing, error: lookupError };
            });
          },
          update(values) {
            calls.push(['update', values]);
            return makeEqChain(async (mode) => {
              calls.push([mode]);
              return { data: updateError ? null : resultRow, error: updateError };
            });
          },
          insert(values) {
            calls.push(['insert', values]);
            return makeEqChain(async (mode) => {
              calls.push([mode]);
              return { data: insertError ? null : resultRow, error: insertError };
            });
          },
        };
      },
    },
  };
}

test('planner replace updates the current owned row without a destructive pre-delete', async () => {
  const updateError = new Error('database unavailable');
  const { client, calls } = fakeSupabase({ existing: { id: 'planner-1' }, updateError });

  const result = await replacePlannerArtifact(client, {
    userId: 'user-1',
    title: 'Study Planner',
    payload: { tasks: [{ id: 't1' }] },
    updatedAt: '2026-08-23T15:00:00.000Z',
  });

  assert.equal(result.error, updateError);
  assert.equal(calls.filter(([name]) => name === 'update').length, 1);
  assert.equal(calls.filter(([name]) => name === 'insert').length, 0);
  assert.equal(calls.some(([name]) => name === 'delete'), false);
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'user_id' && value === 'user-1'));
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'id' && value === 'planner-1'));
});

test('planner replace inserts only when no current planner exists', async () => {
  const { client, calls } = fakeSupabase({ existing: null });

  const result = await replacePlannerArtifact(client, {
    userId: 'user-2',
    title: 'Study Planner',
    payload: { tasks: [] },
    updatedAt: '2026-08-23T15:01:00.000Z',
  });

  assert.equal(result.error, null);
  assert.equal(result.created, true);
  assert.equal(calls.filter(([name]) => name === 'update').length, 0);
  assert.equal(calls.filter(([name]) => name === 'insert').length, 1);
  const insert = calls.find(([name]) => name === 'insert')?.[1];
  assert.equal(insert.user_id, 'user-2');
  assert.equal(insert.kind, 'planner');
});

test('planner replace fails closed on lookup errors before any write', async () => {
  const lookupError = new Error('lookup failed');
  const { client, calls } = fakeSupabase({ lookupError });

  const result = await replacePlannerArtifact(client, {
    userId: 'user-3',
    title: 'Study Planner',
    payload: { tasks: [] },
  });

  assert.equal(result.error, lookupError);
  assert.equal(calls.filter(([name]) => name === 'update').length, 0);
  assert.equal(calls.filter(([name]) => name === 'insert').length, 0);
});
