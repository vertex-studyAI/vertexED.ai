import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlannerTask, inputDateToPlanner, normalizePlannerTasks, placeSuggestedTasks, plannerTimeToInput } from '../src/lib/plannerTasks.mjs';

const input = { id: 'task-one', name: 'Revise cell transport', date: '2026-09-10', startTime: '10:00', duration: '60' };
const make = change => createPlannerTask({ ...input, ...change });

test('manual creation and editing preserve midnight rather than default to 10am', () => {
  const task = make({ startTime: '00:00', duration: 30 });
  assert.equal(task['start time'], '12:00 AM');
  assert.equal(task['end time'], '12:30 AM');
  assert.equal(plannerTimeToInput(task['start time']), '00:00');
  assert.equal(createPlannerTask({ ...input, startTime: '00:00' }, [task], task.id)['start time'], '12:00 AM');
});

test('manual entry rejects impossible dates, invalid times, blank names and malformed durations', () => {
  for (const change of [{ date: '2026-02-29' }, { date: '2026-04-31' }, { date: '' }, { startTime: '24:00' }, { name: ' ' }, { name: 'x'.repeat(161) }, { duration: '20oops' }, { duration: 0 }, { duration: 481 }, { duration: 15.5 }, { startTime: '23:45', duration: 30 }]) {
    assert.throws(() => make(change));
  }
  assert.equal(inputDateToPlanner('2028-02-29'), '02/29/2028');
  assert.equal(make({ startTime: '23:00' })['end time'], '12:00 AM');
});

test('second task placement rejects overlap, permits touching edges and excludes the edited identity', () => {
  const first = make();
  assert.throws(() => createPlannerTask({ ...input, id: 'second', startTime: '10:30' }, [first]), /overlaps/);
  assert.equal(createPlannerTask({ ...input, id: 'second', startTime: '11:00' }, [first])['start time'], '11:00 AM');
  assert.equal(createPlannerTask({ ...input, startTime: '10:15' }, [first], first.id)['start time'], '10:15 AM');
});

test('AI placement checks each existing interval and the other tasks in its own batch', () => {
  const first = make();
  const result = placeSuggestedTasks([{ ...first, id: 'second' }, { ...first, id: 'third' }], [first], new Date(2026, 8, 9, 8));
  assert.deepEqual(result.map(task => task['start time']), ['11:00 AM', '12:00 PM']);
});

test('AI rollover checks next-day collisions instead of assuming 8am is free', () => {
  const suggestion = { ...make(), id: 'late', 'start time': '11:45 PM' };
  const nextDay = make({ id: 'next', date: '2026-09-11', startTime: '08:00' });
  const [placed] = placeSuggestedTasks([suggestion], [nextDay], new Date(2026, 8, 9, 8));
  assert.equal(placed.date, '09/11/2026');
  assert.equal(placed['start time'], '09:00 AM');
});

test('late-today AI suggestions roll forward without scheduling in the past', () => {
  const [placed] = placeSuggestedTasks([make()], [], new Date(2026, 8, 10, 23, 59));
  assert.equal(placed.date, '09/11/2026');
});

test('malformed suggestions and invalid or duplicated saved records fail explicitly', () => {
  for (const suggestions of [[], null, [{}], [{ ...make(), 'task duration': 0 }]]) assert.throws(() => placeSuggestedTasks(suggestions, []));
  for (const records of [[null], [{}], [make(), make()], [{ ...make(), date: 'bad' }]]) assert.throws(() => normalizePlannerTasks(records));
  const legacy = { id: 'legacy', taskName: 'Recall', startTime: '8:00 am', taskDuration: '30', date: '9/10/2026' };
  assert.equal(normalizePlannerTasks([legacy])[0]['task name'], 'Recall');
});
