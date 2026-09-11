export const MAX_ACTIVITY_LOG_ENTRIES = 500;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidTimestamp(value) {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

export function normalizeActivityLogEntries(value) {
  if (!Array.isArray(value)) return [];

  const normalized = [];
  const seenIds = new Set();

  for (const row of value) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;

    const id = normalizeString(row.id);
    const message = normalizeString(row.message);
    const createdAt = typeof row.createdAt === 'string' ? row.createdAt : '';

    if (!id || !message || !isValidTimestamp(createdAt) || seenIds.has(id)) continue;

    seenIds.add(id);
    normalized.push({ id, message, createdAt });
    if (normalized.length >= MAX_ACTIVITY_LOG_ENTRIES) break;
  }

  return normalized;
}
