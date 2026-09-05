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

test('planner task controls use native keyboard actions and accessible names', () => {
  assert.doesNotMatch(schedule, /role="button"/);
  assert.doesNotMatch(schedule, /tabIndex=\{0\}/);
  assert.doesNotMatch(schedule, /event\.key === 'Enter'/);
  assert.doesNotMatch(schedule, /event\.key === ' '/);
  assert.match(schedule, /event\.key === 'Delete'/);
  assert.match(schedule, /className="task-edit-button [^"]*focus-visible:ring-2/);
  assert.match(schedule, /aria-label=\{`Edit \$\{name\}, starting at \$\{startTime\} for \$\{duration\} minutes`\}/);
  assert.match(schedule, /aria-label=\{`Mark \$\{name\} complete`\}/);
  assert.match(schedule, /aria-label=\{`\$\{mode\} planner schedule for/);
});
