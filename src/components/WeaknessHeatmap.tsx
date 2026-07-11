import { useCallback, useEffect, useState } from 'react';
import { getWeaknessHeatmap, type TopicHeat } from '@/lib/weaknessTracker';
import { Link } from 'react-router-dom';

export default function WeaknessHeatmap({ compact = false }: { compact?: boolean }) {
  const limit = compact ? 5 : 10;
  const [topics, setTopics] = useState<TopicHeat[]>(() => getWeaknessHeatmap(limit));

  const refresh = useCallback(() => {
    setTopics(getWeaknessHeatmap(limit));
  }, [limit]);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onFocus);
    };
  }, [refresh]);

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-foreground/[0.03] px-4 py-6 text-center text-sm text-muted-foreground">
        Complete a mock or answer review to see your weakness heatmap.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {topics.map((t) => {
        const heat = Math.max(0, 100 - t.avgPercent);
        return (
          <div key={`${t.subject}-${t.topic}`} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{t.topic}</p>
              <p className="text-xs text-muted-foreground">{t.subject} · {t.attempts} attempt{t.attempts === 1 ? '' : 's'}</p>
            </div>
            <div className="w-24 h-2 rounded-full bg-foreground/10 overflow-hidden" role="progressbar" aria-valuenow={Math.round(t.avgPercent)} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.topic} mastery`}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${heat}%`,
                  background: heat > 50 ? 'hsl(var(--destructive))' : heat > 25 ? 'hsl(35 80% 55%)' : 'hsl(var(--primary))',
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">{Math.round(t.avgPercent)}%</span>
          </div>
        );
      })}
      {!compact && (
        <Link to="/paper-maker" className="text-xs text-primary hover:underline inline-block mt-2">
          Practice weak topics →
        </Link>
      )}
    </div>
  );
}
