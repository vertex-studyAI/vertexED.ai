import { useEffect, useState } from 'react';

export type AccessibilitySettings = {
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  fontSize: 'base' | 'large' | 'xlarge';
  simpleMode: boolean;
};

const STORAGE_KEY = 'vertex_a11y_settings';

const DEFAULTS: AccessibilitySettings = {
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

function applyToDocument(settings: AccessibilitySettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('high-contrast', settings.highContrast);
  root.classList.toggle('dyslexia-font', settings.dyslexiaFont);
  root.classList.toggle('simple-mode', settings.simpleMode);
  root.dataset.fontSize = settings.fontSize;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(readSettings);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setSettings((s) => ({ ...s, reducedMotion: true }));
    }
    const handler = () => setSettings((s) => ({ ...s, reducedMotion: mq.matches }));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    applyToDocument(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<AccessibilitySettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  };

  return { settings, update };
}
