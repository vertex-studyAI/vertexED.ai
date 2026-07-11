import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyThemeClass, getThemeMetaColor, resolveIsDark, type ThemeMode } from '@/lib/theme';

export type AccessibilitySettings = {
  theme: ThemeMode;
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  fontSize: 'base' | 'large' | 'xlarge';
  simpleMode: boolean;
};

const STORAGE_KEY = 'vertex_a11y_settings';

const DEFAULTS: AccessibilitySettings = {
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  fontSize: 'base',
  simpleMode: false,
};

function readSettings(): AccessibilitySettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AccessibilitySettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applyAccessibilityClasses(settings: AccessibilitySettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  applyThemeClass(settings.theme);
  root.classList.toggle('high-contrast', settings.highContrast);
  root.classList.toggle('dyslexia-font', settings.dyslexiaFont);
  root.classList.toggle('simple-mode', settings.simpleMode);
  root.dataset.fontSize = settings.fontSize;
}

type AppPreferencesContextValue = {
  settings: AccessibilitySettings;
  update: (patch: Partial<AccessibilitySettings>) => void;
  isDark: boolean;
  themeColor: string;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(readSettings);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setSettings((s) => ({ ...s, reducedMotion: true }));
    }
    const motionHandler = () => setSettings((s) => ({ ...s, reducedMotion: mq.matches }));
    mq.addEventListener('change', motionHandler);
    return () => mq.removeEventListener('change', motionHandler);
  }, []);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const themeHandler = () => applyAccessibilityClasses(settings);
    mq.addEventListener('change', themeHandler);
    return () => mq.removeEventListener('change', themeHandler);
  }, [settings]);

  useEffect(() => {
    applyAccessibilityClasses(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const isDark = useMemo(() => resolveIsDark(settings.theme), [settings.theme]);
  const themeColor = useMemo(() => getThemeMetaColor(settings.theme), [settings.theme]);

  const value = useMemo(
    () => ({
      settings,
      update: (patch: Partial<AccessibilitySettings>) => setSettings((s) => ({ ...s, ...patch })),
      isDark,
      themeColor,
    }),
    [settings, isDark, themeColor],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }
  return ctx;
}

/** @deprecated Use useAppPreferences — kept for gradual migration */
export function useAccessibility() {
  const { settings, update } = useAppPreferences();
  return { settings, update };
}
