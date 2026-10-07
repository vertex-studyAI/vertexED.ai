import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/userContent.ts', 'utf8');

function functionBody(name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.ok(start >= 0, `${name} must exist`);
  const end = source.indexOf('\nexport function ', start + 1);
  assert.ok(end > start, `${name} must have a bounded source section`);
  return source.slice(start, end);
}

test('cloud saved-work records cross the same structural boundary as recovery records', () => {
  const body = functionBody('listStudyArtifactsDetailed');
  const parsedResponse = body.indexOf('const data = await res.json().catch(() => null)');
  const normalizedCloud = body.indexOf('.map(normalizeStoredArtifact)', parsedResponse);
  const rejectedInvalid = body.indexOf('.filter((item): item is StudyArtifact => item !== null)', normalizedCloud);
  const merged = body.indexOf('items: mergeArtifacts(cloud, local)', rejectedInvalid);

  assert.ok(parsedResponse >= 0, 'cloud response must be parsed');
  assert.ok(normalizedCloud > parsedResponse, 'cloud records must be normalized after parsing');
  assert.ok(rejectedInvalid > normalizedCloud, 'invalid cloud records must be removed');
  assert.ok(merged > rejectedInvalid, 'only validated cloud records may reach the merged learner list');
});

test('cloud saved-work no longer trusts an unchecked StudyArtifact array cast', () => {
  const body = functionBody('listStudyArtifactsDetailed');
  assert.doesNotMatch(body, /data\.items as StudyArtifact\[\]/);
});

test('the shared normalizer retains the artifact fields required for cross-session recovery', () => {
  assert.match(source, /function normalizeStoredArtifact\(value: unknown\): StudyArtifact \| null/);
  for (const field of ['id', 'kind', 'title', 'payload', 'created_at', 'updated_at']) {
    assert.match(source, new RegExp(`value\\.${field}`), `normalizer must validate ${field}`);
  }
});
