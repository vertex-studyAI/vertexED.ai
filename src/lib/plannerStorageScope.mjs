const ANONYMOUS_SCOPE = 'anonymous';

export function normalizePlannerStorageScope(scope) {
  if (typeof scope !== 'string' || scope.trim().length === 0) return ANONYMOUS_SCOPE;
  return encodeURIComponent(scope.trim()).slice(0, 256);
}

export function plannerStorageKeys(scope) {
  const normalized = normalizePlannerStorageScope(scope);
  const prefix = `vertex_planner:${normalized}`;
  return {
    tasks: `${prefix}:tasks`,
    mode: `${prefix}:mode`,
    updatedAt: `${prefix}:updated_at`,
  };
}
