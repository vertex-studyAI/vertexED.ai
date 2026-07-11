import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { SubjectMastery } from '@/lib/adaptiveLearning';
import LiquidGlass from '@/components/LiquidGlass';
import { cn } from '@/lib/utils';

const TREND_ICON = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  unknown: Minus,
} as const;

const TREND_STYLE = {
  improving: 'text-emerald-500',
  declining: 'text-rose-400',
  stable: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
} as const;

type Props = {
  mastery: SubjectMastery[];
  focusSubject?: string | null;
  className?: string;
};

export default function SubjectMasteryCard({ mastery, focusSubject, className }: Props) {
  if (mastery.length === 0) return null;

  const top = mastery.slice(0, 6);

  return (
    <LiquidGlass id="subject-mastery" variant="panel" className={cn('rounded-2xl', className)}>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Subject mastery</p>
            <h2 className="text-sm font-semibold text-foreground">Where your marks are landing</h2>
          </div>
          <Link to="/answer-reviewer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            Log a review
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {top.map((row) => {
            const TrendIcon = TREND_ICON[row.trend];
            const isFocus = focusSubject && row.subject === focusSubject;
            return (
              <div
                key={row.subject}
                className={cn(
                  'rounded-xl border px-3 py-2.5',
                  isFocus ? 'border-primary/35 bg-primary/8' : 'border-border/50 bg-foreground/[0.02]',
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium text-foreground truncate">{row.subject}</span>
                  <span className="text-sm font-semibold tabular-nums">{row.mastery}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        row.mastery >= 70 ? 'bg-emerald-500' : row.mastery >= 50 ? 'bg-amber-400' : 'bg-rose-400',
                      )}
                      style={{ width: `${Math.min(100, Math.max(0, row.mastery))}%` }}
                    />
                  </div>
                  <TrendIcon className={cn('h-3.5 w-3.5 shrink-0', TREND_STYLE[row.trend])} aria-hidden />
                  {row.attempts > 0 && (
                    <span className="text-[10px] text-muted-foreground shrink-0">{row.attempts} reviews</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LiquidGlass>
  );
}
