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
      <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/55">
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
              <p className="text-sm text-white/90 truncate">{t.topic}</p>
              <p className="text-xs text-white/45">{t.subject} · {t.attempts} attempt{t.attempts === 1 ? '' : 's'}</p>
            </div>
            <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${heat}%`,
                  background: heat > 50 ? 'hsl(0 70% 55%)' : heat > 25 ? 'hsl(35 80% 55%)' : 'hsl(199 55% 48%)',
                }}
              />
            </div>
            <span className="text-xs text-white/50 w-10 text-right">{Math.round(t.avgPercent)}%</span>
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
