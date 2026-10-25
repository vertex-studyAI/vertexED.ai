import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { queueRevisionEvent } from '@/lib/revisionSync';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';

export type RevisionEventType = 'note' | 'attempt' | 'feedback' | 'confirmation' | 'retry' | 'retraction';
export type RevisionEvidenceStatus = 'generated' | 'provisional' | 'evidence-linked' | 'learner-attested' | 'independently-validated' | 'retracted';

export type RevisionEvent = {
  id: string;
  eventType: RevisionEventType;
  occurredAt: string;
  evidenceStatus: RevisionEvidenceStatus;
  effectiveEvidenceStatus?: RevisionEvidenceStatus;
  sourceType: string;
  sourceKey: string;
  sourceRevision: string;
  parentEventIds: string[];
  payload: {
    label?: string;
    summary?: string;
    route?: string;
    artifactId?: string;
    attemptId?: string;
    feedbackId?: string;
    confirmationMethod?: string;
    retryId?: string;
  };
};

export type NewRevisionEvent = Omit<RevisionEvent, 'id' | 'effectiveEvidenceStatus'> & { id?: string };

export function materializeRevisionHistory(events: RevisionEvent[]) {
  const ids = new Set(events.map(event => event.id));
  const retracted = new Set(events
    .filter(event => event.eventType === 'retraction' && event.evidenceStatus === 'retracted')
    .flatMap(event => event.parentEventIds));
  return events.map(event => ({
    ...event,
    parentEventIds: event.parentEventIds.filter(parent => ids.has(parent)),
    effectiveEvidenceStatus: retracted.has(event.id) ? 'retracted' as const : event.evidenceStatus,
  })).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id));
}

export async function appendRevisionEvent(event: NewRevisionEvent): Promise<RevisionEvent> {
  return queueRevisionEvent({ ...event, id: event.id ?? crypto.randomUUID() });
}

export async function loadRevisionHistory(): Promise<RevisionEvent[]> {
  const scope = getUserContentStorageScope();
  if (!scope) throw new Error('Sign in before loading revision history.');
  const token = await getAccessToken();
  if (!token || getUserContentStorageScope() !== scope) throw new Error('Account changed while loading revision history.');
  const events: RevisionEvent[] = [];
  const seen = new Set<string>();
  let cursor: string | null = null;
  for (let page = 0; page < 100; page += 1) {
    const response = await authFetchWithAccessToken(cursor ? `/api/revision-history?cursor=${encodeURIComponent(cursor)}` : '/api/revision-history', token);
    const body = await response.json().catch(() => null);
    if (getUserContentStorageScope() !== scope) throw new Error('Account changed while loading revision history.');
    if (!response.ok || !Array.isArray(body?.events)) throw new Error(body?.error || 'Revision history could not be loaded.');
    events.push(...body.events as RevisionEvent[]);
    const next = typeof body.nextCursor === 'string' && body.nextCursor ? body.nextCursor : null;
    if (!next) return materializeRevisionHistory(events);
    if (seen.has(next)) throw new Error('Revision history cursor did not advance.');
    seen.add(next);
    cursor = next;
  }
  throw new Error('Revision history exceeded the safe recovery limit.');
}
