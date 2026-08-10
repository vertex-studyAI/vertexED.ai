const UNHYDRATED_SCOPE = 'unhydrated';
const SIGNED_OUT_SCOPE = 'signed-out';
let activeScope;

export function normalizeUserContentStorageScope(scope) {
  if (scope === undefined) return UNHYDRATED_SCOPE;
  if (scope === null || typeof scope !== 'string' || scope.trim().length === 0) return SIGNED_OUT_SCOPE;
  return encodeURIComponent(scope.trim()).slice(0, 256);
}

export function setUserContentStorageScope(scope) {
  activeScope = scope;
}

export function userContentStorageKeys(scope = activeScope) {
  const normalized = normalizeUserContentStorageScope(scope);
  const prefix = `vertex_content:${normalized}`;
  return {
    artifacts: `${prefix}:artifacts`,
    restore: `${prefix}:restore`,
    chatHandoff: `${prefix}:chat_handoff`,
    apexPrefill: `${prefix}:apex_prefill`,
    mockReviewHandoff: `${prefix}:mock_review_handoff`,
    mockExamAnswers: `${prefix}:mock_exam_answers`,
    sketchPad: `${prefix}:sketch_pad`,
    activity: `${prefix}:study_activity`,
    quickNotes: `${prefix}:quick_notes`,
    lastStudySession: `${prefix}:last_study_session`,
    srDeck: `${prefix}:sr_deck`,
    weaknessHeatmap: `${prefix}:weakness_heatmap`,
    studyLoopWeek: `${prefix}:study_loop_week`,
    progressSnapshots: `${prefix}:progress_snapshots`,
    todayPlanDone: `${prefix}:today_plan_done`,
    confidenceCheckin: `${prefix}:confidence_checkin`,
    examNightChecklist: `${prefix}:exam_night_checklist`,
    studyStreak: `${prefix}:study_streak`,
    lastStudyDate: `${prefix}:last_study_date`,
    habits: `${prefix}:habits`,
    habitsResetDate: `${prefix}:habits_reset_date`,
  };
}
