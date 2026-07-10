export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_META_COLORS: Record<'light' | 'dark', string> = {
  dark: '#070b14',
  light: '#f4f7fb',
};

export function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const isDark = resolveIsDark(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function getThemeMetaColor(theme: ThemeMode): string {
  return THEME_META_COLORS[resolveIsDark(theme) ? 'dark' : 'light'];
}
