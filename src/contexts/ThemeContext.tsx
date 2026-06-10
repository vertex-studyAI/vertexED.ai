import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { env } from "@/lib/env";

export type Theme = "light" | "dark" | "amoled" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  toggle: () => void;
  cycleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "vx-theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "amoled" || value === "system";
}

function getInitial(): Theme {
  if (typeof window === "undefined") return env.defaultTheme;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* noop */
  }
  return env.defaultTheme;
}

function getSystemPrefersLight() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitial());
  const [systemPrefersLight, setSystemPrefersLight] = useState<boolean>(() => getSystemPrefersLight());

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === "system") return systemPrefersLight ? "light" : "dark";
    return theme === "light" ? "light" : "dark";
  }, [theme, systemPrefersLight]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "amoled", "system");
    root.classList.add(resolvedTheme);
    if (theme === "amoled") root.classList.add("amoled");
    if (theme === "system") root.classList.add("system");
    root.dataset.theme = theme;
    root.dataset.resolvedTheme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* noop */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        theme === "light" ? "#eef2f7" : theme === "amoled" ? "#020617" : "#0f172a",
      );
    }
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!media) return;

    const onChange = (e: MediaQueryListEvent) => {
      setSystemPrefersLight(e.matches);
    };

    media.addEventListener ? media.addEventListener("change", onChange) : media.addListener(onChange as any);
    return () => {
      media.removeEventListener ? media.removeEventListener("change", onChange) : media.removeListener(onChange as any);
    };
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (isTheme(e.newValue)) setThemeState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "amoled";
      if (current === "amoled") return "system";
      return "light";
    });
  }, []);
  const toggle = cycleTheme;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggle, cycleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: env.defaultTheme,
      resolvedTheme: env.defaultTheme === "light" ? "light" : "dark",
      toggle: () => {},
      cycleTheme: () => {},
      setTheme: () => {},
    } as const;
  }
  return ctx;
}
