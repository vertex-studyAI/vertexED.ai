import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Clock, Target, Zap } from 'lucide-react';
import type { AdaptiveRecommendation } from '@/lib/adaptiveLearning';
import { cn } from '@/lib/utils';

const KIND_ICONS = {
  learn: Brain,
  practice: Target,
  review: Zap,
  remember: Brain,
  plan: Clock,
  cram: Zap,
};

const PRIORITY_STYLES = {
  urgent: 'border-amber-400/35 bg-amber-500/10',
  high: 'border-primary/30 bg-primary/10',
  medium: 'border-border/60 bg-foreground/[0.03]',
  low: 'border-border/40 bg-foreground/[0.02]',
};

type Props = {
  recommendations: AdaptiveRecommendation[];
  cramModeActive?: boolean;
  estimatedMinutes?: number;
  className?: string;
};

export default function AdaptiveLearningPanel({
  recommendations,
  cramModeActive,
  estimatedMinutes,
  className,
}: Props) {
  if (recommendations.length === 0) return null;

  return (
    <div className={cn('neu-card p-5', className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Adaptive learning</p>
          <h2 className="text-sm font-semibold text-foreground">
            {cramModeActive ? 'Exam cram priorities' : 'Your next best actions'}
          </h2>
        </div>
        {estimatedMinutes != null && estimatedMinutes > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">~{estimatedMinutes} min today</span>
        )}
      </div>

      <div className="space-y-2">
        {recommendations.map((rec) => {
          const Icon = KIND_ICONS[rec.kind];
          return (
            <Link
              key={rec.id}
              to={rec.to}
              className={cn(
                'group flex items-start gap-3 rounded-xl border px-4 py-3 transition hover:scale-[1.01]',
                PRIORITY_STYLES[rec.priority],
              )}
            >
              <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{rec.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
                {rec.score != null && (
                  <p className="text-xs text-amber-600 dark:text-amber-400/90 mt-1">
                    {Math.round(rec.score)}% recent score
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
