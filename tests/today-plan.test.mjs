import test from 'node:test';
import assert from 'node:assert/strict';

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
