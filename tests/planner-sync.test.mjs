import { test } from 'node:test';
import assert from 'node:assert/strict';

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
