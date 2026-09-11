export const FIRST_SESSION_WELCOME_KEY = "vertex_welcome";
export const FIRST_SESSION_SYNC_NOTICE_KEY = "vertex_plan_sync_notice";

function normalizeAccountId(userId) {
  return typeof userId === "string" && userId.trim() ? userId.trim() : null;
}

export function firstSessionWelcomeKey(userId) {
  const accountId = normalizeAccountId(userId);
  return accountId ? `${FIRST_SESSION_WELCOME_KEY}:${accountId}` : null;
}

export function firstSessionSyncNoticeKey(userId) {
  const accountId = normalizeAccountId(userId);
  return accountId ? `${FIRST_SESSION_SYNC_NOTICE_KEY}:${accountId}` : null;
}

export function markFirstSessionWelcome(storage, userId) {
  const key = firstSessionWelcomeKey(userId);
  if (!key || !storage || typeof storage.setItem !== "function") return false;
  storage.setItem(key, "1");
  return true;
}

export function markFirstSessionSyncNotice(storage, userId) {
  const key = firstSessionSyncNoticeKey(userId);
  if (!key || !storage || typeof storage.setItem !== "function") return false;
  storage.setItem(key, "1");
  return true;
}

export function consumeFirstSessionHandoff(storage, userId) {
  if (!storage || typeof storage.getItem !== "function") return null;

  const welcomeKey = firstSessionWelcomeKey(userId);
  const syncNoticeKey = firstSessionSyncNoticeKey(userId);
  if (!welcomeKey || !syncNoticeKey) return null;

  const showWelcome = storage.getItem(welcomeKey) === "1";
  const deviceOnly = Boolean(storage.getItem(syncNoticeKey));

  storage.removeItem?.(welcomeKey);
  storage.removeItem?.(syncNoticeKey);

  // Legacy unscoped markers cannot be safely attributed to an account. Discard them
  // once an authenticated account reaches the dashboard rather than letting them
  // cross an account boundary.
  storage.removeItem?.(FIRST_SESSION_WELCOME_KEY);
  storage.removeItem?.(FIRST_SESSION_SYNC_NOTICE_KEY);

  if (!showWelcome && !deviceOnly) return null;

  return {
    showWelcome,
    deviceOnly,
  };
}
