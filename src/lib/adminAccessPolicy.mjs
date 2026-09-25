export function resolveAdminAccess({
  apiDecision,
  isDevelopment,
  clientAllowlistMatch,
  allowClientFallback = false,
}) {
  if (typeof apiDecision === 'boolean') return apiDecision;
  // Never trust a client-bundled email allowlist unless explicitly opted in for local work.
  return Boolean(isDevelopment && allowClientFallback && clientAllowlistMatch);
}
