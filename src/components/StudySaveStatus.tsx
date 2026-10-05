export type StudySaveState = 'loading' | 'saving' | 'cloud' | 'device' | 'failed';

const labels: Record<StudySaveState, string> = {
  loading: 'Checking saved work…',
  saving: 'Saving…',
  cloud: 'Saved to your account',
  device: 'Saved on this device',
  failed: 'Not saved. Keep this page open.',
};

export default function StudySaveStatus({ state, detail, onRetry }: {
  state: StudySaveState;
  detail?: string | null;
  onRetry?: () => void;
}) {
  return <div className="text-sm text-foreground" role="status" aria-live="polite" aria-atomic="true">
    <p>{labels[state]}</p>
    {detail && <p className="mt-1 text-muted-foreground">{detail}</p>}
    {onRetry && (state === 'device' || state === 'failed') && <button type="button" className="btn-glass mt-2 min-h-11" onClick={onRetry}>Retry saving</button>}
  </div>;
}
