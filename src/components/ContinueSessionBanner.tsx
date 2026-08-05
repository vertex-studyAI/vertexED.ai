import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, CloudOff, Sparkles, X } from 'lucide-react';

import { consumeFirstSessionHandoff } from '@/lib/firstSessionHandoff.mjs';
import { getLastStudySession } from '@/lib/studyActivity';

export default function ContinueSessionBanner() {
  const [handoff, setHandoff] = useState(() =>
    typeof window === 'undefined' ? null : consumeFirstSessionHandoff(window.sessionStorage),
  );

  if (handoff) {
    const Icon = handoff.deviceOnly ? CloudOff : CheckCircle2;
    return (
      <section
        className="px-6 pb-4 fade-up"
        role={handoff.deviceOnly ? 'alert' : 'status'}
        aria-live="polite"
        aria-labelledby="first-session-handoff-title"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-violet-500/10 to-sky-500/10 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p id="first-session-handoff-title" className="text-sm font-medium text-foreground">
                {handoff.showWelcome ? 'Your starter study plan is ready' : 'Your study plan is saved on this device'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {handoff.deviceOnly
                  ? 'You can start using it now. Keep this browser data until cloud sync is available, then save again from the planner.'
                  : 'Open the planner to review your first-week tasks, adjust deadlines, and begin your first focused session.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Link
              to="/planner"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-foreground/[0.06] px-4 py-2 text-sm text-foreground transition hover:bg-foreground/[0.1] sm:flex-none"
            >
              Review plan
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setHandoff(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/[0.04] text-muted-foreground transition hover:bg-foreground/[0.1] hover:text-foreground"
              aria-label="Dismiss starter plan message"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const last = getLastStudySession();
  if (!last) return null;

  const when = formatRelative(last.at);
  if (!when) return null;

  return (
    <section className="px-6 pb-4 fade-up">
      <div className="max-w-6xl mx-auto rounded-xl border border-violet-400/25 bg-gradient-to-r from-violet-500/10 via-primary/10 to-sky-500/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Continue where you left off</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {last.label} · {when}
            </p>
          </div>
        </div>
        <Link
          to={last.path}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-foreground/[0.06] px-4 py-2 text-sm text-foreground hover:bg-foreground/[0.1] transition shrink-0"
        >
          Resume
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function formatRelative(iso: string): string | null {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff > 1000 * 60 * 60 * 48) return null;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  } catch {
    return null;
  }
}
