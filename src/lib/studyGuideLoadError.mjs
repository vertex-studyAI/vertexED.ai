/**
 * Safe user-facing copy for MYP study guide index/page load failures.
 */
export function studyGuideLoadError(error, action = 'index') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('404') || message.includes('not found')) {
    return action === 'page'
      ? 'This guide page could not be found. Pick another guide from the index.'
      : 'The MYP guide index could not be found.';
  }
  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in to load study guides, then try again.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many guide requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the study guide service. Check your connection and try again.';
  }
  return action === 'page'
    ? 'This guide page could not be loaded.'
    : 'The MYP guide index could not be loaded.';
}
