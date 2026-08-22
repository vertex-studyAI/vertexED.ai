export function resolveAdminAccess({ apiDecision, isDevelopment, clientAllowlistMatch }) {
  if (typeof apiDecision === 'boolean') return apiDecision;
  return Boolean(isDevelopment && clientAllowlistMatch);
}
