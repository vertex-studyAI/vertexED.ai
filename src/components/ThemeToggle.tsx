import { Moon, Sun, Monitor } from 'lucide-react';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import type { ThemeMode } from '@/lib/theme';
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

export default function ThemeToggle({ className, compact = false }: Props) {
  const { settings, update } = useAppPreferences();
  const active = settings.theme;

  if (compact) {
    const next: ThemeMode = active === 'dark' ? 'light' : 'dark';
    const Icon = active === 'light' ? Sun : Moon;
    return (
      <button
        type="button"
        aria-label={`Theme: ${active === 'light' ? 'light' : 'dark'}. Click to switch.`}
        title={active === 'light' ? 'Light mode — switch to dark' : 'Dark mode — switch to light'}
        onClick={() => update({ theme: next })}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/50 text-foreground/80 transition hover:bg-accent/20 hover:text-foreground',
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
