import { isValidUuid } from './security.js';

export const SUPPORT_CASE_CATEGORIES = Object.freeze(['all', 'bug', 'confusing', 'idea', 'praise', 'other']);
const PAGE_SIZES = new Set([25, 50, 100]);

function boundedInteger(value, fallback, { min, max }) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/**
 * Normalises the intentionally narrow support lookup surface. Administrators
 * can filter feedback categories or retrieve one case by its generated request
 * id, but cannot enumerate a learner's other product activity.
 */
export function normaliseSupportQuery(input = {}) {
  const category = SUPPORT_CASE_CATEGORIES.includes(input.category) ? input.category : 'all';
  const rawRequestId = typeof input.requestId === 'string' ? input.requestId.trim() : '';
  return {
    category,
    requestId: isValidUuid(rawRequestId) ? rawRequestId : null,
    hasInvalidRequestId: Boolean(rawRequestId) && !isValidUuid(rawRequestId),
    page: boundedInteger(input.page, 1, { min: 1, max: 10_000 }),
    pageSize: PAGE_SIZES.has(Number(input.pageSize)) ? Number(input.pageSize) : 25,
  };
}

/** Maps database rows to the deliberately content-minimised admin case shape. */
export function toSupportCase(row) {
  return {
    id: row.id,
    category: row.category,
    rating: row.rating,
    feedback: row.feedback,
    pagePath: row.page_path,
    createdAt: row.created_at,
  };
}
