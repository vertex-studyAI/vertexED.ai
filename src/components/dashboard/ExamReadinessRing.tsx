import type { ExamReadiness } from '@/lib/examReadiness';
import { cn } from '@/lib/utils';

type Props = {
  readiness: ExamReadiness;
  size?: 'sm' | 'md';
  showFactors?: boolean;
  ringOnly?: boolean;
};

const BAND_COLORS = {
  warming: 'text-amber-500',
  building: 'text-primary',
  'exam-ready': 'text-emerald-500',
  unknown: 'text-muted-foreground',
};

export default function ExamReadinessRing({ readiness, size = 'md', showFactors = false, ringOnly = false }: Props) {
  const r = size === 'sm' ? 36 : 52;
  const stroke = size === 'sm' ? 5 : 7;
  const c = 2 * Math.PI * r;
  const offset = c - (readiness.score / 100) * c;

  return (
    <div className={cn('exam-readiness', size === 'sm' && 'exam-readiness-sm', ringOnly && 'exam-readiness-ring-only')}>
      <div className={cn('flex items-center gap-4', ringOnly && 'justify-center')}>
        <div className="relative shrink-0" style={{ width: (r + stroke) * 2, height: (r + stroke) * 2 }}>
          <svg className="exam-readiness-svg" viewBox={`0 0 ${(r + stroke) * 2} ${(r + stroke) * 2}`} aria-hidden>
            <circle
              className="exam-readiness-track"
              cx={r + stroke}
              cy={r + stroke}
              r={r}
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              className={cn('exam-readiness-fill', `exam-readiness-fill--${readiness.band}`)}
              cx={r + stroke}
              cy={r + stroke}
              r={r}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${r + stroke} ${r + stroke})`}
            />
          </svg>
          <div className="exam-readiness-score">
            <span className="tabular-nums font-bold text-foreground">{readiness.score}</span>
          </div>
        </div>
        {!ringOnly && (
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Exam readiness</p>
          <p className={cn('text-sm font-semibold mt-0.5', BAND_COLORS[readiness.band])}>
            {readiness.label}
          </p>
        </div>
        )}
      </div>

      {showFactors && (
        <ul className="mt-4 space-y-2">
          {readiness.factors.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 text-muted-foreground">{f.name}</span>
              <span className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                <span
                  className={cn(
                    'block h-full rounded-full transition-all',
                    f.score / f.max >= 0.7 ? 'bg-emerald-500/70' : f.score / f.max >= 0.4 ? 'bg-primary/70' : 'bg-amber-500/70',
                  )}
                  style={{ width: `${(f.score / f.max) * 100}%` }}
                />
              </span>
              <span className="tabular-nums text-muted-foreground w-8 text-right">{f.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
