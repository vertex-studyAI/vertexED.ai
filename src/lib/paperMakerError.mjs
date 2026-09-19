/**
 * Safe user-facing copy for Paper Maker generation and export failures.
 * Never echo provider/stack details into the UI.
 */
export function paperMakerError(error, action = 'generate') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in again to continue with Paper Maker.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many paper requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the paper service. Check your connection and try again.';
  }
  if (action === 'pdf') {
    return 'PDF export failed. Try again, or download as DOCX instead.';
  }
  if (action === 'docx') {
    return 'DOCX export failed. Try again, or download as PDF instead.';
  }
  return 'The paper could not be generated. Check your connection and try again.';
}
