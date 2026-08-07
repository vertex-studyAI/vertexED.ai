import { useCallback, useEffect, useRef, useState } from "react";
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
  const keyIsHydrated = hydratedKeyRef.current === resolvedKey;

  useEffect(() => {
    if (hydratedKeyRef.current !== resolvedKey) {
      // Never write the previous account's state into a newly selected key.
      hydratedKeyRef.current = resolvedKey;
      setStored(readLocalValue(resolvedKey, initialRef.current));
      return;
    }

    try {
      window.localStorage.setItem(resolvedKey, JSON.stringify(stored));
    } catch (err) {
      console.warn(`localStorage write failed for "${resolvedKey}":`, err);
    }
  }, [resolvedKey, stored]);

  const setScopedStored = useCallback(
    (value: T | ((prev: T) => T)) => {
      // A scope transition is rehydrated by the effect above; reject writes until then.
      if (hydratedKeyRef.current !== resolvedKey) return;
      setStored(value);
    },
    [resolvedKey],
  );

  // During a key transition, render the safe empty/default value rather than the
  // previous account's data while the new scope is being rehydrated.
  return [keyIsHydrated ? stored : initialRef.current, setScopedStored];
}
