/**
 * Safe user-facing copy for onboarding save failures.
 * Never echo Auth/Postgres/provider details into the form alert.
 */
const SAFE_COPY = new Set([
  'Invalid cloud response. Local work was preserved.',
  'Invalid cloud snapshot. Local work was preserved.',
]);

export function onboardingError(error) {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  if (SAFE_COPY.has(source)) return source;

  const message = source.toLowerCase();

  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the account service. Check your connection and try again.';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many save attempts were made. Wait a moment, then try again.';
  }
  if (
    message.includes('jwt')
    || message.includes('session')
    || message.includes('not authenticated')
    || message.includes('unauthorized')
    || message.includes('401')
  ) {
    return 'Your session is not ready. Refresh and try again.';
  }

  return 'Could not save your setup. Try again.';
}
