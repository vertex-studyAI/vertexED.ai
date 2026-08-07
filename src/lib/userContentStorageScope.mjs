const UNAUTHENTICATED_SCOPE = 'unauthenticated';

export function normalizeUserContentStorageScope(scope) {
  if (typeof scope !== 'string' || scope.trim().length === 0) return UNAUTHENTICATED_SCOPE;
  return encodeURIComponent(scope.trim()).slice(0, 256);
}

export function userContentStorageKeys(scope) {
  const normalized = normalizeUserContentStorageScope(scope);
  const prefix = `vertex_content:${normalized}`;
  return {
    artifacts: `${prefix}:artifacts`,
    restore: `${prefix}:restore`,
    chatHandoff: `${prefix}:chat_handoff`,
  };
}
