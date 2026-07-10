import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

import type { ActivityEntry, PlannerTaskPreview } from '@/lib/studyEcosystem';
import type { LearningPathStep } from '@/lib/learnerProfile';

const PHASE_COLORS: Record<LearningPathStep['phase'], string> = {
  learn: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/25',
  practice: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-400/25',
  review: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/25',
  remember: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/25',
};

type Props = {
  todayTasks: PlannerTaskPreview[];
  recentActivity: ActivityEntry[];
  learningPath: LearningPathStep[];
  dailyProgress: number;
};

export default function EcosystemPanel({
  todayTasks,
  recentActivity,
  learningPath,
  dailyProgress,
}: Props) {
  return (
    <section className="px-6 pb-8 fade-up">
      <div className="max-w-6xl mx-auto grid gap-4 lg:grid-cols-3">
        <div className="glass-panel p-5 lg:col-span-1 liquid-glass-dispersive">
          <div className="liquid-glass-content">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--foreground) / 0.1)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${dailyProgress} 100`}
                  pathLength={100}
                />
              </svg>
              {dailyProgress}%
            </div>
          </div>

          {recentActivity.length > 0 ? (
            <ul className="space-y-2 mb-4">
              {recentActivity.slice(0, 4).map((entry) => (
                <li
                  key={`${entry.at}-${entry.label}`}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2 text-sm text-foreground/90"
                >
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate flex-1">{entry.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              No sessions logged yet — start in Study Zone.
            </p>
          )}

          <Link
            to="/study-zone"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Open Study Zone <ArrowRight className="h-3 w-3" />
          </Link>
          </div>
        </div>

        <div className="glass-panel p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent activity</h2>
          {recentActivity.length > 0 ? (
            <ul className="space-y-2">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="text-sm text-foreground/80 border-l-2 border-primary/30 pl-3">
                  <p className="line-clamp-2">{entry.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(entry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Log wins in Study Zone — they&apos;ll show up here.
            </p>
          )}
          <Link
            to="/study-zone"
            className="mt-4 text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Go to Study Zone <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="glass-panel p-5 lg:col-span-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-foreground">Learning path</h2>
            <Link to="/learning-hub" className="text-xs text-primary hover:underline">
              Full hub →
            </Link>
          </div>
          <ol className="space-y-2">
            {learningPath.map((step, index) => (
              <li key={step.title}>
                <Link
                  to={step.to}
                  className="flex items-start gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-3 py-2 hover:border-primary/25 hover:bg-foreground/[0.05] transition group"
                >
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] uppercase ${PHASE_COLORS[step.phase]}`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">{step.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{step.phase}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}
