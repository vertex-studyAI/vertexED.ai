import test from 'node:test';
import assert from 'node:assert/strict';
import { courseworkDeadlines, exportCoursework, removeCourseworkMilestone, updateCourseworkMilestone, validateCoursework } from '../src/lib/coursework.mjs';
import { validatePlannerSnapshot } from '../src/lib/snapshotValidation.mjs';
const at = '2026-10-16T00:00:00Z';
const fixture = () => [{ id: 'project', title: 'Cooling investigation', subject: 'Physics', course: 'IB DP', deadline: '2026-11-20', createdAt: at, updatedAt: at, milestones: [
  { id: 'research', title: 'Research', dueDate: '2026-10-15', status: 'in-progress', evidence: 'Notebook: temperature readings, page 3', revisions: [{ at, note: 'Check the sampling interval.' }] },
  { id: 'draft', title: 'Draft', dueDate: '2026-11-10', status: 'planned', evidence: '', revisions: [] },
] }];

test('milestone revisions append without mutating previous evidence and history', () => {
  const before = fixture();
  const next = updateCourseworkMilestone(before, 'project', 'research', { status: 'complete', evidence: 'Notebook: page 4, repeated readings' }, 'Repeated the trial.', '2026-10-17T00:00:00Z');
  assert.equal(before[0].milestones[0].status, 'in-progress');
  assert.equal(next[0].milestones[0].revisions.length, 2);
  assert.deepEqual(next[0].milestones[0].revisions[0], before[0].milestones[0].revisions[0]);
  assert.equal(next[0].updatedAt, '2026-10-17T00:00:00Z');
  assert.equal('grade' in next[0], false);
});

test('deadlines sort chronologically, retain overdue work and omit completed milestones', () => {
  assert.deepEqual(courseworkDeadlines(fixture(), '2026-10-16').map(row => [row.milestoneId, row.overdue]), [['research', true], ['draft', false], ['final:project', false]]);
  const next = updateCourseworkMilestone(fixture(), 'project', 'research', { status: 'complete' });
  assert.deepEqual(courseworkDeadlines(next, '2026-11-11').map(row => row.milestoneId), ['draft', 'final:project']);
});

test('the final submission deadline survives empty or completed milestones until explicitly submitted', () => {
  const rows = fixture();
  rows[0].milestones = [];
  assert.deepEqual(courseworkDeadlines(rows, '2026-11-21'), [{ projectId: 'project', milestoneId: 'final:project', title: 'Cooling investigation: Final submission', subject: 'Physics', date: '2026-11-20', overdue: true }]);
  rows[0].milestones = fixture()[0].milestones.map(row => ({ ...row, status: 'complete' }));
  assert.deepEqual(courseworkDeadlines(rows, '2026-11-20').map(row => [row.milestoneId, row.overdue]), [['final:project', false]]);
  rows[0].submitted = true;
  assert.deepEqual(courseworkDeadlines(rows, '2026-11-21'), []);
  rows[0].submitted = false;
  assert.equal(courseworkDeadlines(rows, '2026-11-21')[0].milestoneId, 'final:project');
  assert.equal(rows[0].milestones[0].revisions[0].note, 'Check the sampling interval.');
});

test('submission is independent of milestone status and validates optional legacy records', () => {
  const rows = fixture();
  assert.equal(validateCoursework(rows), rows);
  assert.equal(Object.hasOwn(rows[0], 'submitted'), false);
  rows[0].submitted = true;
  assert.deepEqual(courseworkDeadlines(rows, '2026-10-16').map(row => row.milestoneId), ['research', 'draft']);
  for (const submitted of [null, undefined, 0, 1, 'false', 'submitted', {}]) assert.throws(() => validateCoursework([{ ...rows[0], submitted }]));
  assert.equal(JSON.parse(exportCoursework(rows)).projects[0].submitted, true);
});

test('removing a milestone preserves other projects, evidence and revision history without mutation', () => {
  const before = [...fixture(), { ...fixture()[0], id: 'other-project' }];
  const next = removeCourseworkMilestone(before, 'project', 'draft', '2026-10-17T00:00:00Z');
  assert.deepEqual(before[0].milestones.map(row => row.id), ['research', 'draft']);
  assert.deepEqual(next[0].milestones, [before[0].milestones[0]]);
  assert.equal(next[0].milestones[0], before[0].milestones[0]);
  assert.equal(next[1], before[1]);
  assert.equal(next[0].updatedAt, '2026-10-17T00:00:00Z');
  assert.equal(next[0].deadline, before[0].deadline);
  const empty = removeCourseworkMilestone(next, 'project', 'research');
  assert.ok(courseworkDeadlines(empty, '2026-10-16').some(row => row.milestoneId === 'final:project'));
  assert.throws(() => removeCourseworkMilestone(before, 'project', 'missing'), /no longer available/);
  assert.throws(() => removeCourseworkMilestone(before, 'missing', 'research'), /no longer available/);
});

test('the 60-project limit accepts the last slot and rejects an additional unique project', () => {
  const rows = Array.from({ length: 60 }, (_, i) => ({ ...fixture()[0], id: `project-${i}` }));
  assert.equal(validateCoursework(rows).length, 60);
  assert.throws(() => validateCoursework([...rows, { ...fixture()[0], id: 'project-60' }]));
  assert.equal(rows.length, 60);
});

test('corrupt, duplicate, impossible date and oversized records fail closed', () => {
  for (const value of [null, [null], [...fixture(), ...fixture()], Array(61).fill(fixture()[0])]) assert.throws(() => validateCoursework(value));
  for (const patch of [{ dueDate: '2026-02-30' }, { dueDate: '2026-11-21' }, { evidence: 'x'.repeat(4001) }, { status: 'approved' }, { revisions: [] }]) {
    assert.throws(() => updateCourseworkMilestone(fixture(), 'project', 'research', patch));
  }
  assert.throws(() => updateCourseworkMilestone(fixture(), 'missing', 'research', {}));
  assert.throws(() => updateCourseworkMilestone(fixture(), 'project', 'research', {}, 'x'.repeat(2001)));
});

test('50-note limit preserves the full history instead of evicting earlier entries', () => {
  const rows = fixture(); rows[0].milestones[0].revisions = Array.from({ length: 50 }, (_, i) => ({ at, note: `Trial ${i}` }));
  assert.throws(() => updateCourseworkMilestone(rows, 'project', 'research', {}, 'Another trial'), /50 revision notes/);
  assert.equal(rows[0].milestones[0].revisions.length, 50);
});

test('coursework exports all notes and legacy planner snapshots remain readable', () => {
  assert.deepEqual(JSON.parse(exportCoursework(fixture())).projects, fixture());
  assert.deepEqual(validatePlannerSnapshot({ tasks: [], mode: 'Day', updatedAt: at }).tasks, []);
  assert.throws(() => validatePlannerSnapshot({ tasks: [], coursework: [null], mode: 'Day', updatedAt: at }));
});
