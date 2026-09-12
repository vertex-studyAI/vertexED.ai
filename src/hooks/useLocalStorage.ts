import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "./use-toast";
import { userContentStorageKeys } from "@/lib/userContentStorageScope.mjs";

function resolveScopedKey(key: string): string {
  const scoped = userContentStorageKeys();
  switch (key) {
    case "vertex_sr_deck":
      return scoped.srDeck;
    case "vertex_weakness_heatmap":
      return scoped.weaknessHeatmap;
    case "vertex_study_loop_week":
      return scoped.studyLoopWeek;
    case "vertex_progress_snapshots":
      return scoped.progressSnapshots;
    case "vertex_today_plan_done_v1":
      return scoped.todayPlanDone;
    case "vertex_confidence_checkin_v1":
      return scoped.confidenceCheckin;
    case "vertex_exam_night_checklist_v1":
      return scoped.examNightChecklist;
    case "vertex_study_streak":
      return scoped.studyStreak;
    case "vertex_last_study_date":
      return scoped.lastStudyDate;
    case "studyzone_habits":
      return scoped.habits;
    case "studyzone_habits_reset_date":
      return scoped.habitsResetDate;
    default:
      return key;
  }
}

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
  const resolvedKey = resolveScopedKey(key);
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const hydratedKeyRef = useRef(resolvedKey);
  const [stored, setStored] = useState<T>(() => readLocalValue(resolvedKey, initial));
  const storedRef = useRef(stored);
  const dirtyRef = useRef(false);
  storedRef.current = stored;
  const keyIsHydrated = hydratedKeyRef.current === resolvedKey;

  useEffect(() => {
    if (hydratedKeyRef.current !== resolvedKey) {
      hydratedKeyRef.current = resolvedKey;
      const hydrated = readLocalValue(resolvedKey, initialRef.current);
      dirtyRef.current = false;
      storedRef.current = hydrated;
      setStored(hydrated);
    }
    const refresh = (event: Event) => {
      const changedKey = event instanceof StorageEvent ? event.key : (event as CustomEvent<string>).detail;
      if (changedKey && changedKey !== resolvedKey) return;
      // A failed local write means the in-memory value is newer than persisted storage.
      // Preserve that recoverable state until a later local write succeeds instead of
      // silently overwriting it with stale data from another tab or storage event.
      if (dirtyRef.current) return;
      const refreshed = readLocalValue(resolvedKey, initialRef.current);
      storedRef.current = refreshed;
      setStored(refreshed);
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('vertexed:storage-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('vertexed:storage-changed', refresh);
    };
  }, [resolvedKey]);

  const setScopedStored = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (hydratedKeyRef.current !== resolvedKey) return;
      if (resolveScopedKey(key) !== resolvedKey) return;
      // Prefer a prior unsaved in-memory edit after a failed write. Otherwise read
      // the latest persisted value so notebook imports and another tab's completed
      // reviews are retained when applying a functional update.
      const previous = dirtyRef.current
        ? storedRef.current
        : readLocalValue(resolvedKey, initialRef.current);
      const next = typeof value === 'function' ? (value as (prev: T) => T)(previous) : value;
      try {
        window.localStorage.setItem(resolvedKey, JSON.stringify(next));
        dirtyRef.current = false;
        storedRef.current = next;
        setStored(next);
        window.dispatchEvent(new CustomEvent('vertexed:storage-changed', { detail: resolvedKey }));
      } catch (err) {
        console.warn(`localStorage write failed for "${resolvedKey}":`, err);
        // Keep edits available in memory for export and show a recoverable status.
        // Subsequent updates continue from this unsaved value until persistence recovers.
        dirtyRef.current = true;
        storedRef.current = next;
        setStored(next);
        toast({ title: 'Browser storage is unavailable', description: 'This change could not be saved. Keep this page open and export your work before leaving.', variant: 'destructive' });
      }
    },
    [key, resolvedKey],
  );

  // During a key transition, render the safe empty/default value rather than the
  // previous account's data while the new scope is being rehydrated.
  return [keyIsHydrated ? stored : initialRef.current, setScopedStored];
}
