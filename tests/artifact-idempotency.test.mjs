import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createStudyArtifact } from '../api/_lib/userContentStore.js';

function fakeSupabase({ insertData = null, insertError = null, replayData = null, replayError = null } = {}) {
  const calls = [];
  const chain = (terminal) => {
    const value = {
      select(fields) { calls.push(['select', fields]); return value; },
      eq(field, expected) { calls.push(['eq', field, expected]); return value; },
      single: async () => terminal('single'),
      maybeSingle: async () => terminal('maybeSingle'),
    };
    return value;
  };
  return {
    calls,
    client: {
      from(table) {
        calls.push(['from', table]);
        return {
          insert(record) {
            calls.push(['insert', record]);
            return chain(async (mode) => {
              calls.push([mode]);
              return { data: insertData, error: insertError };
            });
          },
          select(fields) {
            calls.push(['select', fields]);
            return chain(async (mode) => {
              calls.push([mode]);
              return { data: replayData, error: replayError };
            });
          },
        };
      },
    },
  };
}

const request = {
  userId: 'user-1',
  kind: 'note',
  title: 'Algebra',
  payload: { notes: 'Factor the expression.' },
  idempotencyKey: 'artifact:operation-123',
  updatedAt: '2026-09-02T00:00:00.000Z',
};

test('first artifact write stores the owner-scoped idempotency key', async () => {
  const row = { id: 'artifact-1', kind: request.kind, title: request.title, payload: request.payload };
  const { client, calls } = fakeSupabase({ insertData: row });
  const result = await createStudyArtifact(client, request);

  assert.equal(result.created, true);
  assert.equal(result.replayed, false);
  const inserted = calls.find(([name]) => name === 'insert')[1];
  assert.equal(inserted.user_id, request.userId);
  assert.equal(inserted.idempotency_key, request.idempotencyKey);
});

test('duplicate key replays the existing identical artifact without another row', async () => {
  const duplicate = { code: '23505', message: 'unique violation' };
  const row = { id: 'artifact-1', kind: request.kind, title: request.title, payload: request.payload };
  const { client, calls } = fakeSupabase({ insertError: duplicate, replayData: row });
  const result = await createStudyArtifact(client, request);

  assert.equal(result.created, false);
  assert.equal(result.replayed, true);
  assert.equal(result.conflict, false);
  assert.equal(result.data.id, 'artifact-1');
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'user_id' && value === request.userId));
  assert.ok(calls.some(([name, field, value]) => name === 'eq' && field === 'idempotency_key' && value === request.idempotencyKey));
});

test('JSON object key order does not turn a valid replay into a conflict', async () => {
  const duplicate = { code: '23505', message: 'unique violation' };
  const orderedRequest = {
    ...request,
    payload: { metadata: { subject: 'Math', board: 'IB' }, notes: 'Equivalent' },
  };
  const row = {
    id: 'artifact-2',
    kind: request.kind,
    title: request.title,
    payload: { notes: 'Equivalent', metadata: { board: 'IB', subject: 'Math' } },
  };
  const { client } = fakeSupabase({ insertError: duplicate, replayData: row });
  const result = await createStudyArtifact(client, orderedRequest);

  assert.equal(result.replayed, true);
  assert.equal(result.conflict, false);
});

test('duplicate key with different content fails as a semantic conflict', async () => {
  const duplicate = { code: '23505', message: 'unique violation' };
  const row = { id: 'artifact-1', kind: request.kind, title: request.title, payload: { notes: 'Different' } };
  const { client } = fakeSupabase({ insertError: duplicate, replayData: row });
  const result = await createStudyArtifact(client, request);

  assert.equal(result.replayed, false);
  assert.equal(result.conflict, true);
});

test('non-unique database failures do not trigger a replay lookup', async () => {
  const failure = { code: '08006', message: 'connection failure' };
  const { client, calls } = fakeSupabase({ insertError: failure });
  const result = await createStudyArtifact(client, request);

  assert.equal(result.error, failure);
  assert.equal(result.replayed, false);
  assert.equal(calls.filter(([name]) => name === 'from').length, 1);
});

test('client retries a lost POST response with one stable idempotency key', async () => {
  const source = await readFile(new URL('../src/lib/userContent.ts', import.meta.url), 'utf8');
  assert.match(source, /const idempotencyKey = options\.idempotencyKey \|\| createArtifactIdempotencyKey\(\)/);
  assert.match(source, /const request = \(\) => authFetch[\s\S]*?JSON\.stringify\(\{ kind, title, payload, idempotencyKey \}\)/);
  assert.match(source, /catch \{[\s\S]*?res = await request\(\)/);
});

test('schema migration enforces per-user idempotency uniqueness', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20260903164601_artifact_idempotency.sql', import.meta.url), 'utf8');
  assert.match(migration, /unique \(user_id, idempotency_key\)/i);
  assert.match(migration, /idempotency_key_format/i);
});

test('artifact API distinguishes successful replay from conflicting key reuse', async () => {
  const handler = await readFile(new URL('../api/_handlers/user-content.js', import.meta.url), 'utf8');
  assert.match(handler, /if \(conflict\)[\s\S]*?res\.status\(409\)/);
  assert.match(handler, /res\.status\(replayed \? 200 : 201\)/);
  assert.doesNotMatch(handler, /json\(\{ ok: true, item: data, replayed \}\)/);
});
