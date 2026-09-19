/**
 * Safe user-facing copy for Study Notes / Quiz failures.
 */
export function notetakerError(error, action = 'generate') {
  if (error?.name === 'AiConsentDeclinedError') return 'AI processing was not allowed. Your draft is unchanged. You can continue with manual study tools.';
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in again to continue with Study Notes.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many study requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the study service. Check your connection and try again.';
  }
  if (message.includes('quota') || message.includes('storage')) {
    return 'Browser storage is full or blocked. Free some space, then try again.';
  }
  if (action === 'save') {
    return 'Could not save your study work. Check your connection and try again.';
  }
  if (action === 'quiz') {
    return 'Could not generate the quiz. Try again shortly.';
  }
  if (action === 'grade') {
    return 'Could not grade this attempt. Try again shortly.';
  }
  if (action === 'flashcards') {
    return 'Could not generate flashcards. Try again shortly.';
  }
  return 'Could not complete this study request. Try again shortly.';
}
