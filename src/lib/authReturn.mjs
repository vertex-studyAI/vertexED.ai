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

/**
 * Persist the account-settings Google-link return before starting OAuth.
 * If session storage is blocked/unavailable, fail closed so the caller does not
 * start an identity-link flow that cannot safely return to its owning surface.
 */
export function setGoogleLinkReturn(owner) {
  return safeStorageSet(
    resolveSessionStorage(owner),
    GOOGLE_LINK_RETURN_KEY,
    GOOGLE_LINK_RETURN_DESTINATION,
  );
}

/** Best-effort cleanup for a link attempt that fails before leaving the page. */
export function clearGoogleLinkReturn(owner) {
  return safeStorageRemove(resolveSessionStorage(owner), GOOGLE_LINK_RETURN_KEY);
}

/** Only the account-settings workflow currently stores a Google-link return. */
export function consumeGoogleLinkReturn(owner) {
  const storage = resolveSessionStorage(owner);
  const destination = safeStorageGet(storage, GOOGLE_LINK_RETURN_KEY);

  // A return marker must be one-time. If it cannot be removed, do not honor it;
  // otherwise a stale marker could redirect a later unrelated auth callback.
  if (!safeStorageRemove(storage, GOOGLE_LINK_RETURN_KEY)) return null;
  return destination === GOOGLE_LINK_RETURN_DESTINATION ? destination : null;
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
