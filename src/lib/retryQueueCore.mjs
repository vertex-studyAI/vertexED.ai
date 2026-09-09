import {
  MEASURED_WEAKNESS_EVIDENCE,
  normalizeMeasuredWeaknessEntry,
} from './weaknessEvidenceCore.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

function cleanKeyPart(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
}

export function retryIdForWeakness(entry) {
  return `retry:${cleanKeyPart(entry.subject)}:${cleanKeyPart(entry.topic)}`;
}

export function retryDelayDays(scorePercent) {
  if (scorePercent < 40) return 1;
  if (scorePercent < 70) return 3;
  return 7;
}

export function scheduleMeasuredRetry(items, rawEntry, now = new Date()) {
  const entry = normalizeMeasuredWeaknessEntry(rawEntry);
  if (!entry || entry.evidence !== MEASURED_WEAKNESS_EVIDENCE) return items;

  const scorePercent = Math.round((entry.score / entry.maxScore) * 100);
  const dueAt = new Date(now.getTime() + retryDelayDays(scorePercent) * DAY_MS).toISOString();
  const id = retryIdForWeakness(entry);
  const previous = (Array.isArray(items) ? items : []).find((item) => item?.id === id);
  const history = Array.isArray(previous?.history) ? previous.history.slice(-19) : [];
  const next = {
    id,
    topic: entry.topic,
    subject: entry.subject,
    board: entry.board,
    source: entry.source,
    evidence: MEASURED_WEAKNESS_EVIDENCE,
    scorePercent,
    dueAt,
    scheduledAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'scheduled',
    completedAt: null,
    dismissedAt: null,
    measuredAttempts: Math.max(1, Number(previous?.measuredAttempts) + 1 || 1),
    history: [...history, { status: 'scheduled', at: now.toISOString(), scorePercent }],
  };

  return [next, ...(Array.isArray(items) ? items : []).filter((item) => item?.id !== id)]
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))
    .slice(0, 100);
}

export function validRetryItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    if (!item || typeof item !== 'object') return false;
    if (item.evidence !== MEASURED_WEAKNESS_EVIDENCE) return false;
    if (!String(item.id || '').startsWith('retry:')) return false;
    if (!String(item.topic || '').trim() || !String(item.subject || '').trim()) return false;
    if (!['scheduled', 'completed', 'dismissed'].includes(item.status)) return false;
    if (!Number.isFinite(Date.parse(item.dueAt)) || !Number.isFinite(Number(item.scorePercent))) return false;
    if (!Number.isFinite(Date.parse(item.updatedAt))) return false;
    return Number(item.scorePercent) >= 0 && Number(item.scorePercent) <= 100;
  });
}

export function dueRetryItems(items, now = new Date()) {
  const timestamp = now.getTime();
  return validRetryItems(items).filter((item) => item.status === 'scheduled' && Date.parse(item.dueAt) <= timestamp);
}

function transitionRetry(items, id, status, now, scorePercent) {
  return validRetryItems(items).map((item) => {
    if (item.id !== id) return item;
    const at = now.toISOString();
    const history = Array.isArray(item.history) ? item.history.slice(-19) : [];
    return {
      ...item,
      status,
      updatedAt: at,
      completedAt: status === 'completed' ? at : item.completedAt ?? null,
      dismissedAt: status === 'dismissed' ? at : item.dismissedAt ?? null,
      history: [...history, {
        status,
        at,
        ...(Number.isFinite(Number(scorePercent)) ? { scorePercent: Number(scorePercent) } : {}),
      }],
    };
  });
}

export function completeRetryItem(items, id, now = new Date(), scorePercent) {
  return transitionRetry(items, id, 'completed', now, scorePercent);
}

export function dismissRetryItem(items, id, now = new Date()) {
  return transitionRetry(items, id, 'dismissed', now);
}
