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

/** Only the account-settings workflow currently stores a Google-link return. */
export function consumeGoogleLinkReturn(storage) {
  try {
    const destination = storage.getItem('vertex_google_link_return');
    storage.removeItem('vertex_google_link_return');
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
