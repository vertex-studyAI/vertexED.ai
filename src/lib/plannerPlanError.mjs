/**
 * Safe user-facing copy for Study Planner failures.
 * @param {unknown} error
 * @param {'week-plan' | 'edit-task' | 'add-task' | 'suggest-task'} [action]
 */
export function plannerPlanError(error, action = 'week-plan') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  const PLAN_CHANGED_COPY = 'Your plan changed while the suggestion was loading. Try again with the updated plan.';

  // Stale-response races — keep conflict copy (never provider text).
  if (
    message.includes('your plan changed')
    || message.includes('suggestion was loading')
  ) {
    if (source.length > 0 && source.length <= 200 && !/[{}\[\]\\]|stack|postgres|openai|gemini|fetch failed/i.test(source)) {
      return source;
    }
    return PLAN_CHANGED_COPY;
  }

  // Client-side task validation — preserve exact known copy.
  const looksLikeClientValidation = (
    message.includes('duration')
    || message.includes('start time')
    || message.includes('end time')
    || message.includes('task name')
    || message.includes('date')
    || message.includes('overlap')
    || message.includes('conflict')
  );
  const looksLikeProviderLeak = /[{}\[\]\\]|stack|postgres|openai|gemini|fetch failed/i.test(source);
  if (
    looksLikeClientValidation
    && source.length > 0
    && source.length <= 160
    && !looksLikeProviderLeak
  ) {
    return source;
  }

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    if (action === 'week-plan') return 'Sign in to generate a week plan, or add tasks manually.';
    if (action === 'suggest-task') return 'Sign in to get an AI task suggestion, or switch to manual entry.';
    return 'Sign in to update your planner, or try again.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    if (action === 'week-plan') {
      return 'Too many planner requests were made. Wait a moment, then try again, or add tasks manually.';
    }
    if (action === 'suggest-task' || action === 'add-task') {
      return 'Too many AI planner requests were made. Wait a moment, then try again or use manual entry.';
    }
    return 'Too many planner updates were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    if (action === 'week-plan') {
      return 'VertexED could not reach the planner service. Check your connection, or add tasks manually.';
    }
    if (action === 'suggest-task' || action === 'add-task') {
      return 'VertexED could not reach the planner service. Check your connection, or use manual entry.';
    }
    return 'VertexED could not save this planner change. Check your connection and try again.';
  }

  if (action === 'edit-task') return 'Could not update this task.';
  if (action === 'add-task') return 'Could not add this task.';
  if (action === 'suggest-task') return 'Could not suggest a task. Switch to manual entry.';
  return 'Could not generate a week plan. You can still add tasks manually.';
}
