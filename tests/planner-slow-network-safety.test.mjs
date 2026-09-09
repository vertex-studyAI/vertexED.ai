import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const plannerSyncSource = fs.readFileSync('src/lib/plannerSync.ts', 'utf8');

test('planner cloud sync has a bounded request deadline', () => {
  assert.match(plannerSyncSource, /const PLANNER_SYNC_TIMEOUT_MS = 15_000;/);
  assert.match(
    plannerSyncSource,
    /createRequestDeadline\(undefined, PLANNER_SYNC_TIMEOUT_MS\)/g,
  );
  assert.equal(
    (plannerSyncSource.match(/signal: deadline\.signal/g) || []).length,
    2,
    'both planner load and save must pass the bounded signal to authFetch',
  );
});

test('planner timeout degrades to device state instead of hanging or losing edits', () => {
  assert.match(
    plannerSyncSource,
    /PLANNER_SYNC_TIMEOUT_MESSAGE = 'Cloud sync timed out; using planner saved on this device'/,
  );
  assert.match(
    plannerSyncSource,
    /snapshot: local,[\s\S]*?cloudSynced: false,[\s\S]*?deadline\.didTimeout\(\)[\s\S]*?PLANNER_SYNC_TIMEOUT_MESSAGE/,
  );
  assert.match(
    plannerSyncSource,
    /writeLocalPlannerSnapshot\(snapshot, resolvedScope\);[\s\S]*?const deadline = createRequestDeadline/,
    'save must persist locally before starting the bounded cloud request',
  );
});

test('planner request deadlines are always cleaned up', () => {
  assert.equal(
    (plannerSyncSource.match(/finally \{\s*deadline\.cleanup\(\);\s*\}/g) || []).length,
    2,
    'load and save must clear their timers on every exit path',
  );
});
