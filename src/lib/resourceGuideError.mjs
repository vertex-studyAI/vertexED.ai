/**
 * Safe user-facing copy for Resource Library guide generation failures.
 * Never surface raw provider/API messages.
 */
export function resourceGuideError(error) {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in to generate a board guide, then try again.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many guide requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the guide service. Check your connection and try again.';
  }
  if (message.includes('not configured') || message.includes('provider')) {
    return 'Guide generation is unavailable in this environment right now.';
  }
  return 'Could not generate this guide. Try another topic or try again shortly.';
}
