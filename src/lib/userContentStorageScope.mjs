const UNHYDRATED_SCOPE = 'unhydrated';
const SIGNED_OUT_SCOPE = 'signed-out';
let activeScope;

export function normalizeUserContentStorageScope(scope) {
  if (scope === undefined) return UNHYDRATED_SCOPE;
  if (scope === null || typeof scope !== 'string' || scope.trim().length === 0) return SIGNED_OUT_SCOPE;
  return encodeURIComponent(scope.trim()).slice(0, 256);
}

export function setUserContentStorageScope(scope) {
  activeScope = scope;
}

export function userContentStorageKeys(scope = activeScope) {
  const normalized = normalizeUserContentStorageScope(scope);
  const prefix = `vertex_content:${normalized}`;
  return {
    artifacts: `${prefix}:artifacts`,
    restore: `${prefix}:restore`,
    chatHandoff: `${prefix}:chat_handoff`,
  };
}
