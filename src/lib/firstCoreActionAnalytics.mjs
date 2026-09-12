import { resolveLocalStorage, safeStorageGet, safeStorageSet } from './browserStorage.mjs';
import { normalizeUserContentStorageScope } from './userContentStorageScope.mjs';
import { trackProductEvent } from './productAnalytics.mjs';

export const FIRST_CORE_ACTION_EVENT = 'First Core Action Completed';

const ALLOWED_KEYS = new Set(['kind', 'entry', 'result']);
const ALLOWED_KINDS = new Set([
  'deterministic_quiz',
  'answer_review',
  'mock_review',
  'practice_session',
]);
const ALLOWED_ENTRIES = new Set([
  'onboarding_handoff',
  'dashboard',
  'planner',
  'exam_prep',
]);
const ALLOWED_RESULTS = new Set(['completed', 'degraded']);

export function buildFirstCoreActionProperties(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;

  const keys = Object.keys(input);
  if (keys.length !== 3 || keys.some((key) => !ALLOWED_KEYS.has(key))) return null;

  const { kind, entry, result } = input;
  if (!ALLOWED_KINDS.has(kind)) return null;
  if (!ALLOWED_ENTRIES.has(entry)) return null;
  if (!ALLOWED_RESULTS.has(result)) return null;

  return { kind, entry, result };
}

export function firstCoreActionReceiptKey(accountId) {
  if (typeof accountId !== 'string' || !accountId.trim()) return null;
  const scope = normalizeUserContentStorageScope(accountId);
  return `vertex_content:${scope}:first_core_action_completed`;
}

export function recordFirstCoreActionCompleted({
  accountId,
  kind,
  entry,
  result,
  owner = typeof window === 'undefined' ? null : window,
  track = trackProductEvent,
} = {}) {
  const properties = buildFirstCoreActionProperties({ kind, entry, result });
  const receiptKey = firstCoreActionReceiptKey(accountId);
  if (!properties || !receiptKey) return false;

  const storage = resolveLocalStorage(owner);
  if (!storage) return false;

  // Persist the account-scoped receipt before attempting analytics. This makes
  // the event fail closed when durable deduplication is unavailable and avoids
  // retrying an analytics emission merely because the analytics provider is
  // blocked or unavailable.
  if (safeStorageGet(storage, receiptKey) === '1') return false;
  if (!safeStorageSet(storage, receiptKey, '1')) return false;

  try {
    track(FIRST_CORE_ACTION_EVENT, properties);
  } catch {
    // Product completion must never fail because analytics is unavailable.
  }
  return true;
}
