import {
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from '@/lib/browserStorage.mjs';

export const PASSWORD_RECOVERY_MARKER = 'vertex_password_recovery_verified';

function normalizeRecoveryAccountId(userId: string): string {
  return typeof userId === 'string' ? userId.trim() : '';
}

function getRecoveryStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return resolveSessionStorage(window);
}

export function markPasswordRecoveryVerified(userId: string) {
  const normalizedUserId = normalizeRecoveryAccountId(userId);
  if (!normalizedUserId) return;
  if (!safeStorageSet(getRecoveryStorage(), PASSWORD_RECOVERY_MARKER, normalizedUserId)) {
    throw new Error('Password recovery session storage is unavailable.');
  }
}

export function hasVerifiedPasswordRecovery(userId: string): boolean {
  const normalizedUserId = normalizeRecoveryAccountId(userId);
  if (!normalizedUserId) return false;
  return safeStorageGet(getRecoveryStorage(), PASSWORD_RECOVERY_MARKER) === normalizedUserId;
}

export function clearPasswordRecoveryMarker() {
  // Cleanup must never prevent expiry handling or post-update sign-out. If the
  // browser has made session storage unavailable, the marker is inaccessible
  // to this application anyway and the authenticated session is still revoked.
  safeStorageRemove(getRecoveryStorage(), PASSWORD_RECOVERY_MARKER);
}
