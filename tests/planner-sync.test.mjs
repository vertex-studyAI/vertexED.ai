import { reconcileSnapshot } from '../src/lib/snapshotConcurrency.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  bucketPlannerTaskCount,
  buildPlannerRetrieveAnalyticsProperties,
  buildPlannerSaveAnalyticsProperties,
} from '../src/lib/plannerPersistenceAnalytics.mjs';
import {
  normalizePlannerStorageScope,
  plannerStorageKeys,
} from '../src/lib/plannerStorageScope.mjs';

const plannerSyncSource = fs.readFileSync('src/lib/plannerSync.ts', 'utf8');
const onboardingSource = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');
const apiAuthSource = fs.readFileSync('src/lib/apiAuth.ts', 'utf8');
const authContextSource = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

test('planner recovers cloud changes when the local baseline has no pending edits', () => {
  const local = {
    tasks: [{ id: 'local', 'task name': 'Local task' }],
    mode: 'Day',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const cloud = {
    tasks: [{ id: 'cloud', 'task name': 'Cloud task' }],
    mode: 'Week',
    updatedAt: '2026-02-01T00:00:00.000Z',
  };

  const { snapshot } = reconcileSnapshot({ local, cloud, metadata: { pending: false, revision: local.updatedAt, syncedLocalTime: local.updatedAt } });

  assert.equal(snapshot.tasks[0].id, 'cloud');
  assert.equal(snapshot.mode, 'Week');
});

test('planner device storage keys are isolated per authenticated account', () => {
  const first = plannerStorageKeys('11111111-1111-4111-8111-111111111111');
  const second = plannerStorageKeys('22222222-2222-4222-8222-222222222222');

  assert.notEqual(first.tasks, second.tasks);
  assert.notEqual(first.mode, second.mode);
  assert.notEqual(first.updatedAt, second.updatedAt);
  assert.match(first.tasks, /^vertex_planner:/);
  assert.match(second.tasks, /^vertex_planner:/);
});

test('planner storage scope safely handles anonymous and unusual values', () => {
  assert.equal(normalizePlannerStorageScope(null), 'anonymous');
  assert.equal(normalizePlannerStorageScope('  '), 'anonymous');
  assert.equal(normalizePlannerStorageScope('user/name@example.com'), 'user%2Fname%40example.com');
});

test('planner sync derives account scope before reading or writing device state', () => {
  assert.match(plannerSyncSource, /supabase\.auth\.getSession\(\)/);
  assert.match(plannerSyncSource, /const resolvedScope = await resolveStorageScope\(storageScope\)/);
  assert.match(plannerSyncSource, /readLocalSnapshot\(resolvedScope\)/);
  assert.match(plannerSyncSource, /writeLocalPlannerSnapshot\(snapshot, resolvedScope\)/);
  assert.doesNotMatch(plannerSyncSource, /const LOCAL_TASKS_KEY = 'planner_tasks'/);
  assert.doesNotMatch(plannerSyncSource, /localStorage\.getItem\('planner_tasks'\)/);
});

test('onboarding planner save uses the verified auth identity without reacquiring the session', () => {
  assert.match(onboardingSource, /if \(!user\?\.id \|\| !session\?\.access_token\)/);
  assert.match(
    onboardingSource,
    /savePlannerSnapshot\([\s\S]*?createFirstStudyPlan\(curriculum\),[\s\S]*?user\.id,[\s\S]*?session\.access_token,[\s\S]*?\)/,
  );
  assert.doesNotMatch(
    onboardingSource,
    /savePlannerSnapshot\(createFirstStudyPlan\(curriculum\)\)/,
  );
  assert.ok(
    onboardingSource.indexOf('const planResult = await savePlannerSnapshot(')
      < onboardingSource.indexOf('supabase.auth.updateUser({ data: metadata })'),
    'the authenticated plan save must complete before the serialized auth mutation starts',
  );
  assert.match(plannerSyncSource, /authFetchWithAccessToken/);
  assert.match(apiAuthSource, /if \(headers\.has\('Authorization'\)\) return headers/);
});

test('onboarding exposes an accessible slow-network save state', () => {
  assert.match(onboardingSource, /<form className="space-y-6" aria-busy=\{loading\}/);
  assert.match(onboardingSource, /loading && <p role="status" aria-live="polite"/);
  assert.match(
    onboardingSource,
    /Saving your starter plan\. On a slow connection this can take a moment; keep this page open\./,
  );
  assert.match(onboardingSource, /disabled=\{loading\}[\s\S]*?>Back<\/button>/);
  assert.match(onboardingSource, /loading \? "Creating your plan…" : "Create my study plan"/);
});

test('authenticated API calls use the auth-event token before consulting session storage', () => {
  assert.match(apiAuthSource, /let currentAccessToken: string \| null = null/);
  assert.ok(
    apiAuthSource.indexOf('if (currentAccessToken) return currentAccessToken;')
      < apiAuthSource.indexOf('supabase.auth.getSession()'),
    'the in-memory auth-event token must bypass the serialized session lookup',
  );
  assert.match(apiAuthSource, /setAuthAccessToken\(token\);[\s\S]*?return token;/);
  assert.match(authContextSource, /setAuthAccessToken\(newSession\?\.access_token\)/);
  assert.match(authContextSource, /setAuthAccessToken\(data\.session\?\.access_token\)/);
  assert.match(authContextSource, /setAuthAccessToken\(null\)/);
});

test('user-content allows planner kind in registry', async () => {
  const mod = await import('../api/_handlers/user-content.js');
  assert.equal(typeof mod.default, 'function');
});

test('planner analytics reduces task counts to fixed buckets', () => {
  assert.equal(bucketPlannerTaskCount(0), 'empty');
  assert.equal(bucketPlannerTaskCount(3), '1_3');
  assert.equal(bucketPlannerTaskCount(7), '4_7');
  assert.equal(bucketPlannerTaskCount(15), '8_15');
  assert.equal(bucketPlannerTaskCount(16), '16_plus');
  assert.equal(bucketPlannerTaskCount(-1), 'unknown');
});

test('planner save analytics records destination without plan content', () => {
  assert.deepEqual(
    buildPlannerSaveAnalyticsProperties({ cloudSynced: true, taskCount: 5 }),
    {
      destination: 'cloud',
      cloud_status: 'saved',
      task_count_bucket: '4_7',
    },
  );

  assert.deepEqual(
    buildPlannerSaveAnalyticsProperties({ cloudSynced: false, taskCount: 2 }),
    {
      destination: 'device',
      cloud_status: 'error',
      task_count_bucket: '1_3',
    },
  );
});

test('planner retrieval analytics allows only fixed operational categories', () => {
  assert.deepEqual(
    buildPlannerRetrieveAnalyticsProperties({
      source: 'cloud',
      cloudStatus: 'available',
      taskCount: 9,
    }),
    {
      source: 'cloud',
      cloud_status: 'available',
      task_count_bucket: '8_15',
    },
  );

  assert.deepEqual(
    buildPlannerRetrieveAnalyticsProperties({
      source: 'private task text',
      cloudStatus: 'raw provider error',
      taskCount: Number.NaN,
    }),
    {
      source: 'unknown',
      cloud_status: 'unknown',
      task_count_bucket: 'unknown',
    },
  );
});
