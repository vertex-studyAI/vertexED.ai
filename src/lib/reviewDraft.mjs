/** Recover only known text fields; malformed storage must not crash the editor. */
export function normalizeReviewDraft(value, defaults) {
  const record = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, typeof record[key] === 'string' ? record[key] : fallback]));
}
