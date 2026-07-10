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
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">
          Exam cram mode — {examDaysLeft} day{examDaysLeft === 1 ? '' : 's'} left
        </h3>
      </div>
      <p className="text-sm text-white/70 mb-4">
        High-yield sequence (~{totalMin} min): weak topics → flashcards → formulas → mini mock
      </p>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={item.title}>
            <Link
              to={item.to}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm hover:border-amber-400/30 transition"
            >
              <span className="text-white/90">
                <span className="text-amber-400/80 mr-2">{i + 1}.</span>
                {item.title}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/45 shrink-0">
                <Clock className="h-3 w-3" />
                {item.minutes}m
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
