/**
 * Safe user-facing copy for Apex chat / AI tutor request failures.
 * Never echo provider, stack, or API payload details into the chat transcript.
 */
export function apexChatError(error, status = null) {
  const resolvedStatus = Number.isFinite(status)
    ? Number(status)
    : error && typeof error === 'object' && 'status' in error && Number.isFinite(Number(error.status))
      ? Number(error.status)
      : null;

  if (resolvedStatus === 401) {
    return 'Please log in again to use the AI tutor.';
  }
  if (resolvedStatus === 429) {
    return 'You are sending messages too quickly. Wait a moment and try again.';
  }
  if (resolvedStatus === 503 || (resolvedStatus && resolvedStatus >= 500)) {
    return 'The AI service is temporarily unavailable. Try again shortly.';
  }

  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in') || message.includes('log in')) {
    return 'Please log in again to use the AI tutor.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'You are sending messages too quickly. Wait a moment and try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout') || message.includes('abort')) {
    return 'VertexED could not reach the AI tutor. Check your connection and try again.';
  }
  if (message.includes('503') || message.includes('unavailable') || message.includes('overloaded')) {
    return 'The AI service is temporarily unavailable. Try again shortly.';
  }

  return 'The AI service is temporarily unavailable. Try again shortly.';
}
