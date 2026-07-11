import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Brain, Calendar, Flame, Target } from 'lucide-react';
import type { EcosystemBrief } from '@/lib/studyEcosystem';
import PortalWidget from '@/components/portal/PortalWidget';

type Props = {
  brief: EcosystemBrief;
};

const STATS: Array<{
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  getValue: (b: EcosystemBrief) => string;
  to: string;
}> = [
  { key: 'streak', label: 'Streak', icon: Flame, color: 'text-orange-400', getValue: (b) => `${b.stats.studyStreak}d`, to: '/study-zone' },
  { key: 'habits', label: 'Habits', icon: Target, color: 'text-primary', getValue: (b) => `${b.stats.habitsDoneToday}/${b.stats.habitCount}`, to: '/study-zone' },
  { key: 'cards', label: 'Due cards', icon: Brain, color: 'text-violet-400', getValue: (b) => String(b.dueFlashcards), to: '/notetaker' },
  { key: 'tasks', label: 'Tasks today', icon: Calendar, color: 'text-emerald-400', getValue: (b) => String(b.todayTasks.length), to: '/planner' },
];

export default function DashboardStatGrid({ brief }: Props) {
  return (
    <PortalWidget span={3} variant="tile" className="portal-stat-grid-widget">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-1">
        {STATS.map(({ key, label, icon: Icon, color, getValue, to }) => (
          <Link key={key} to={to} className="portal-stat-cell group">
            <Icon className={`h-4 w-4 ${color} mb-2`} aria-hidden />
            <p className="text-2xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
              {getValue(brief)}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>
    </PortalWidget>
  );
}
