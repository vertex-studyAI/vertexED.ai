import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import type { TodayPlanItem } from '@/lib/todayPlan';
import { getTodayPlanDoneIds, toggleTodayPlanDone } from '@/lib/todayPlan';
import LiquidGlass from '@/components/LiquidGlass';
import { cn } from '@/lib/utils';

type Props = {
  items: TodayPlanItem[];
  className?: string;
};

const SOURCE_LABEL = {
  planner: 'Planner',
  adaptive: 'Adaptive',
  pulse: 'Pulse',
} as const;

export default function TodayPlanPanel({ items, className }: Props) {
  const [done, setDone] = useState(() => getTodayPlanDoneIds());

  useEffect(() => {
    setDone(getTodayPlanDoneIds());
  }, [items]);

  if (items.length === 0) return null;

  const completed = items.filter((i) => done.has(i.id)).length;

  return (
    <LiquidGlass id="today-plan" variant="panel" className={cn('rounded-2xl', className)}>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Today&apos;s plan</p>
              <h2 className="text-sm font-semibold text-foreground">
                {completed}/{items.length} done
              </h2>
            </div>
          </div>
          <Link to="/planner" className="text-xs text-primary hover:underline">
            Open planner
          </Link>
        </div>

        <ul className="space-y-2">
          {items.map((item) => {
            const isDone = done.has(item.id);
            return (
              <li
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-3 py-2.5 transition',
                  isDone ? 'border-emerald-400/25 bg-emerald-500/8 opacity-80' : 'border-border/50 bg-foreground/[0.02]',
                )}
              >
                <button
                  type="button"
                  aria-label={isDone ? `Mark "${item.label}" incomplete` : `Mark "${item.label}" complete`}
                  onClick={() => setDone(toggleTodayPlanDone(item.id))}
                  className="shrink-0 mt-0.5 text-primary hover:opacity-80 transition"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={item.href}
                      className={cn('text-sm font-medium hover:text-primary transition', isDone && 'line-through text-muted-foreground')}
                    >
                      {item.label}
                    </Link>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {SOURCE_LABEL[item.source]}
                    </span>
                    {item.priority === 'urgent' && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-400/25">
                        urgent
                      </span>
                    )}
                    {item.priority === 'high' && item.source === 'adaptive' && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/25">
                        high
                      </span>
                    )}
                  </div>
                  {item.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.detail}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </LiquidGlass>
  );
}
