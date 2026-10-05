function normalizeAccountId(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Keeps asynchronous UI work bound to the account that started it.
 * Binding a different account (including sign-out) invalidates every older token.
 */
export function createAccountOperationScope(initialAccountId = null) {
  let activeAccountId = normalizeAccountId(initialAccountId);
  let revision = 0;

  return Object.freeze({
    bind(nextAccountId) {
      const normalized = normalizeAccountId(nextAccountId);
      if (normalized !== activeAccountId) {
        activeAccountId = normalized;
        revision += 1;
      }
      return revision;
    },

    capture(expectedAccountId) {
      const normalized = normalizeAccountId(expectedAccountId);
      if (!normalized || normalized !== activeAccountId) return null;
      return Object.freeze({ accountId: normalized, revision });
    },

    isCurrent(token) {
      return Boolean(
        token
        && token.accountId === activeAccountId
        && token.revision === revision,
      );
    },
  });
}
