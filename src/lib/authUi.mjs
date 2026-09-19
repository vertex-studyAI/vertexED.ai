export function safeAuthReturnPath(value, fallback = '/main') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return fallback;
  try {
    const parsed = new URL(value, 'https://vertexed.local');
    if (parsed.origin !== 'https://vertexed.local') return fallback;
    if (['/login', '/signup', '/auth/callback'].includes(parsed.pathname)) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function authUiError(error, action = 'login') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'That email and password do not match a VertexED account. If you joined with Google, use Google sign-in instead.';
  }
  if (message.includes('email not confirmed')) {
    return 'Confirm your email from the message VertexED sent, then try again.';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts were made. Wait a moment, then try again or reset your password.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return 'VertexED could not reach the login service. Check your connection and try again.';
  }
  if (message.includes('not configured') || message.includes('auth is disabled')) {
    return 'Login is not configured in this build. Open the deployed VertexED app or add the Supabase public environment settings.';
  }
  return action === 'reset'
    ? 'We could not send the reset email. Check your connection and try again.'
    : 'We could not sign you in. Try again, use Google sign-in, or reset your password.';
}
