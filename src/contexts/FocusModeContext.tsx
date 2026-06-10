import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type FocusModeContextValue = {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
};

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

const STORAGE_KEY = "vx-focus-mode";

function getInitial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusModeState] = useState<boolean>(() => getInitial());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("focus-mode", focusMode);
    root.dataset.focusMode = focusMode ? "on" : "off";
    try {
      window.localStorage.setItem(STORAGE_KEY, focusMode ? "1" : "0");
    } catch {
      /* noop */
    }
  }, [focusMode]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setFocusModeState(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setFocusMode = useCallback((value: boolean) => setFocusModeState(value), []);
  const toggleFocusMode = useCallback(() => setFocusModeState((value) => !value), []);

  const value = useMemo(
    () => ({ focusMode, setFocusMode, toggleFocusMode }),
    [focusMode, setFocusMode, toggleFocusMode],
  );

  return <FocusModeContext.Provider value={value}>{children}</FocusModeContext.Provider>;
}

export function useFocusMode() {
  const ctx = useContext(FocusModeContext);
  if (!ctx) {
    return {
      focusMode: false,
      setFocusMode: () => {},
      toggleFocusMode: () => {},
    };
  }
  return ctx;
}
