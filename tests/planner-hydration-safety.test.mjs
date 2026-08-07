import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const planner = fs.readFileSync('src/features/study-calendar/PlannerView.tsx', 'utf8');
const schedule = fs.readFileSync('src/features/study-calendar/components/Schedule.tsx', 'utf8');

test('planner blocks mutation until the persisted snapshot has hydrated', () => {
  assert.match(planner, /if \(plannerLoading\) return;/);
  assert.match(planner, /searchParams\.get\("suggest"\) !== "1" \|\| plannerLoading \|\| weekPlanTriggered\.current/);
  assert.match(planner, /disabled=\{plannerLoading\}/);
  assert.match(planner, /disabled=\{plannerLoading \|\| weekPlanBusy\}/);
  assert.match(planner, /plannerLoading \? \(/);
  assert.match(planner, /Loading your saved planner/);
  assert.match(planner, /aria-busy=\{plannerLoading\}/);
});

test('planner task controls expose complete keyboard and accessible names', () => {
  assert.match(schedule, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(schedule, /event\.preventDefault\(\)/);
  assert.match(schedule, /aria-label=\{`Mark \$\{name\} complete`\}/);
  assert.match(schedule, /Press Enter or Space to edit, or Delete to complete/);
  assert.match(schedule, /aria-label=\{`\$\{mode\} planner schedule for/);
});
