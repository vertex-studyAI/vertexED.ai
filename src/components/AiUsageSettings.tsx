import { useCallback, useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/apiAuth';
import { formatAiUsageAmount, formatAiUsageReset, loadAiUsage } from '@/lib/aiUsage.mjs';

type Usage = Awaited<ReturnType<typeof loadAiUsage>>;
type UsageState = { accountId: string | null; status: 'loading' | 'unavailable' | 'ready'; usage?: Usage };

export default function AiUsageSettings({ accountId }: { accountId: string | null }) {
  const [state, setState] = useState<UsageState>({ accountId, status: 'loading' });
  const revision = useRef(0);
  const request = useRef<AbortController | null>(null);
  const currentAccount = useRef(accountId);
  currentAccount.current = accountId;

  const refresh = useCallback(() => {
    const currentRevision = ++revision.current;
    request.current?.abort();
    if (!accountId) { setState({ accountId, status: 'unavailable' }); return; }
    const controller = new AbortController();
    request.current = controller;
    setState({ accountId, status: 'loading' });
    const isCurrent = () => !controller.signal.aborted && revision.current === currentRevision && currentAccount.current === accountId;
    void loadAiUsage(authFetch, { signal: controller.signal }).then(usage => {
      if (isCurrent()) setState({ accountId, status: 'ready', usage });
    }).catch(() => {
      if (isCurrent()) setState({ accountId, status: 'unavailable' });
    });
  }, [accountId]);

  useEffect(() => {
    const requestRevision = revision;
    const activeRequest = request;
    refresh();
    window.addEventListener('focus', refresh);
    return () => { requestRevision.current++; activeRequest.current?.abort(); window.removeEventListener('focus', refresh); };
  }, [refresh]);

  useEffect(() => {
    if (state.status !== 'ready' || !state.usage) return;
    const timer = window.setTimeout(refresh, Math.max(0, Date.parse(state.usage.period.resetsAt) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [state, refresh]);

  const current = state.accountId === accountId ? state : { accountId, status: 'loading' as const };
  const usage = current.status === 'ready' ? current.usage : undefined;
  const exhausted = usage?.account.remainingMicros === 0;
  return <section className="neu-card p-6 sm:p-8" aria-labelledby="ai-usage-heading" aria-busy={current.status === 'loading'}>
    <h2 id="ai-usage-heading" className="text-lg font-medium text-foreground">AI usage</h2>
    <p className="mt-2 text-base text-muted-foreground">Daily service allowance for AI tools.</p>
    {current.status === 'loading' && <p role="status" className="mt-4 text-base">Checking your account usage…</p>}
    {current.status === 'unavailable' && <p role="alert" className="mt-4 text-base text-destructive">AI usage is temporarily unavailable. Try again to check your allowance.</p>}
    {usage && <>
      <p role="status" className="mt-4 text-base">
        {exhausted ? 'Your AI allowance is fully used or reserved. New requests are paused while your available allowance is zero.'
          : !usage.projectAvailable ? 'The shared AI allowance is unavailable. New AI requests are paused; your account balance is shown below.'
          : usage.concurrency.accountBlocked ? 'Your account has reached its limit for concurrent AI requests. A held request must be resolved before another can start.'
          : 'Your account has AI allowance remaining. Each request must fit within the available allowance.'}
      </p>
      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 min-[360px]:grid-cols-2">
        {([
          ['Daily account limit', usage.account.limitMicros], ['Used', usage.account.usedMicros],
          ['Reserved', usage.account.reservedMicros], ['Remaining', usage.account.remainingMicros],
        ] as const).map(([label, amount]) => <div key={label} className="min-w-0 border-t border-border/60 pt-3">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-1 break-words text-base font-medium tabular-nums">{formatAiUsageAmount(amount)}</dd>
        </div>)}
      </dl>
      <p className="mt-5 text-base text-muted-foreground">Requests in progress or awaiting a confirmed outcome remain reserved.</p>
      <dl className="mt-4 space-y-2 text-base">
        <div><dt className="inline text-muted-foreground">Reserved from earlier days: </dt><dd className="inline font-medium tabular-nums">{formatAiUsageAmount(usage.account.carriedReservedMicros)}</dd></div>
        <div><dt className="inline text-muted-foreground">Requests awaiting confirmation: </dt><dd className="inline font-medium tabular-nums">{usage.concurrency.accountUncertain}</dd></div>
      </dl>
      <p className="mt-3 text-base">Daily reset: <time dateTime={usage.period.resetsAt}>{formatAiUsageReset(usage.period.resetsAt)}</time>.</p>
      <p className="mt-3 text-base text-muted-foreground">Earlier-day reservations are separate from today’s remaining allowance. Unresolved requests can still hold request slots after the daily reset.</p>
    </>}
    <button type="button" onClick={refresh} disabled={current.status === 'loading' || !accountId} className="neu-button mt-5 px-4 py-2 text-sm disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {current.status === 'loading' ? 'Checking usage…' : 'Refresh AI usage'}
    </button>
  </section>;
}
