import { Link } from 'react-router-dom';
import { Clock, Zap } from 'lucide-react';
import { buildCramSession, totalCramMinutes } from '@/lib/cramMode';
import type { ExamBoard } from '@/types/curriculum';

type Props = {
  board: ExamBoard | null;
  examDaysLeft: number | null;
};

export default function CramModePanel({ board, examDaysLeft }: Props) {
  if (examDaysLeft === null || examDaysLeft < 0 || examDaysLeft > 14) return null;

  const items = buildCramSession(board, examDaysLeft);
  const totalMin = totalCramMinutes(items);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" aria-hidden />
        <h3 className="font-semibold text-foreground">
          Exam cram mode — {examDaysLeft} day{examDaysLeft === 1 ? '' : 's'} left
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        When the exam is close, run this sequence (~{totalMin} min total): weakest topic drill → due flashcards → formula skim → short timed questions. Skip new chapters.
      </p>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={item.title}>
            <Link
              to={item.to}
              className="surface-row justify-between px-3 py-2.5 text-sm hover:border-amber-500/30"
            >
              <span className="text-foreground/90">
                <span className="text-amber-600 dark:text-amber-400/80 mr-2">{i + 1}.</span>
                {item.title}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" aria-hidden />
                {item.minutes}m
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
