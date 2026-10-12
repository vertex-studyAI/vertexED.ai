import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient } from '@supabase/supabase-js';
import accountExportHandler from '../api/_handlers/account-export.js';
import { listAllOwnedRows } from '../api/_lib/accountExport.js';
import { createMocks } from './helpers/mock-http.mjs';

const queryFor = (dataset, ranges = []) => () => ({
  async range(from, to) {
    ranges.push([from, to]);
    return { data: dataset.slice(from, to + 1), error: null };
  },
});

test('account export rejects malformed successful pages instead of treating them as empty', async () => {
  for (const data of [null, undefined, {}, '', 0, [null], ['record'], [[]]]) {
    await assert.rejects(
      listAllOwnedRows(() => ({ range: async () => ({ data, error: null }) })),
      { code: 'EXPORT_INVALID_PAGE' },
    );
  }
});

test('account export rejects malformed completion probes after a full row allowance', async () => {
  for (const data of [null, undefined, {}, '']) {
    await assert.rejects(listAllOwnedRows(() => ({
      range: async (from) => ({ data: from === 0 ? [{ id: 'one' }] : data, error: null }),
    }), { pageSize: 1, maxRows: 1 }), { code: 'EXPORT_INVALID_PAGE' });
  }
});

test('account export enforces an exact cap when the final page is smaller than the page size', async () => {
  const dataset = Array.from({ length: 5 }, (_, id) => ({ id }));
  const ranges = [];
  assert.deepEqual(await listAllOwnedRows(queryFor(dataset, ranges), { pageSize: 2, maxRows: 5 }), dataset);
  assert.deepEqual(ranges, [[0, 1], [2, 3], [4, 4], [5, 5]]);
  await assert.rejects(
    listAllOwnedRows(queryFor([...dataset, { id: 5 }]), { pageSize: 2, maxRows: 5 }),
    { code: 'EXPORT_ROW_LIMIT' },
  );
});

test('account export does not accept more rows than the requested range', async () => {
  await assert.rejects(listAllOwnedRows(() => ({
    range: async () => ({ data: [{ id: 1 }, { id: 2 }], error: null }),
  }), { pageSize: 1, maxRows: 2 }), { code: 'EXPORT_INVALID_PAGE' });
});

test('account export validates pagination options before querying', async () => {
  for (const options of [
    { pageSize: 0 }, { pageSize: -1 }, { pageSize: 1.5 }, { pageSize: '2' },
    { pageSize: Infinity }, { maxRows: 0 }, { maxRows: -1 }, { maxRows: 1.5 },
    { maxRows: NaN }, { maxRows: Number.MAX_SAFE_INTEGER + 1 },
  ]) {
    let calls = 0;
    await assert.rejects(listAllOwnedRows(() => {
      calls += 1;
      throw new Error('Invalid pagination must fail before querying');
    }, options), TypeError);
    assert.equal(calls, 0);
  }
});

test('account export rejects repeated owner-row identities across pages', async () => {
  await assert.rejects(listAllOwnedRows(queryFor([
    { id: 'one' }, { id: 'two' }, { id: 'one' },
  ]), { pageSize: 2, maxRows: 5, rowKey: row => row.id }), { code: 'EXPORT_DUPLICATE_ROW' });
});

test('account export rejects missing configured row identities', async () => {
  for (const id of [undefined, null, '', ' ', 7]) {
    await assert.rejects(listAllOwnedRows(queryFor([{ id }]), {
      rowKey: row => row.id,
    }), { code: 'EXPORT_INVALID_PAGE' });
  }
});

test('account export preserves an upstream error and accepts an explicitly empty list', async () => {
  const error = new Error('Synthetic unavailable database');
  await assert.rejects(listAllOwnedRows(() => ({ range: async () => ({ data: null, error }) })), e => e === error);
  assert.deepEqual(await listAllOwnedRows(queryFor([])), []);
});

test('locked Supabase SDK successful null/empty-body responses cannot produce complete export pages', async () => {
  for (const response of [() => Response.json(null), () => new Response(null, { status: 204 })]) {
    const supabase = createClient('https://export-fixture.supabase.co', 'fixture-key', {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: async () => response() },
    });
    await assert.rejects(listAllOwnedRows(() => supabase
      .from('user_study_artifacts').select('id').eq('user_id', 'user-1').order('id')),
    { code: 'EXPORT_INVALID_PAGE' });
  }
});

