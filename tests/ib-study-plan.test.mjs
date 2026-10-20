import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { IB_PLAN_STATE_KEY, ibPlanSummary, normaliseIbStudyPlan, readIbStudyPlan } from '../src/lib/ibStudyPlan.mjs';
import { normalizeLearnerStateItem } from '../api/_lib/learnerStateStore.js';

const plan = {
  version: 1,
  updatedAt: '2026-10-20T09:00:00.000Z',
  subjects: [{ id: 'subject:biology', name: 'Biology', level: 'HL', targetGrade: 6 }],
  milestones: [
    { id: 'milestone:ia-draft', title: 'IA first draft', kind: 'IA', subjectId: 'subject:biology', dueDate: '2026-10-25', status: 'in-progress' },
    { id: 'milestone:ee-outline', title: 'Extended Essay outline', kind: 'EE', subjectId: null, dueDate: '2026-11-04', status: 'not-started' },
  ],
};

test('IB plan admits only linked subjects, explicit deadlines, and target grades', () => {
  assert.deepEqual(normaliseIbStudyPlan(plan), plan);
  assert.equal(normaliseIbStudyPlan({ ...plan, subjects: [{ ...plan.subjects[0], level: 'Standard' }] }), null);
  assert.equal(normaliseIbStudyPlan({ ...plan, milestones: [{ ...plan.milestones[0], subjectId: 'subject:other' }] }), null);
  assert.equal(normaliseIbStudyPlan({ ...plan, milestones: [{ ...plan.milestones[1], subjectId: 'subject:biology' }] }), null);
  assert.equal(normaliseIbStudyPlan({ ...plan, subjects: [{ ...plan.subjects[0], targetGrade: 8 }] }), null);
});

test('IB plan summary is derived only from entered milestones, never a grade prediction', () => {
  const summary = ibPlanSummary(plan, '2026-10-20');
  assert.equal(summary.subjectCount, 1);
  assert.equal(summary.openMilestones, 2);
  assert.deepEqual(summary.upcoming.map((item) => item.id), ['milestone:ia-draft']);
  assert.equal(summary.completedMilestones, 0);
});

test('malformed device data is preserved rather than silently replaced', () => {
  const result = readIbStudyPlan('{not json');
  assert.equal(result.plan, null);
  assert.match(result.error, /not been overwritten/);
});

test('IB plans use a single, validated owner-scoped learner-state record', () => {
  const item = normalizeLearnerStateItem({
    stateType: 'ib_plan', stateKey: IB_PLAN_STATE_KEY, payload: plan,
    clientRevision: 'state:1792486800000:aaaaaaaa', clientUpdatedAt: '2026-10-20T09:00:00.000Z',
  });
  assert.equal(item.stateKey, IB_PLAN_STATE_KEY);
  assert.equal(normalizeLearnerStateItem({ ...item, stateKey: 'ib-diploma:other' }), null);
  assert.equal(normalizeLearnerStateItem({ ...item, payload: { ...plan, version: 99 } }), null);
});

test('IB workspace is protected and its migration keeps the service-only state contract', () => {
  const app = fs.readFileSync('src/app/App.tsx', 'utf8');
  const migration = fs.readFileSync('supabase/migrations/20261020090000_ib_diploma_study_plan.sql', 'utf8');
  assert.match(app, /path="ib-diploma" element=\{<ProtectedRoute><IBDiploma \/><\/ProtectedRoute>\}/);
  assert.match(migration, /'ib_plan'/);
  assert.match(migration, /p_state_key <> 'ib-diploma:plan'/);
  assert.match(migration, /grant execute on function public\.sync_learner_state_item[\s\S]*to service_role/i);
});
