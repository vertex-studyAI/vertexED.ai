/**
 * Safe user-facing copy for Saved Work list failures (delete/open).
 * Never echo provider/stack details into toasts.
 */
export function savedWorkError(error, action = 'delete') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in again to manage saved work.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many saved-work requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the saved-work service. Check your connection and try again.';
  }
  if (message.includes('quota') || message.includes('storage')) {
    return 'Browser storage is full or blocked. Free some space, then try again.';
  }
  if (message.includes('account changed') || message.includes('session unavailable')) {
    return 'Your account session changed. Refresh and try again.';
  }
  if (action === 'open') {
    return 'Could not open this item. Temporary browser storage may be unavailable.';
  }
  return 'Could not delete this item. Check your connection and try again.';
}
