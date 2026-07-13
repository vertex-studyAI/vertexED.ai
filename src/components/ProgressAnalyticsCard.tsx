import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { ProgressTrend } from '@/lib/progressAnalytics';
import { cn } from '@/lib/utils';

type Props = {
  trend: ProgressTrend;
  className?: string;
};

export default function ProgressAnalyticsCard({ trend, className }: Props) {
  const maxStreak = Math.max(...trend.snapshots.map((s) => s.studyStreak), 1);

  return (
    <div id="streak-calendar" className={cn('neu-card p-5', className)}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Progress analytics</p>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-2xl font-semibold text-foreground">{trend.streakDays}d</p>
          <p className="text-xs text-muted-foreground">Study streak</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground flex items-center gap-1">
            {trend.avgMastery != null ? `${trend.avgMastery}%` : '—'}
            {trend.masteryTrend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
            {trend.masteryTrend === 'down' && <TrendingDown className="h-4 w-4 text-amber-500" />}
            {trend.masteryTrend === 'flat' && <Minus className="h-4 w-4 text-muted-foreground" />}
          </p>
          <p className="text-xs text-muted-foreground">Verified mastery</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">{trend.reviewsThisWeek}</p>
          <p className="text-xs text-muted-foreground">Reviews (7d)</p>
        </div>
      </div>

      {trend.snapshots.length > 1 && (
        <div className="flex items-end gap-1 h-16" aria-hidden>
          {trend.snapshots.map((s) => (
            <div
              key={s.date}
              className="flex-1 rounded-t bg-primary/40 min-h-[4px] transition-all"
              style={{ height: `${Math.max(8, (s.studyStreak / maxStreak) * 100)}%` }}
              title={`${s.date}: ${s.studyStreak}d streak`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
