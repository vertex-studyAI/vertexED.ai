import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { plannerPlanError } from '../src/lib/plannerPlanError.mjs';

test('plannerPlanError never echoes raw provider details', () => {
  assert.match(plannerPlanError(new Error('Gemini 429 quota org-secret')), /Too many planner requests/i);
  assert.doesNotMatch(plannerPlanError(new Error('Gemini 429 quota org-secret')), /org-secret/);
  assert.match(plannerPlanError(new Error('Failed to fetch')), /connection/i);
  assert.match(plannerPlanError(new Error('stack dump')), /Could not generate a week plan/i);
  assert.doesNotMatch(plannerPlanError(new Error('stack dump')), /stack dump/);
});

test('plannerPlanError action variants stay sanitized', () => {
  assert.match(plannerPlanError(new Error('Gemini 429 quota org-secret'), 'suggest-task'), /Too many AI planner requests/i);
  assert.doesNotMatch(plannerPlanError(new Error('Gemini 429 quota org-secret'), 'suggest-task'), /org-secret/);
  assert.match(plannerPlanError(new Error('Failed to fetch'), 'add-task'), /manual entry/i);
  assert.match(plannerPlanError(new Error('stack dump'), 'edit-task'), /Could not update this task/);
  assert.doesNotMatch(plannerPlanError(new Error('stack dump'), 'edit-task'), /stack dump/);
  assert.match(plannerPlanError(new Error('stack dump'), 'add-task'), /Could not add this task/);
  assert.match(plannerPlanError(new Error('stack dump'), 'suggest-task'), /Could not suggest a task/i);
});

test('plannerPlanError preserves short client validation copy', () => {
  assert.equal(plannerPlanError(new Error('Task name is required.'), 'add-task'), 'Task name is required.');
  assert.equal(plannerPlanError(new Error('Tasks overlap on this date.'), 'edit-task'), 'Tasks overlap on this date.');
});

test('PlannerView wires plannerPlanError for all planner failure paths', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/features/study-calendar/PlannerView.tsx'), 'utf8');
  assert.match(source, /import \{ plannerPlanError \} from "@\/lib\/plannerPlanError\.mjs"/);
  assert.match(source, /setPlanError\(plannerPlanError\(e\)\)/);
  assert.match(source, /setEditError\(plannerPlanError\(error, "edit-task"\)\)/);
  assert.match(source, /setAiError\(plannerPlanError\(error, "add-task"\)\)/);
  assert.match(source, /setAiError\(plannerPlanError\(error, "suggest-task"\)\)/);
  assert.doesNotMatch(source, /setPlanError\(e instanceof Error \? e\.message/);
  assert.doesNotMatch(source, /setEditError\(error instanceof Error \? error\.message/);
  assert.doesNotMatch(source, /setAiError\(error instanceof Error \? error\.message/);
});
