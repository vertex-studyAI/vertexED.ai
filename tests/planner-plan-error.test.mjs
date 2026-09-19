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
  assert.match(plannerPlanError(new Error('Planner request failed (503)'), 'task'), /Could not suggest a task/i);
  assert.doesNotMatch(plannerPlanError(new Error('Planner request failed (503)'), 'task'), /503/);
  assert.equal(
    plannerPlanError(new Error('This overlaps “Math review”. Choose another time.'), 'task'),
    'This overlaps “Math review”. Choose another time.',
  );
});

test('PlannerView wires plannerPlanError for week-plan and task failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/features/study-calendar/PlannerView.tsx'), 'utf8');
  assert.match(source, /import \{ plannerPlanError \} from "@\/lib\/plannerPlanError\.mjs"/);
  assert.match(source, /setPlanError\(plannerPlanError\(e\)\)/);
  assert.match(source, /setAiError\(plannerPlanError\(error, ['"]task['"]\)\)/);
  assert.match(source, /setEditError\(plannerPlanError\(error, ['"]task['"]\)\)/);
  assert.doesNotMatch(source, /setPlanError\(e instanceof Error \? e\.message/);
  assert.doesNotMatch(source, /setAiError\(error instanceof Error \? error\.message/);
  assert.doesNotMatch(source, /setEditError\(error instanceof Error \? error\.message/);
});
