import { Moon, Sun, Monitor } from 'lucide-react';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import type { ThemeMode } from '@/lib/theme';
import { resolveIsDark } from '@/lib/theme';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  compact?: boolean;
};

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Auto', icon: Monitor },
];

const COMPACT_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

export default function ThemeToggle({ className, compact = false }: Props) {
  const { settings, update } = useAppPreferences();
  const active = settings.theme;
  const isDark = resolveIsDark(active);

  if (compact) {
    const currentIndex = COMPACT_CYCLE.indexOf(active);
    const next = COMPACT_CYCLE[(currentIndex + 1) % COMPACT_CYCLE.length];
    const Icon = active === 'system' ? Monitor : isDark ? Moon : Sun;
    const label = active === 'system' ? 'Auto' : isDark ? 'Dark' : 'Light';

    return (
      <button
        type="button"
        aria-label={`Theme: ${label}. Click to switch.`}
        title={`${label} mode — click to cycle`}
        onClick={() => update({ theme: next })}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-foreground/80 transition-colors hover:bg-accent/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/40 p-1 backdrop-blur-md',
        className,
      )}
      role="group"
      aria-label="Color theme"
    >
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          title={label}
          onClick={() => update({ theme: id })}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
            active === id
              ? 'bg-primary/15 text-primary shadow-sm border border-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/10',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
