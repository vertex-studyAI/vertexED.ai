export const PASSWORD_RECOVERY_MARKER = 'vertex_password_recovery_verified';

export function markPasswordRecoveryVerified() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PASSWORD_RECOVERY_MARKER, '1');
}

export function hasVerifiedPasswordRecovery(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(PASSWORD_RECOVERY_MARKER) === '1';
}

export function clearPasswordRecoveryMarker() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PASSWORD_RECOVERY_MARKER);
}
