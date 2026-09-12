import {
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from './browserStorage.mjs';

const GOOGLE_LINK_RETURN_KEY = 'vertex_google_link_return';
const GOOGLE_LINK_RETURN_DESTINATION = '/user-settings';

/** Route provider returns sent to the site URL through the existing callback.
 * Keep credentials in the URL only until Supabase/the callback consumes them;
 * never copy them into application storage, logs, or a second history entry.
 */
export function authCallbackLocation(location) {
  const search = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const hasCredentials = ['access_token', 'refresh_token', 'provider_token'].some(key => hash.has(key));
  const hasError = ['error', 'error_code', 'error_description'].some(key => search.has(key) || hash.has(key));
  const callbackRoute = ['/', '/home', '/login', '/auth/callback'].includes(location.pathname);
  if (!hasCredentials && !(callbackRoute && (hasError || search.has('code')))) return null;
  return `/auth/callback${location.search}${location.hash}`;
}

/** Persist the account-settings return marker before starting Google identity linking.
 * If temporary storage is unavailable, fail closed and do not start OAuth: otherwise
 * the provider can return successfully with no trustworthy way to restore the workflow.
 */
export function prepareGoogleLinkReturn(owner) {
  return safeStorageSet(
    resolveSessionStorage(owner),
    GOOGLE_LINK_RETURN_KEY,
    GOOGLE_LINK_RETURN_DESTINATION,
  );
}

/** Best-effort cleanup for a Google-link attempt that failed before redirect. */
export function clearGoogleLinkReturn(owner) {
  return safeStorageRemove(resolveSessionStorage(owner), GOOGLE_LINK_RETURN_KEY);
}

/** Only the account-settings workflow currently stores a Google-link return. */
export function consumeGoogleLinkReturn(owner) {
  const storage = resolveSessionStorage(owner);
  const destination = safeStorageGet(storage, GOOGLE_LINK_RETURN_KEY);
  if (destination !== GOOGLE_LINK_RETURN_DESTINATION) {
    if (destination !== null) safeStorageRemove(storage, GOOGLE_LINK_RETURN_KEY);
    return null;
  }

  // A return marker must remain one-time. If cleanup cannot be verified, do not
  // honor it and risk repeatedly routing future authentication callbacks.
  return safeStorageRemove(storage, GOOGLE_LINK_RETURN_KEY) ? destination : null;
}

/** A lazy callback route may mount after the SDK emits PASSWORD_RECOVERY.
 * Retain only the event's account ID, never tokens. URL hints cannot populate it.
 */
export function createRecoveryEventLatch(now = Date.now) {
  let recovery = null;
  return {
    observe(event, session) {
      if (event === 'SIGNED_OUT' || (recovery && session?.user?.id !== recovery.userId)) recovery = null;
      if (event === 'PASSWORD_RECOVERY' && session?.user?.id) {
        recovery = { userId: session.user.id, expiresAt: now() + 60_000 };
      }
    },
    consume(userId) {
      const pending = recovery;
      recovery = null;
      return Boolean(pending && pending.userId === userId && now() < pending.expiresAt);
    },
  };
}