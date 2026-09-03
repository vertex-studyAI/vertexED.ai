export function isVerifiedInviteSession(user) {
  if (!user?.id || !user?.invited_at) return false;
  return Boolean(user.email_confirmed_at || user.confirmed_at);
}

export { validateAccountPassword as validateInitialPassword } from './passwordPolicy.mjs';
