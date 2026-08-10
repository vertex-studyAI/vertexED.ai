export const PASSWORD_RECOVERY_MARKER = 'vertex_password_recovery_verified';

function normalizeRecoveryAccountId(userId: string): string {
  return typeof userId === 'string' ? userId.trim() : '';
}

export function markPasswordRecoveryVerified(userId: string) {
  if (typeof window === 'undefined') return;
  const normalizedUserId = normalizeRecoveryAccountId(userId);
  if (!normalizedUserId) return;
  window.sessionStorage.setItem(PASSWORD_RECOVERY_MARKER, normalizedUserId);
}

export function hasVerifiedPasswordRecovery(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const normalizedUserId = normalizeRecoveryAccountId(userId);
  if (!normalizedUserId) return false;
  return window.sessionStorage.getItem(PASSWORD_RECOVERY_MARKER) === normalizedUserId;
}

export function clearPasswordRecoveryMarker() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PASSWORD_RECOVERY_MARKER);
}
