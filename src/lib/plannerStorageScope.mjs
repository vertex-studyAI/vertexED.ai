const UNHYDRATED_SCOPE = 'unhydrated';
const ANONYMOUS_SCOPE = 'anonymous';
let activeScope;

export function normalizePlannerStorageScope(scope) {
  if (scope === undefined) return UNHYDRATED_SCOPE;
  if (scope === null || typeof scope !== 'string' || scope.trim().length === 0) return ANONYMOUS_SCOPE;
  return encodeURIComponent(scope.trim()).slice(0, 256);
}

export function setPlannerStorageScope(scope) {
  activeScope = scope;
}

export function plannerStorageKeys(scope = activeScope) {
  const normalized = normalizePlannerStorageScope(scope);
  const prefix = `vertex_planner:${normalized}`;
  return {
    tasks: `${prefix}:tasks`,
    mode: `${prefix}:mode`,
    updatedAt: `${prefix}:updated_at`,
  };
}
