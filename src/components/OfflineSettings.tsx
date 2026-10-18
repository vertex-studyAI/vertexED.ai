import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, WifiOff } from 'lucide-react';
import { downloadOffline, offlineStatus, removeOffline } from '@/lib/offlineControls.mjs';
import '@/styles/offline-study.css';

const labels: Record<string, string> = {
  checking: 'Checking offline storage…',
  unsupported: 'Offline storage is unavailable in this browser.',
  disabled: 'The offline copy is turned off on this device.',
  missing: 'No offline copy is installed yet.',
  downloading: 'Downloading the app and available public materials…',
  incomplete: 'The offline copy is incomplete. Connect and download it again.',
  ready: 'The app and available public materials are saved offline on this device.',
};
const statusNames: Record<string, string> = {
  checking: 'Checking this device', unsupported: 'Unavailable', disabled: 'Not downloaded',
  missing: 'Not downloaded', downloading: 'Downloading', incomplete: 'Download needs repair', ready: 'Ready on this device',
};

export default function OfflineSettings() {
  const [status, setStatus] = useState<{ state: string; updateAvailable?: boolean; downloading?: boolean }>({ state: 'checking' });
  const [online, setOnline] = useState(() => navigator.onLine);
  const [action, setAction] = useState<'download' | 'remove' | null>(null);
  const busy = action !== null;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const requestRevision = useRef(0);
  const downloadButton = useRef<HTMLButtonElement>(null);
  const removeButton = useRef<HTMLButtonElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const removeConfirmation = useRef<HTMLDivElement>(null);
  const statusElement = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (confirmRemove) {
      keepButton.current?.focus();
      removeConfirmation.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [confirmRemove]);
  const refresh = useCallback(async () => {
    const request = ++requestRevision.current;
    try {
      const next = await offlineStatus();
      if (request === requestRevision.current) {
        setStatus(next); setError(null);
        if (next.state !== 'ready' || next.updateAvailable || next.downloading) setNotice(null);
      }
      return next;
    } catch (failure) { if (request === requestRevision.current) setError(failure instanceof Error ? failure.message : 'Offline storage could not be checked.'); }
  }, []);
  useEffect(() => {
    const revision = requestRevision;
    void refresh();
    const changed = () => { setOnline(navigator.onLine); void refresh(); };
    window.addEventListener('online', changed); window.addEventListener('offline', changed);
    window.addEventListener('focus', changed); window.addEventListener('storage', changed);
    navigator.serviceWorker?.addEventListener('controllerchange', changed);
    return () => {
      revision.current++;
      window.removeEventListener('online', changed); window.removeEventListener('offline', changed);
      window.removeEventListener('focus', changed); window.removeEventListener('storage', changed);
      navigator.serviceWorker?.removeEventListener('controllerchange', changed);
    };
  }, [refresh]);
  useEffect(() => {
    if (status.state !== 'downloading' && !status.downloading) return;
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(timer);
  }, [status.state, status.downloading, refresh]);
  const act = async (remove: boolean) => {
    if (busy) return;
    requestRevision.current++;
    setAction(remove ? 'remove' : 'download'); setError(null); setNotice(null);
    try {
      if (remove) await removeOffline();
      else { await downloadOffline(); setStatus({ state: 'downloading' }); }
      const next = await refresh();
      if (!remove && next?.state === 'ready' && !next.updateAvailable && !next.downloading) setNotice('Your offline copy is up to date.');
      setConfirmRemove(false);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Offline storage could not be changed.'); }
    finally { setAction(null); window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active && active !== document.body && active !== downloadButton.current) return;
      if (downloadButton.current && !downloadButton.current.disabled) downloadButton.current.focus();
      else statusElement.current?.focus();
    }); }
  };
  const downloading = status.state === 'downloading' || status.downloading;
  const hasCopy = ['ready', 'incomplete', 'downloading'].includes(status.state);
  const actionLabel = action === 'remove' ? 'Removing copy…'
    : downloading ? 'Downloading…'
    : action === 'download' ? (status.state === 'ready' ? 'Checking for updates…' : 'Downloading…')
    : status.state === 'ready' ? 'Check for updates'
    : status.state === 'incomplete' ? 'Repair offline copy' : 'Download offline copy';
  return <section className="neu-card offline-study" aria-label="Offline study">
    <div className="offline-study-heading"><div><p className="offline-study-eyebrow">On this device</p><h2>Offline study</h2></div><span className="offline-study-badge">{online ? 'Connected' : <><WifiOff size={14} aria-hidden="true" />Offline</>}</span></div>
    <div ref={statusElement} tabIndex={-1} role="status" aria-live="polite" className="offline-study-status">
      {status.state === 'ready' ? <CheckCircle2 aria-hidden="true" /> : <Download aria-hidden="true" />}
      <div><h3>{statusNames[status.state]}</h3><p>{labels[status.state]}</p></div>
    </div>
    <dl className="offline-study-coverage"><div><dt>Included in the download</dt><dd>Available public study materials. Content awaiting subject review is excluded.</dd></div><div><dt>Needs a connection</dt><dd>AI tools and account sync</dd></div></dl>
    {!online && <p className="offline-study-message">Connect to download or update lessons. Check each tool’s save status before leaving.</p>}
    {status.updateAvailable && <p className="offline-study-message">An update is downloaded. Close every VertexED tab, then reopen the app to use it.</p>}
    {error && <p role="alert" className="offline-study-error">{error}</p>}
    {notice && <p role="status" className="offline-study-message">{notice}</p>}
    <div className="offline-study-actions">
      <button ref={downloadButton} type="button" className="offline-study-primary" aria-disabled={busy || downloading} disabled={!online || status.state === 'unsupported' || status.state === 'checking'} onClick={() => { if (!downloading) void act(false); }}>{actionLabel}</button>
      {hasCopy && !confirmRemove && <button ref={removeButton} type="button" className="offline-study-secondary" aria-disabled={busy} onClick={() => { if (!busy) setConfirmRemove(true); }}>Remove offline copy</button>}
    </div>
    {confirmRemove && <div ref={removeConfirmation} className="offline-study-confirm" role="group" aria-label="Remove offline copy">
      <p>Remove the downloaded app and public lessons? You will need a connection to reopen VertexED. Your private work stays on this device.</p>
      <div className="offline-study-actions"><button ref={keepButton} type="button" className="offline-study-secondary" aria-disabled={busy} onClick={() => { if (!busy) { setConfirmRemove(false); window.requestAnimationFrame(() => removeButton.current?.focus()); } }}>Keep offline copy</button><button type="button" className="offline-study-secondary" aria-disabled={busy} onClick={() => void act(true)}>{action === 'remove' ? 'Removing…' : 'Confirm removal'}</button></div>
    </div>}
    <details className="offline-study-details"><summary>What happens to my private work?</summary><p>Private notes and answers use your account’s existing device storage. This download does not confirm they are saved. Removing the public copy leaves private work untouched.</p></details>
  </section>;
}
