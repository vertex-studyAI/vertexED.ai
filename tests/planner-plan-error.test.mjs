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

test('PlannerView wires plannerPlanError for week-plan failures', async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const source = await readFile(join(root, 'src/features/study-calendar/PlannerView.tsx'), 'utf8');
  assert.match(source, /import \{ plannerPlanError \} from "@\/lib\/plannerPlanError\.mjs"/);
  assert.match(source, /setPlanError\(plannerPlanError\(e\)\)/);
  assert.doesNotMatch(source, /setPlanError\(e instanceof Error \? e\.message/);
});
