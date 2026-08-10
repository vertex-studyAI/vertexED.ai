import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  setUserContentStorageScope,
  userContentStorageKeys,
} from '../src/lib/userContentStorageScope.mjs';

const srDeckSource = fs.readFileSync('src/lib/srDeck.ts', 'utf8');
const weaknessSource = fs.readFileSync('src/lib/weaknessTracker.ts', 'utf8');
const loopSource = fs.readFileSync('src/lib/studyLoopTracker.ts', 'utf8');
const progressSource = fs.readFileSync('src/lib/progressAnalytics.ts', 'utf8');
const todayPlanSource = fs.readFileSync('src/lib/todayPlan.ts', 'utf8');
const statsSource = fs.readFileSync('src/lib/studyStats.ts', 'utf8');
const portalSource = fs.readFileSync('src/lib/portalFeatures.ts', 'utf8');
const localStorageHookSource = fs.readFileSync('src/hooks/useLocalStorage.ts', 'utf8');
const notetakerSource = fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8');
const activityLogSource = fs.readFileSync('src/pages/study-zone/components/ActivityLog.tsx', 'utf8');

test('learner-derived state keys are different for different accounts', () => {
  const first = userContentStorageKeys('learner-a');
  const second = userContentStorageKeys('learner-b');
  const stateKeys = [
    'srDeck',
    'weaknessHeatmap',
    'studyLoopWeek',
    'progressSnapshots',
    'todayPlanDone',
    'confidenceCheckin',
    'examNightChecklist',
    'studyStreak',
    'lastStudyDate',
    'habits',
    'habitsResetDate',
  ];

  for (const key of stateKeys) {
    assert.notEqual(first[key], second[key]);
    assert.match(first[key], /^vertex_content:learner-a:/);
    assert.match(second[key], /^vertex_content:learner-b:/);
  }
});

test('active learner state follows the authenticated storage scope', () => {
  setUserContentStorageScope('learner-a');
  const first = userContentStorageKeys();
  setUserContentStorageScope('learner-b');
  const second = userContentStorageKeys();

  assert.notEqual(first.srDeck, second.srDeck);
  assert.notEqual(first.weaknessHeatmap, second.weaknessHeatmap);
  assert.notEqual(first.progressSnapshots, second.progressSnapshots);
});

test('spaced repetition and weakness history abandon shared legacy keys', () => {
  assert.match(srDeckSource, /userContentStorageKeys\(\)\.srDeck/);
  assert.doesNotMatch(srDeckSource, /vertex_sr_deck/);
  assert.match(weaknessSource, /userContentStorageKeys\(\)\.weaknessHeatmap/);
  assert.doesNotMatch(weaknessSource, /vertex_weakness_heatmap/);
});

test('legacy useLocalStorage learner keys are transparently resolved to the active account', () => {
  for (const legacyKey of [
    'vertex_sr_deck',
    'vertex_weakness_heatmap',
    'vertex_study_loop_week',
    'vertex_progress_snapshots',
    'vertex_today_plan_done_v1',
    'vertex_confidence_checkin_v1',
    'vertex_exam_night_checklist_v1',
    'vertex_study_streak',
    'vertex_last_study_date',
    'studyzone_habits',
    'studyzone_habits_reset_date',
  ]) {
    assert.match(localStorageHookSource, new RegExp(legacyKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(localStorageHookSource, /const resolvedKey = resolveScopedKey\(key\)/);
  assert.match(localStorageHookSource, /hydratedKeyRef\.current === resolvedKey/);
  assert.match(notetakerSource, /useLocalStorage<SrCard\[]>\("vertex_sr_deck", \[\]\)/);
});

test('loop, progress, and today-plan completion are account scoped', () => {
  assert.match(loopSource, /userContentStorageKeys\(\)\.studyLoopWeek/);
  assert.doesNotMatch(loopSource, /vertex_study_loop_week/);
  assert.match(progressSource, /userContentStorageKeys\(\)\.progressSnapshots/);
  assert.doesNotMatch(progressSource, /vertex_progress_snapshots/);
  assert.match(todayPlanSource, /userContentStorageKeys\(\)\.todayPlanDone/);
  assert.doesNotMatch(todayPlanSource, /vertex_today_plan_done_v1/);
});

test('streak and habit metrics use authenticated learner keys', () => {
  assert.match(statsSource, /const \{ habits, habitsResetDate \} = userContentStorageKeys\(\)/);
  assert.match(statsSource, /const \{ studyStreak, lastStudyDate \} = userContentStorageKeys\(\)/);
  assert.doesNotMatch(statsSource, /vertex_study_streak/);
  assert.doesNotMatch(statsSource, /vertex_last_study_date/);
  assert.doesNotMatch(statsSource, /studyzone_habits/);
});

test('portal recommendations use scoped activity, confidence, and exam-night state', () => {
  assert.match(portalSource, /userContentStorageKeys\(\)\.activity/);
  assert.match(portalSource, /userContentStorageKeys\(\)\.examNightChecklist/);
  assert.match(portalSource, /userContentStorageKeys\(\)\.confidenceCheckin/);
  assert.doesNotMatch(portalSource, /studyzone_activity/);
  assert.doesNotMatch(portalSource, /vertex_confidence_checkin_v1/);
  assert.doesNotMatch(portalSource, /vertex_exam_night_checklist_v1/);
});

test('activity log clears unsaved learner text when the account scope changes', () => {
  assert.match(activityLogSource, /const activityKey = userContentStorageKeys\(authLoading \? undefined : user\?\.id \?\? null\)\.activity/);
  assert.match(activityLogSource, /useEffect\(\(\) => \{\s*setDraft\(""\);\s*\}, \[activityKey\]\);/s);
});
