export function isVerifiedInviteSession(user) {
  if (!user?.id || !user?.invited_at) return false;
  return Boolean(user.email_confirmed_at || user.confirmed_at);
}

export function validateInitialPassword(password) {
  const value = typeof password === 'string' ? password : '';
  if (value.length < 10) {
    return { ok: false, error: 'Password must be at least 10 characters.' };
  }
  if (value.length > 128) {
    return { ok: false, error: 'Password must be 128 characters or fewer.' };
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return { ok: false, error: 'Password must include uppercase, lowercase, and a number.' };
  }
  return { ok: true, error: null };
}
