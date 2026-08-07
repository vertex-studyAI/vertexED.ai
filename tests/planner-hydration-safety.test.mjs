import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const planner = fs.readFileSync('src/features/study-calendar/PlannerView.tsx', 'utf8');
const schedule = fs.readFileSync('src/features/study-calendar/components/Schedule.tsx', 'utf8');

test('planner blocks mutation until the current account snapshot has hydrated', () => {
  assert.match(planner, /const currentUserId = user\?\.id \?\? null/);
  assert.match(planner, /const hydratedUserIdRef = useRef<string \| null>\(null\)/);
  assert.match(planner, /const plannerReady = !plannerLoading && hydratedUserIdRef\.current === currentUserId/);
  assert.match(planner, /hydratedUserIdRef\.current = hydrationUserId/);
  assert.match(planner, /if \(!plannerReady\) return;/);
  assert.match(planner, /searchParams\.get\("suggest"\) !== "1" \|\| !plannerReady \|\| weekPlanTriggered\.current/);
  assert.match(planner, /disabled=\{!plannerReady\}/);
  assert.match(planner, /disabled=\{!plannerReady \|\| weekPlanBusy\}/);
  assert.match(planner, /!plannerReady \? \(/);
  assert.match(planner, /Loading your saved planner/);
  assert.match(planner, /aria-busy=\{!plannerReady\}/);
});

test('account changes close stale planner editing surfaces before hydration', () => {
  assert.match(planner, /setAiOpen\(false\)/);
  assert.match(planner, /setEditOpen\(false\)/);
  assert.match(planner, /setEditTask\(null\)/);
  assert.match(planner, /weekPlanTriggered\.current = false/);
  assert.match(planner, /\{plannerReady && aiOpen && \(/);
  assert.match(planner, /\{plannerReady && editOpen && editTask && \(/);
});

test('planner task controls expose complete keyboard and accessible names', () => {
  assert.match(schedule, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(schedule, /event\.preventDefault\(\)/);
  assert.match(schedule, /aria-label=\{`Mark \$\{name\} complete`\}/);
  assert.match(schedule, /Press Enter or Space to edit, or Delete to complete/);
  assert.match(schedule, /aria-label=\{`\$\{mode\} planner schedule for/);
});
