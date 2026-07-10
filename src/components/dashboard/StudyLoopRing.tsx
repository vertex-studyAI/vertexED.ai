import { Link } from 'react-router-dom';
import { LOOP_STEPS, getLoopWeekStatus } from '@/lib/studyLoopTracker';
import { cn } from '@/lib/utils';

export default function StudyLoopRing({ className }: { className?: string }) {
  const { completed, completionPercent, weekKey } = getLoopWeekStatus();

  return (
    <div className={cn('study-loop-ring rounded-xl border border-border/50 bg-foreground/[0.02] p-4', className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Study loop</p>
          <p className="text-sm font-medium text-foreground">{completionPercent}% closed this week</p>
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">{weekKey}</span>
      </div>

      <div className="study-loop-nodes overflow-x-auto pb-1 -mx-1 px-1">
        {LOOP_STEPS.map((step, i) => {
          const done = completed.includes(step.id);
          const prevDone = i > 0 && completed.includes(LOOP_STEPS[i - 1].id);
          return (
            <div key={step.id} className="study-loop-node-wrap">
              {i > 0 && (
                <span
                  className={cn('study-loop-connector', prevDone && 'is-live')}
                  aria-hidden
                />
              )}
              <Link
                to={step.href}
                className={cn('study-loop-node', done && 'is-done')}
                title={step.verb}
              >
                <span className="study-loop-node-num">{i + 1}</span>
                <span className="study-loop-node-label">{step.label}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
