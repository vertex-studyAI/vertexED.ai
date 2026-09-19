/**
 * Safe user-facing copy for Study Planner generation failures.
 */
export function plannerPlanError(error, action = 'week') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  // Controlled local validation / race copy from plannerTasks + PlannerView.
  // Also preserve explicit AI-unavailable product copy (auth-return golden).
  if (
    source.startsWith('Enter a task name')
    || source.startsWith('Choose a ')
    || source.startsWith('This overlaps')
    || source.startsWith('This task runs past')
    || source.startsWith('No usable tasks')
    || source.startsWith('No free slot')
    || source.startsWith('The suggested task is invalid')
    || source.startsWith('Your plan changed while')
    || source.startsWith('AI is unavailable')
  ) {
    return source;
  }

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return action === 'task'
      ? 'Sign in to add an AI task, or switch to manual entry.'
      : 'Sign in to generate a week plan, or add tasks manually.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return action === 'task'
      ? 'Too many planner requests were made. Wait a moment, then try again, or add the task manually.'
      : 'Too many planner requests were made. Wait a moment, then try again, or add tasks manually.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return action === 'task'
      ? 'VertexED could not reach the planner service. Check your connection, or add the task manually.'
      : 'VertexED could not reach the planner service. Check your connection, or add tasks manually.';
  }
  return action === 'task'
    ? 'Could not suggest a task. Switch to manual entry.'
    : 'Could not generate a week plan. You can still add tasks manually.';
}
