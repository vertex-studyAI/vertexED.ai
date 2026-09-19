/**
 * Safe user-facing copy for Study Notebook failures.
 */
export function studyNotebookError(error, action = 'save') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('quota') || message.includes('storage')) {
    return action === 'save'
      ? 'Browser storage is full or blocked. Export your work and free some space, then try again.'
      : 'Browser storage access failed. Check site permissions and try again.';
  }
  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in again to continue with Study Notebook.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many notebook requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the notebook service. Check your connection and try again.';
  }
  if (action === 'generate') {
    return 'Could not generate notebook output. Try again shortly.';
  }
  return 'Export your work and check browser storage, then try again.';
}
