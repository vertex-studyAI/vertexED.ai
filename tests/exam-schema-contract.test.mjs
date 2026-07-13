import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260712_core_learning_exam_architecture.sql', import.meta.url), 'utf8');
const handler = await readFile(new URL('../api/_handlers/exam-catalog.js', import.meta.url), 'utf8');

test('assessment handler uses the persisted assessment-session contract', () => {
  for (const requiredColumn of [
    'session_id uuid not null references public.assessment_sessions',
    'question_version_snapshot jsonb not null',
    'rubric_version_snapshot jsonb not null',
    'submitted_at timestamptz',
    'selection_rule_version text not null',
  ]) {
    assert.ok(migration.includes(requiredColumn), `migration must contain ${requiredColumn}`);
  }
  for (const handlerField of ['session_id:', 'question_version_snapshot:', 'rubric_version_snapshot:', 'submitted_at:', 'selection_rule_version:']) {
    assert.ok(handler.includes(handlerField), `handler must write ${handlerField}`);
  }
  assert.doesNotMatch(handler, /assessment_session_id|question_snapshot|rubric_snapshot|completed_at/);
});

test('mastery evidence remains tied to a response and grading run', () => {
  for (const requiredColumn of ['assessment_response_id uuid', 'grading_run_id uuid', 'outcome numeric', 'reliability numeric', 'evidence_kind text']) {
    assert.ok(migration.includes(requiredColumn), `migration must contain ${requiredColumn}`);
  }
  for (const handlerField of ['assessment_response_id:', 'grading_run_id:', 'outcome:', 'reliability,', "evidence_kind: 'selected_response'"]) {
    assert.ok(handler.includes(handlerField), `handler must write ${handlerField}`);
  }
});
