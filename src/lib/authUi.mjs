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
  if (action === 'reset') {
    return 'We could not send the reset email. Check your connection and try again.';
  }
  if (action === 'signup') {
    return 'Your account was created, but VertexED could not finish signing you in. Try logging in, or use Google sign-in if that is how you usually access VertexED.';
  }
  if (action === 'password-update') {
    return 'Could not update your password. Request a new reset link and try again.';
  }
  if (action === 'initial-password') {
    return 'Could not set your password. Open a fresh invite and try again.';
  }
  if (action === 'link-google') {
    return 'Could not connect Google to this VertexED account. Try again, or skip and connect later from Account Settings.';
  }
  if (action === 'logout') {
    return 'Could not finish signing out. Check your connection and try again, or close this browser tab.';
  }
  if (action === 'delete-account') {
    return 'Could not delete the cloud account. Try again, or contact support if the problem continues.';
  }
  if (action === 'delete-account-cleanup') {
    return 'The cloud account was deleted, but this browser still needs a manual storage cleanup. Sign out elsewhere if needed.';
  }
  if (action === 'export-account') {
    return 'Could not export account data. Check your connection and try again.';
  }
  if (action === 'export-device') {
    return 'Could not export the device backup. Check browser storage access and try again.';
  }
  if (action === 'save-curriculum') {
    return 'Could not save your curriculum. Check your connection and try again.';
  }
  if (action === 'save-profile') {
    return 'Could not save your learning profile. Check your connection and try again.';
  }
  return 'We could not sign you in. Try again, use Google sign-in, or reset your password.';
}
