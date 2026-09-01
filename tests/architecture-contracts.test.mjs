import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const api = await readFile(new URL('../api/[[...path]].js', import.meta.url), 'utf8');
const userContent = await readFile(new URL('../api/_handlers/user-content.js', import.meta.url), 'utf8');
const domain = await readFile(new URL('../src/types/domain.ts', import.meta.url), 'utf8');

test('one route authority owns the canonical React surface', () => {
  assert.match(app, /<Routes>/);
  assert.match(app, /path="learning-hub" element={<Navigate to="\/main"/);
  assert.match(app, /path="world-model" element={<Navigate to="\/study-notebook"/);
});

test('one catch-all function delegates through the explicit route registry', () => {
  assert.match(api, /dispatchRoute/);
  assert.doesNotMatch(api, /SUPABASE_SERVICE_ROLE_KEY/);
});

test('user-content ownership comes from verified auth and scopes mutations', () => {
  assert.match(userContent, /const user = await verifyAuthUser/);
  assert.match(userContent, /\.eq\('user_id', user\.id\)/);
  assert.doesNotMatch(userContent, /body\?\.user_id/);
});

test('domain types cover every required learning boundary', () => {
  for (const contract of [
    'UserIdentity', 'LearnerProfileContract', 'CourseSubjectContract', 'MockAssessmentContract',
    'LearnerResponseContract', 'RubricFeedbackContract', 'NoteContract', 'StudyPlanContract',
    'AiRunMetadataContract',
  ]) {
    assert.match(domain, new RegExp(`export type ${contract}`));
  }
});

test('AI metadata contract explicitly forbids sensitive payload storage', () => {
  const aiMetadata = domain.slice(domain.indexOf('export type AiRunMetadataContract'));
  assert.match(aiMetadata, /sensitivePayloadStored: false/);
  assert.doesNotMatch(aiMetadata, /promptText|answerText|email:/);
});
