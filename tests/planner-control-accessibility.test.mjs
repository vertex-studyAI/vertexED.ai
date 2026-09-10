import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const planner = fs.readFileSync('src/features/study-calendar/PlannerView.tsx', 'utf8');

test('planner view selector has a stable screen-reader name', () => {
  assert.match(planner, /aria-label="Planner view"/);
});

test('mobile calendar toggle exposes disclosure state and target', () => {
  assert.match(planner, /className="mobile-cal-toggle planner-today"/);
  assert.match(planner, /aria-expanded=\{mobileCalOpen\}/);
  assert.match(planner, /aria-controls="planner-mobile-calendar"/);
  assert.match(planner, /\{mobileCalOpen \? 'Hide calendar' : 'Show calendar'\}/);
  assert.match(planner, /id="planner-mobile-calendar"/);
});

test('planner task-entry mode exposes a named pressed-state group', () => {
  assert.match(planner, /className="planner-entry-modes" aria-label="Task entry method"/);
  assert.match(planner, /aria-pressed=\{!useAi\}/);
  assert.match(planner, /aria-pressed=\{useAi\}/);
  assert.match(planner, />Manual entry<\/button>/);
  assert.match(planner, />AI suggestion<\/button>/);
});

test('primary planner controls retain accessible text names during busy states', () => {
  assert.match(planner, />Today<\/button>/);
  assert.match(planner, /\{weekPlanBusy \? "Planning…" : "AI week plan"\}/);
  assert.match(planner, /disabled=\{!plannerReady \|\| weekPlanBusy \|\| aiBusy\}/);
});
