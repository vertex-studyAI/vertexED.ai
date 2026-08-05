export const FIRST_SESSION_WELCOME_KEY = "vertex_welcome";
export const FIRST_SESSION_SYNC_NOTICE_KEY = "vertex_plan_sync_notice";

export function consumeFirstSessionHandoff(storage) {
  if (!storage || typeof storage.getItem !== "function") return null;

  const showWelcome = storage.getItem(FIRST_SESSION_WELCOME_KEY) === "1";
  const deviceOnly = Boolean(storage.getItem(FIRST_SESSION_SYNC_NOTICE_KEY));

  storage.removeItem?.(FIRST_SESSION_WELCOME_KEY);
  storage.removeItem?.(FIRST_SESSION_SYNC_NOTICE_KEY);

  if (!showWelcome && !deviceOnly) return null;

  return {
    showWelcome,
    deviceOnly,
  };
}
