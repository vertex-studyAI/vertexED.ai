import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { materializeRevisionGraph, normalizeRevisionEvent, revisionEventHash } from '../api/_lib/revisionHistory.js';
import { decodeRevisionCursor, encodeRevisionCursor } from '../api/_lib/revisionHistoryStore.js';

const feedbackId = '11111111-1111-4111-8111-111111111111';
const confirmationId = '22222222-2222-4222-8222-222222222222';
const retractionId = '33333333-3333-4333-8333-333333333333';

function event(overrides = {}) {
  return {
    id: feedbackId,
    eventType: 'feedback',
    occurredAt: '2026-10-19T00:00:00.000Z',
    evidenceStatus: 'evidence-linked',
    sourceType: 'answer-review',
    sourceKey: 'audit:fixture',
    sourceRevision: 'vertexed.answer-review.v1:audit-fixture',
    parentEventIds: [],
    payload: { label: 'Suggested feedback', summary: 'Metadata only.', route: '/answer-reviewer' },
    ...overrides,
  };
}

test('revision events are bounded metadata with stable canonical hashes', () => {
  const first = normalizeRevisionEvent(event(), Date.parse('2026-10-19T01:00:00Z'));
  const reordered = normalizeRevisionEvent({ ...event(), payload: { route: '/answer-reviewer', summary: 'Metadata only.', label: 'Suggested feedback' } }, Date.parse('2026-10-19T01:00:00Z'));
  assert.equal(first.payloadSha256, reordered.payloadSha256);
  assert.equal(first.payloadSha256, revisionEventHash({ ...first, payloadSha256: undefined }));
  assert.equal(normalizeRevisionEvent(event({ payload: { answer: 'private learner answer' } })), null);
  assert.equal(normalizeRevisionEvent(event({ payload: { route: 'javascript:alert(1)' } })), null);
  assert.equal(normalizeRevisionEvent(event({ payload: { route: '//untrusted.example/path' } })), null);
  assert.equal(normalizeRevisionEvent(event({ occurredAt: 'not-a-date' })), null);
});

test('retractions preserve history while changing the effective evidence state', () => {
  const graph = materializeRevisionGraph([
    event(),
    event({ id: confirmationId, eventType: 'confirmation', evidenceStatus: 'learner-attested', occurredAt: '2026-10-19T00:05:00.000Z', parentEventIds: [feedbackId] }),
    event({ id: retractionId, eventType: 'retraction', evidenceStatus: 'retracted', occurredAt: '2026-10-19T00:10:00.000Z', parentEventIds: [confirmationId] }),
  ]);
  assert.equal(graph.find(row => row.id === confirmationId).effectiveEvidenceStatus, 'retracted');
  assert.equal(graph.length, 3);
  assert.equal(graph[0].id, retractionId);
});

test('revision-history pagination cursors are opaque, stable and validated', () => {
  const cursor = encodeRevisionCursor({ occurred_at: '2026-10-19T00:10:00.000Z', id: retractionId });
  assert.deepEqual(decodeRevisionCursor(cursor), { occurredAt: '2026-10-19T00:10:00.000Z', id: retractionId });
  assert.throws(() => decodeRevisionCursor(Buffer.from(JSON.stringify({ occurredAt: 'yesterday', id: retractionId })).toString('base64url')), /Invalid revision-history cursor/);
  assert.throws(() => decodeRevisionCursor('not-json'), /Invalid revision-history cursor/);
});

test('revision graph migration is owner-scoped, append-only to the app and metadata bounded', () => {
  const sql = fs.readFileSync('supabase/migrations/20261019031851_verified_revision_graph.sql', 'utf8');
  const handler = fs.readFileSync('api/_handlers/revision-history.js', 'utf8');
  assert.match(sql, /references auth\.users\(id\) on delete cascade/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /force row level security/i);
  assert.match(sql, /revoke all on table public\.revision_events from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert on table public\.revision_events to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]*delete/i);
  assert.match(sql, /pg_column_size\(payload\) <= 8192/i);
  assert.doesNotMatch(handler, /\.update\(|\.delete\(/);
  assert.match(handler, /nextCursor/);
});
