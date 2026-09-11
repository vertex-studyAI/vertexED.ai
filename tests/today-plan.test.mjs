import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTodayPlanDone } from '../src/lib/todayPlanCore.mjs';

function buildTodayPlanItems(tasks, recommendations, pulseAction) {
  const items = [];
  const seen = new Set();

  if (pulseAction) {
    const id = `pulse:${pulseAction.href}`;
    items.push({
      id,
      label: pulseAction.label,
      detail: pulseAction.reason,
      href: pulseAction.href,
      source: 'pulse',
      priority: 'urgent',
    });
    seen.add(id);
  }

  for (const task of tasks.slice(0, 4)) {
    const id = `planner:${task.id}`;
    if (seen.has(id)) continue;
    items.push({
      id,
      label: task.name,
      detail: task.startTime ? `Scheduled ${task.startTime}` : undefined,
      href: '/planner',
      source: 'planner',
      priority: 'high',
    });
    seen.add(id);
  }

  for (const rec of recommendations.slice(0, 5)) {
    const id = `adaptive:${rec.id}`;
    if (seen.has(id)) continue;
    items.push({
      id,
      label: rec.title,
      detail: rec.description,
      href: rec.to,
      source: 'adaptive',
      priority: rec.priority,
    });
    seen.add(id);
  }

  const order = { urgent: 0, high: 1, medium: 2, low: 3 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 8);
}

test('buildTodayPlanItems merges pulse, planner, and adaptive sources', () => {
  const items = buildTodayPlanItems(
    [{ id: 't1', name: 'Revise photosynthesis', startTime: '17:00' }],
    [
      {
        id: 'rec1',
        priority: 'high',
        title: 'Run a mock',
        description: 'Paper maker',
        to: '/paper-maker',
      },
    ],
    { label: 'Review weak topic', href: '/notetaker', reason: 'Due cards' },
  );

  assert.equal(items.length, 3);
  assert.equal(items[0].source, 'pulse');
  assert.equal(items[0].priority, 'urgent');
  assert.ok(items.some((i) => i.source === 'planner'));
  assert.ok(items.some((i) => i.source === 'adaptive'));
});

test('persisted today-plan state ignores malformed day values instead of crashing Set construction', () => {
  assert.deepEqual(parseTodayPlanDone(null), {});
  assert.deepEqual(parseTodayPlanDone('{broken'), {});
  assert.deepEqual(parseTodayPlanDone('[]'), {});
  assert.deepEqual(parseTodayPlanDone(JSON.stringify({
    '2026-09-11': 'planner:t1',
    '2026-09-12': { id: 'planner:t2' },
    '2026-09-13': ['planner:t3', null, 'planner:t3', '', 'adaptive:r1'],
  })), {
    '2026-09-13': ['planner:t3', 'adaptive:r1'],
  });
});

test('persisted completion lists are bounded before dashboard hydration', () => {
  const ids = Array.from({ length: 250 }, (_, index) => `planner:${index}`);
  const parsed = parseTodayPlanDone(JSON.stringify({ '2026-09-11': ids }));
  assert.equal(parsed['2026-09-11'].length, 200);
  assert.equal(parsed['2026-09-11'][0], 'planner:0');
  assert.equal(parsed['2026-09-11'][199], 'planner:199');
});
