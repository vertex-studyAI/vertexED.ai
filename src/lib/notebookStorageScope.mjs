const UNHYDRATED_SCOPE = 'unhydrated';

export function normalizeNotebookStorageScope(scope) {
  if (typeof scope !== 'string' || scope.trim().length === 0) return UNHYDRATED_SCOPE;
  return encodeURIComponent(scope.trim()).slice(0, 256);
}

export function notebookStorageKeys(scope) {
  const normalized = normalizeNotebookStorageScope(scope);
  const prefix = `vertex_notebooks:${normalized}`;
  return {
    notebooks: `${prefix}:data`,
    updatedAt: `${prefix}:updated_at`,
  };
}
