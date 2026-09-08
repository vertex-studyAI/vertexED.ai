import { ArrowRight, Cloud, CloudOff, RotateCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

import LiquidGlass from '@/components/LiquidGlass';
import type { PendingMockReview } from '@/lib/examFlow';
import { retryTargetRoute, type RetryItem } from '@/lib/retryQueue';
import type { TopicHeat } from '@/lib/weaknessTracker';

type Props = {
  retries: RetryItem[];
  weaknesses: TopicHeat[];
  pendingMock: PendingMockReview | null;
  localSaveCount: number;
  cloudUnavailable: boolean;
  syncing: boolean;
  syncMessage?: string;
  onRetrySync: () => void;
};

function dueLabel(iso: string) {
  const due = new Date(iso);
  const today = new Date();
  if (due.getTime() <= today.getTime()) return 'Due now';
  return `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export default function LearningCommandCenter({
  retries,
  weaknesses,
  pendingMock,
  localSaveCount,
  cloudUnavailable,
  syncing,
  syncMessage,
  onRetrySync,
}: Props) {
  const nextRetry = retries[0];
  const weakest = weaknesses[0];

  return (
    <LiquidGlass as="section" variant="panel" className="desk-attention" aria-labelledby="learning-command-heading">
      <div className="p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="dashboard-kicker">Your progress</p>
            <h2 id="learning-command-heading" className="text-xl font-semibold text-foreground">What needs attention</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Based on confirmed work
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-border/60 bg-background/45 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Retry queue</p>
            {nextRetry ? (
              <>
                <h3 className="mt-2 line-clamp-2 font-semibold text-foreground">{nextRetry.topic}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{nextRetry.subject} · {nextRetry.scorePercent}% · {dueLabel(nextRetry.dueAt)}</p>
                <Link to={retryTargetRoute(nextRetry)} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Start retry <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
              </>
            ) : <p className="mt-2 text-sm text-muted-foreground">No measured retries scheduled yet.</p>}
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/45 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Weakest measured topic</p>
            {weakest ? (
              <>
                <h3 className="mt-2 line-clamp-2 font-semibold text-foreground">{weakest.topic}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{weakest.subject} · {Math.round(weakest.avgPercent)}% across {weakest.attempts} attempt{weakest.attempts === 1 ? '' : 's'}</p>
                <Link to={`/notetaker?adaptive=1&subject=${encodeURIComponent(weakest.subject)}&topic=${encodeURIComponent(weakest.topic)}`} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Study this topic <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>
              </>
            ) : <p className="mt-2 text-sm text-muted-foreground">Confirm a review or complete a validated assessment to build this view.</p>}
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/45 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mock workflow</p>
            {pendingMock ? (
              <>
                <h3 className="mt-2 line-clamp-2 font-semibold text-foreground">{pendingMock.paperTitle}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pendingMock.answered}/{pendingMock.total} answers {pendingMock.status === 'in_progress' ? 'saved for recovery' : 'waiting for review'}
                </p>
                <Link to={pendingMock.status === 'in_progress' ? '/paper-maker?resumeMock=1' : '/answer-reviewer'} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  {pendingMock.status === 'in_progress' ? 'Resume mock' : 'Continue review'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </>
            ) : <p className="mt-2 text-sm text-muted-foreground">No completed mock is waiting for review.</p>}
          </article>

          <article className="rounded-2xl border border-border/60 bg-background/45 p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              {cloudUnavailable ? <CloudOff className="h-3.5 w-3.5 text-amber-500" aria-hidden /> : <Cloud className="h-3.5 w-3.5 text-emerald-500" aria-hidden />}
              Sync & recovery
            </p>
            <h3 className="mt-2 font-semibold text-foreground">
              {cloudUnavailable ? 'Cloud unavailable' : localSaveCount > 0 ? `${localSaveCount} device save${localSaveCount === 1 ? '' : 's'} pending` : 'Cloud is reachable'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{syncMessage || (localSaveCount > 0 ? 'Your device copies are preserved until cloud confirmation.' : 'No device-only work is waiting.')}</p>
            {(localSaveCount > 0 || cloudUnavailable) && (
              <button type="button" disabled={syncing} onClick={onRetrySync} className="neu-button mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60">
                <RotateCcw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} aria-hidden /> {syncing ? 'Syncing…' : 'Retry sync'}
              </button>
            )}
          </article>
        </div>
      </div>
    </LiquidGlass>
  );
}
