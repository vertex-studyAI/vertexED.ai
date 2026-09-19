/**
 * Safe user-facing copy for Study Planner generation failures.
 */
export function plannerPlanError(error) {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in to generate a week plan, or add tasks manually.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many planner requests were made. Wait a moment, then try again, or add tasks manually.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the planner service. Check your connection, or add tasks manually.';
  }
  return 'Could not generate a week plan. You can still add tasks manually.';
}
