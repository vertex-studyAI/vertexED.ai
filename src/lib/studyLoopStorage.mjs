const LOOP_STEP_IDS = Object.freeze(['plan', 'focus', 'practise', 'review', 'remember']);

export function normalizeStudyLoopWeek(value, currentWeek) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.weekKey !== currentWeek) {
    return { weekKey: currentWeek, steps: {} };
  }

  const rawSteps = value.steps;
  if (!rawSteps || typeof rawSteps !== 'object' || Array.isArray(rawSteps)) {
    return { weekKey: currentWeek, steps: {} };
  }

  const steps = {};
  for (const step of LOOP_STEP_IDS) {
    const completedAt = rawSteps[step];
    if (typeof completedAt === 'string' && Number.isFinite(Date.parse(completedAt))) {
      steps[step] = completedAt;
    }
  }
  return { weekKey: currentWeek, steps };
}
