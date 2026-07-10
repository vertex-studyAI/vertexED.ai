import { Calendar } from 'lucide-react';
import { daysUntilExam } from '@/lib/curriculum';
import { cn } from '@/lib/utils';

type ExamCountdownProps = {
  examDate: string | null;
  boardLabel?: string | null;
  className?: string;
};

export default function ExamCountdown({ examDate, boardLabel, className }: ExamCountdownProps) {
  const days = daysUntilExam(examDate);

  if (days === null) {
    return (
      <div className={cn('rounded-2xl border border-border/60 bg-foreground/[0.03] px-4 py-3', className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Set an exam date in settings to see your countdown</span>
        </div>
      </div>
    );
  }

  const urgent = days >= 0 && days <= 14;
  const past = days < 0;

  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3',
        past
          ? 'border-border/60 bg-foreground/[0.03]'
          : urgent
            ? 'border-amber-400/35 bg-amber-500/10'
            : 'border-primary/25 bg-primary/10',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className={cn('h-4 w-4', urgent && !past ? 'text-amber-500' : 'text-primary')} />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {boardLabel ? `${boardLabel} exam` : 'Exam countdown'}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {past
                ? `Exam was ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
                : days === 0
                  ? 'Exam is today!'
                  : `${days} day${days === 1 ? '' : 's'} left`}
            </p>
          </div>
        </div>
        {!past && days <= 30 && (
          <span className="text-xs text-muted-foreground">
            {days <= 7 ? 'Cram mode recommended' : 'Revision sprint'}
          </span>
        )}
      </div>
    </div>
  );
}
