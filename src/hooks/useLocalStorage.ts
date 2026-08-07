import { useCallback, useEffect, useRef, useState } from "react";

function readLocalValue<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const hydratedKeyRef = useRef(key);
  const [stored, setStored] = useState<T>(() => readLocalValue(key, initial));
  const keyIsHydrated = hydratedKeyRef.current === key;

  useEffect(() => {
    if (hydratedKeyRef.current !== key) {
      // Never write the previous scope's state into a newly selected key.
      hydratedKeyRef.current = key;
      setStored(readLocalValue(key, initialRef.current));
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch (err) {
      console.warn(`localStorage write failed for "${key}":`, err);
    }
  }, [key, stored]);

  const setScopedStored = useCallback(
    (value: T | ((prev: T) => T)) => {
      // A key transition is rehydrated by the effect above; reject writes until then.
      if (hydratedKeyRef.current !== key) return;
      setStored(value);
    },
    [key],
  );

  // During a key transition, render the safe empty/default value rather than the
  // previous account's data while the new scope is being rehydrated.
  return [keyIsHydrated ? stored : initialRef.current, setScopedStored];
}