function installExportBackend(t, { malformedArtifacts = false, duplicateArtifacts = false } = {}) {
  const environment = {
    SUPABASE_URL: 'https://export-fixture.supabase.co',
    SUPABASE_ANON_KEY: 'fixture-anon',
    SUPABASE_PUBLISHABLE_KEY: 'fixture-publishable',
    SUPABASE_SERVICE_ROLE_KEY: 'fixture-server',
    WAITLIST_RATE_LIMIT_SALT: 'fixture-salt',
  };
  const previous = Object.fromEntries(Object.keys(environment).map(key => [key, process.env[key]]));
  Object.assign(process.env, environment);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const initialTimestamp = '2026-10-01T00:00:00.000Z';
  const artifacts = Array.from({ length: 501 }, (_, i) => ({
    id: `artifact-${String(i).padStart(4, '0')}`, kind: 'note', title: `Note ${i}`,
    payload: { text: `Owned note ${i}` }, updated_at: initialTimestamp,
  }));
  const state = Array.from({ length: 501 }, (_, i) => ({
    state_type: i < 250 ? 'retry' : 'weakness', state_key: `item-${String(i).padStart(4, '0')}`,
    payload: { value: i }, updated_at: initialTimestamp,
  }));
  const visited = [];
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    assert.equal(url.origin, 'https://export-fixture.supabase.co');
    visited.push(url);
    if (url.pathname === '/auth/v1/user') return Response.json({ id: 'user-1', email: 'learner@example.com' });
    if (url.pathname === '/rest/v1/rpc/consume_waitlist_rate_limit') return Response.json([{ allowed: true }]);
    const table = url.pathname.split('/').at(-1);
    if (table === 'profiles' || table === 'waitlist') {
      assert.equal(url.searchParams.get(table === 'profiles' ? 'id' : 'auth_user_id'), 'eq.user-1');
      return Response.json([]);
    }
    assert.ok(['user_study_artifacts', 'learner_state_items'].includes(table));
    assert.equal(url.searchParams.get('user_id'), 'eq.user-1');
    if (table === 'user_study_artifacts' && malformedArtifacts) return Response.json(null);
    const dataset = table === 'user_study_artifacts' ? artifacts : state;
    const from = Number(url.searchParams.get('offset') || 0);
    const count = Number(url.searchParams.get('limit'));
    assert.equal(count, 500);
    // A learner edits the last record after page one. Offset pagination sorted
    // by updated_at would now repeat an already-read row and omit the edited one.
    if (from > 0) dataset.at(-1).updated_at = '2026-10-11T00:00:00.000Z';
    const columns = (url.searchParams.get('order') || '').split(',').map(part => part.split('.'));
    const sorted = [...dataset].sort((a, b) => {
      for (const [key, direction] of columns) {
        const compared = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
        if (compared) return direction === 'desc' ? -compared : compared;
      }
      return 0;
    });
    const page = sorted.slice(from, from + count);
    if (duplicateArtifacts && table === 'user_study_artifacts' && from > 0) page[0] = artifacts[0];
    return Response.json(page);
  });
  return { artifacts, state, visited };
}

test('actual authenticated export keeps every owned row when existing records are edited between pages', async t => {
  const { artifacts, state, visited } = installExportBackend(t);
  const mock = createMocks({ method: 'GET', headers: { authorization: 'Bearer fixture-token' } });
  await accountExportHandler(mock.req, mock.res);
  assert.equal(mock.getStatus(), 200);
  const result = mock.getJson();
  assert.equal(result.complete, true);
  assert.equal(result.counts.studyArtifacts, 501);
  assert.equal(result.counts.learnerState, 501);
  assert.deepEqual(result.studyArtifacts.map(row => row.id), artifacts.map(row => row.id));
  assert.deepEqual(result.learnerState.map(row => [row.state_type, row.state_key]), state.map(row => [row.state_type, row.state_key]));
  assert.ok(visited.some(url => url.pathname === '/auth/v1/user'));
  assert.ok(visited.some(url => url.pathname === '/rest/v1/rpc/consume_waitlist_rate_limit'));
});

test('actual export handler returns 503 without partial data for malformed or repeated pages', async t => {
  for (const options of [{ malformedArtifacts: true }, { duplicateArtifacts: true }]) {
    await t.test(JSON.stringify(options), async subtest => {
      installExportBackend(subtest, options);
      const mock = createMocks({ method: 'GET', headers: { authorization: 'Bearer fixture-token' } });
      await accountExportHandler(mock.req, mock.res);
      assert.equal(mock.getStatus(), 503);
      assert.deepEqual(mock.getJson(), { error: 'A complete account export is temporarily unavailable. Try again later.' });
    });
  }
});
