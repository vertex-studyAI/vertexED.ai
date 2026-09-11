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

const GOOGLE_LINK_RETURN_KEY = 'vertex_google_link_return';

function normalizeAccountId(userId) {
  return typeof userId === 'string' && userId.trim() ? userId.trim() : null;
}

export function googleLinkReturnKey(userId) {
  const accountId = normalizeAccountId(userId);
  return accountId ? `${GOOGLE_LINK_RETURN_KEY}:${encodeURIComponent(accountId)}` : null;
}

/** Retain only the fixed account-settings destination, scoped to the account that initiated linking. */
export function markGoogleLinkReturn(storage, userId, destination = '/user-settings') {
  const key = googleLinkReturnKey(userId);
  if (!key || destination !== '/user-settings') return false;
  try {
    storage.setItem(key, destination);
    // Never leave an old unscoped marker available to a later account.
    storage.removeItem(GOOGLE_LINK_RETURN_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearGoogleLinkReturn(storage, userId) {
  const key = googleLinkReturnKey(userId);
  try {
    if (key) storage.removeItem(key);
    storage.removeItem(GOOGLE_LINK_RETURN_KEY);
  } catch {
    // Blocked storage must not turn a failed provider start into another error.
  }
}

/** Only the account-settings workflow stores a Google-link return.
 * Consume only the marker owned by the account that actually completed the callback.
 */
export function consumeGoogleLinkReturn(storage, userId) {
  const key = googleLinkReturnKey(userId);
  try {
    const destination = key ? storage.getItem(key) : null;
    if (key) storage.removeItem(key);
    // Discard historical unscoped markers instead of attributing them to this account.
    storage.removeItem(GOOGLE_LINK_RETURN_KEY);
    return destination === '/user-settings' ? destination : null;
  } catch {
    // Blocked storage must not turn a successful login into a stuck callback.
    return null;
  }
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
