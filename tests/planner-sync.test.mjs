import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  bucketPlannerTaskCount,
  buildPlannerRetrieveAnalyticsProperties,
  buildPlannerSaveAnalyticsProperties,
} from '../src/lib/plannerPersistenceAnalytics.mjs';

test('planner snapshot merge prefers newest updatedAt', () => {
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

  const localTime = new Date(local.updatedAt).getTime();
  const cloudTime = new Date(cloud.updatedAt).getTime();
  const snapshot = cloudTime >= localTime ? cloud : local;

  assert.equal(snapshot.tasks[0].id, 'cloud');
  assert.equal(snapshot.mode, 'Week');
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
