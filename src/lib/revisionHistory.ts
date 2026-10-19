import { authFetch } from '@/lib/apiAuth';

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
  const response = await authFetch('/api/revision-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...event, id: event.id ?? crypto.randomUUID() }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.event) throw new Error(body?.error || 'Revision event could not be saved.');
  return body.event as RevisionEvent;
}

export async function loadRevisionHistory(): Promise<RevisionEvent[]> {
  const events: RevisionEvent[] = [];
  const seen = new Set<string>();
  let cursor: string | null = null;
  for (let page = 0; page < 100; page += 1) {
    const response = await authFetch(cursor ? `/api/revision-history?cursor=${encodeURIComponent(cursor)}` : '/api/revision-history');
    const body = await response.json().catch(() => null);
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
