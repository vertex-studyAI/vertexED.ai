import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import { getLastStudySession } from '@/lib/studyActivity';

export default function ContinueSessionBanner() {
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
