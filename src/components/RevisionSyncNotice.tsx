import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { pendingRevisionEvents, revisionSyncStatus, syncRevisionHistory, type RevisionSyncStatus } from '@/lib/revisionSync';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';

export default function RevisionSyncNotice() {
  const { user } = useAuth();
  const scope = user?.id;
  const [state, setState] = useState<RevisionSyncStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setError(''); setBusy(false);
    setState(scope ? revisionSyncStatus(scope) : null);
    const changed = (event: Event) => {
      const next = (event as CustomEvent<RevisionSyncStatus>).detail;
      if (next.scope === scope) setState(next);
    };
    window.addEventListener('vertexed:revision-sync', changed);
    return () => window.removeEventListener('vertexed:revision-sync', changed);
  }, [scope]);

  if (!scope || state?.scope !== scope || (!state.pending && !state.error)) return null;

  const retry = async () => {
    setBusy(true); setError('');
    try { await syncRevisionHistory(); }
    catch { if (getUserContentStorageScope() === scope) setError('Revision history could not sync. Keep your pending entries.'); }
    finally { if (getUserContentStorageScope() === scope) setBusy(false); }
  };
  const exportPending = async () => {
    try {
      const entries = await pendingRevisionEvents(scope);
      if (getUserContentStorageScope() !== scope) return;
      const url = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, pendingRevisionEvents: entries }, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'vertexed-pending-revisions.json'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { if (getUserContentStorageScope() === scope) setError('Pending revisions could not be exported. Keep this tab open and retry.'); }
  };
  return <section aria-label="Revision history save status" className="surface-tile mx-4 mt-3 max-w-6xl p-4 lg:mx-auto">
    <p className="font-semibold">Revision history pending</p>
    <p role="status" aria-live="polite" className="mt-1 text-sm text-muted-foreground">
      {state.pending} {state.pending === 1 ? 'entry has' : 'entries have'} not finished syncing.
      {state.volatile ? ' Some entries are only held in this tab. Export them before leaving.' : ' Pending entries are saved on this device.'}
      {state.error && ` ${state.error}`}
    </p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button type="button" className="neu-button min-h-11 px-4 py-2" disabled={busy} onClick={() => void retry()}>{busy ? 'Retrying…' : 'Retry revision sync'}</button>
      <button type="button" className="neu-button min-h-11 px-4 py-2" onClick={() => void exportPending()}>Export pending entries</button>
      <Link className="text-link inline-flex min-h-11 items-center" to="/revision-history">Open revision history</Link>
    </div>
    {error && <p role="alert" className="mt-2 text-sm">{error}</p>}
  </section>;
}
