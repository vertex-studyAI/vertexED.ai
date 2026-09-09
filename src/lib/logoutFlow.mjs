/**
 * Prefer revoking every session, but still clear this device if the global
 * revocation endpoint is temporarily unavailable. A local failure remains a
 * real error and callers must not navigate away as if logout succeeded.
 */
export async function logoutWithLocalFallback(logout) {
  try {
    await logout();
    return { scope: 'global' };
  } catch (globalError) {
    try {
      await logout({ localOnly: true });
      return { scope: 'local', globalError };
    } catch (localError) {
      const error = new Error('Could not sign out on this device. Please try again.');
      error.cause = localError;
      throw error;
    }
  }
}
