import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  STUDY_ARTIFACT_KINDS,
  normalizeArtifactIdempotencyKey,
  normalizeStudyArtifactPayload,
  parseStudyArtifactCreate,
} from '../contracts/studyArtifact.js';

const domain = await import('../src/contracts/domain.ts');

const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const handler = await readFile(new URL('../api/_handlers/user-content.js', import.meta.url), 'utf8');
const client = await readFile(new URL('../src/lib/userContent.ts', import.meta.url), 'utf8');

test('artifact kinds are canonical across runtime, SQL, API, and client routing', () => {
  assert.deepEqual(STUDY_ARTIFACT_KINDS, ['note', 'review', 'paper', 'planner', 'notebook']);
  for (const kind of STUDY_ARTIFACT_KINDS) {
    assert.match(schema, new RegExp(`'${kind}'`));
    assert.match(client, new RegExp(`case '${kind}'`));
  }
  assert.match(handler, /new Set\(STUDY_ARTIFACT_KINDS\)/);
});

test('artifact create contract normalizes text but rejects missing, null, and array payloads', () => {
  assert.deepEqual(parseStudyArtifactCreate({
    kind: 'note',
    title: '  Revision  ',
    content: 'bounded text',
  }), {
    ok: true,
    value: {
      kind: 'note',
      title: 'Revision',
      payload: { text: 'bounded text' },
      replace: false,
      idempotencyKey: null,
    },
  });

  assert.equal(parseStudyArtifactCreate({ kind: 'note' }).ok, false);
  assert.equal(parseStudyArtifactCreate({ kind: 'unknown', payload: {} }).ok, false);
  assert.equal(parseStudyArtifactCreate({ kind: 'note', payload: null }).ok, false);
  assert.equal(parseStudyArtifactCreate({ kind: 'note', payload: [] }).ok, false);
});

test('artifact idempotency keys are optional and fail closed when malformed', () => {
  assert.deepEqual(normalizeArtifactIdempotencyKey(undefined), { ok: true, value: null });
  assert.deepEqual(normalizeArtifactIdempotencyKey('artifact:12345678'), {
    ok: true,
    value: 'artifact:12345678',
  });
  assert.equal(normalizeArtifactIdempotencyKey('short').ok, false);
  assert.equal(normalizeArtifactIdempotencyKey('artifact key with spaces').ok, false);
  assert.equal(normalizeArtifactIdempotencyKey(42).ok, false);
  assert.equal(parseStudyArtifactCreate({
    kind: 'paper',
    payload: { version: 1 },
    idempotencyKey: 'artifact:stable-operation',
  }).value.idempotencyKey, 'artifact:stable-operation');
});

test('artifact update payload contract accepts only JSON records or the legacy text alias', () => {
  assert.deepEqual(normalizeStudyArtifactPayload({ version: 1 }), {
    ok: true,
    value: { version: 1 },
  });
  assert.deepEqual(normalizeStudyArtifactPayload('legacy'), {
    ok: true,
    value: { text: 'legacy' },
  });
  assert.equal(normalizeStudyArtifactPayload(null).ok, false);
  assert.equal(normalizeStudyArtifactPayload(['not', 'a', 'record']).ok, false);
});

test('typed domain schemas load at runtime and fail closed on invalid profile and rubric data', () => {
  const profile = domain.UserProfileSchema.safeParse({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'learner@example.com',
    full_name: 'Learner',
    avatar_url: null,
    board: 'IB_DP',
    grade: 12,
    subjects: ['Mathematics'],
    exam_date: '2027-05-01',
    created_at: '2026-09-01T16:57:06Z',
    updated_at: '2026-09-01T16:57:06Z',
  });
  assert.equal(profile.success, true);
  assert.equal(domain.UserProfileSchema.safeParse({}).success, false);
  assert.equal(domain.UserProfileSchema.safeParse({ ...profile.data, unexpected: true }).success, false);

  const overAwarded = domain.RubricCriterionFeedbackSchema.safeParse({
    criterion: 'Evidence',
    awarded: 6,
    available: 5,
    rationale: 'Invalid over-award',
    evidence_ids: [],
  });
  assert.equal(overAwarded.success, false);
});

test('all required architecture boundary schemas are exported', () => {
  for (const name of [
    'UserProfileSchema',
    'CourseSubjectSchema',
    'MockSchema',
    'StudentResponseSchema',
    'RubricFeedbackSchema',
    'NoteSchema',
    'StudyPlanSchema',
    'EvidenceReferenceSchema',
    'AiRunMetadataSchema',
    'StudyArtifactRowSchema',
  ]) {
    assert.equal(typeof domain[name]?.safeParse, 'function', `${name} must be a runtime schema`);
  }
});
