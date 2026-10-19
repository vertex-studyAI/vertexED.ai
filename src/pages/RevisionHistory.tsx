import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, GitBranch, RotateCcw, ShieldCheck } from 'lucide-react';
import PageSection from '@/components/PageSection';
import { loadRevisionHistory, type RevisionEvent } from '@/lib/revisionHistory';

const EVENT_LABELS: Record<RevisionEvent['eventType'], string> = {
  note: 'Note', attempt: 'Attempt', feedback: 'Feedback', confirmation: 'Confirmation', retry: 'Retry', retraction: 'Retraction',
};

export default function RevisionHistory() {
  const [events, setEvents] = useState<RevisionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true); setError('');
    try { setEvents(await loadRevisionHistory()); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Revision history could not be loaded.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);

  return <PageSection className="space-y-8">
    <Helmet><title>Revision history - VertexED</title><meta name="robots" content="noindex, nofollow" /></Helmet>
    <header className="max-w-3xl">
      <p className="dashboard-kicker">Verified revision graph</p>
      <h1 className="mt-2 text-3xl font-semibold">See how your work changed.</h1>
      <p className="mt-3 text-muted-foreground">Notes, attempts, feedback, confirmations and retries stay separate. Every item keeps its own evidence status; learner attestations are never displayed as teacher verification.</p>
      <div className="mt-4 flex flex-wrap gap-4"><Link className="text-link" to="/main">Back to dashboard</Link><Link className="text-link" to="/saved-work">Open saved work</Link></div>
    </header>

    {loading && <p role="status">Loading revision history…</p>}
    {error && <div className="surface-tile p-5" role="alert"><p>{error}</p><button type="button" className="neu-button mt-3 px-4 py-2" onClick={() => void reload()}>Retry</button></div>}
    {!loading && !error && events.length === 0 && <div className="surface-tile p-6"><GitBranch aria-hidden className="text-primary" /><h2 className="mt-3 text-xl font-semibold">Your trace starts with the next saved study step.</h2><p className="mt-2 text-muted-foreground">Review an answer or complete a supported practice step. VertexED will link new events without rewriting earlier evidence.</p><Link className="btn-solid mt-4 inline-flex items-center gap-2 px-4 py-2" to="/answer-reviewer">Review an answer <ArrowRight size={16} aria-hidden /></Link></div>}
    {!!events.length && <ol className="relative space-y-4 border-l border-primary/25 pl-6" aria-label="Chronological revision events">
      {events.map(event => {
        const status = event.effectiveEvidenceStatus ?? event.evidenceStatus;
        return <li key={event.id} className="surface-tile relative p-5">
          <span className="absolute -left-[2.15rem] top-6 grid h-5 w-5 place-items-center rounded-full border border-primary/40 bg-background" aria-hidden>{event.eventType === 'retraction' ? <RotateCcw size={12} /> : status === 'independently-validated' ? <ShieldCheck size={12} /> : <CheckCircle2 size={12} />}</span>
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{event.payload.label || EVENT_LABELS[event.eventType]}</p><time className="text-xs text-muted-foreground" dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString()}</time></div>
          <p className="mt-1 text-xs uppercase tracking-wider text-primary">{EVENT_LABELS[event.eventType]} · {status.replace(/-/g, ' ')}</p>
          {event.payload.summary && <p className="mt-3 text-sm text-muted-foreground">{event.payload.summary}</p>}
          <p className="mt-3 text-xs text-muted-foreground">Source revision: {event.sourceRevision}{event.parentEventIds.length ? ` · linked to ${event.parentEventIds.length} earlier event${event.parentEventIds.length === 1 ? '' : 's'}` : ''}</p>
          {event.payload.route && <Link className="text-link mt-3 inline-flex" to={event.payload.route}>Open related work</Link>}
        </li>;
      })}
    </ol>}
  </PageSection>;
}
