export const MAX_QUICK_NOTES = 100;
export const MAX_QUICK_NOTE_TITLE = 120;
export const MAX_QUICK_NOTE_CONTENT = 50_000;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidTimestamp(value) {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

export function normalizeQuickNotes(value) {
  if (!Array.isArray(value)) return [];

  const normalized = [];
  const seenIds = new Set();

  for (const row of value) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;

    const id = normalizeString(row.id);
    const title = normalizeString(row.title);
    const content = typeof row.content === 'string' ? row.content.trim() : '';
    const updatedAt = typeof row.updatedAt === 'string' ? row.updatedAt : '';

    if (!id || !title || !content || !isValidTimestamp(updatedAt) || seenIds.has(id)) continue;

    seenIds.add(id);
    normalized.push({
      id,
      title: title.slice(0, MAX_QUICK_NOTE_TITLE),
      content: content.slice(0, MAX_QUICK_NOTE_CONTENT),
      updatedAt,
    });
    if (normalized.length >= MAX_QUICK_NOTES) break;
  }

  return normalized;
}
