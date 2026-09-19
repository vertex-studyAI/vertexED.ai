/**
 * Safe user-facing copy for Waitlist Admin load/update failures.
 * Never echo raw API/Auth messages into the admin console.
 */
export function waitlistAdminError(error, action = 'load') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in with an admin account to manage the waitlist.';
  }
  if (message.includes('403') || message.includes('forbidden')) {
    return 'This account is not allowed to manage the waitlist.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many waitlist admin requests were made. Wait a moment, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the waitlist service. Check your connection and try again.';
  }
  return action === 'update'
    ? 'Could not update that waitlist entry. Try again shortly.'
    : 'Could not load the waitlist. Try again shortly.';
}
