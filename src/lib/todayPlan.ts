import { localDayKey } from '@/lib/studyDates.mjs';
import type { AdaptiveRecommendation } from '@/lib/adaptiveLearning';
import type { PlannerTaskPreview } from '@/lib/studyEcosystem';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { parseTodayPlanDone } from '@/lib/todayPlanCore.mjs';

export type TodayPlanItem = {
  id: string;
  label: string;
  detail?: string;
  href: string;
  source: 'planner' | 'adaptive' | 'pulse';
  priority: 'urgent' | 'high' | 'medium' | 'low';
};

function storageKey() {
  return userContentStorageKeys().todayPlanDone;
}

function todayKey() {
  return localDayKey();
}

function readDone(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    return parseTodayPlanDone(localStorage.getItem(storageKey())) as Record<string, string[]>;
  } catch {
    return {};
  }
}

function writeDone(data: Record<string, string[]>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(storageKey(), JSON.stringify(data));
    return true;
  } catch {
    // Completion state is optional local UI state. A full/blocked storage area
    // must not turn the dashboard checkbox into an application error.
    return false;
  }
}

export function getTodayPlanDoneIds(): Set<string> {
  const day = todayKey();
  return new Set(readDone()[day] ?? []);
}

export function toggleTodayPlanDone(id: string): Set<string> {
  const day = todayKey();
  const all = readDone();
  const previous = new Set(all[day] ?? []);
  const next = new Set(previous);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  all[day] = Array.from(next);

  // Do not show a completion state that was never persisted. If optional
  // browser storage is unavailable, keep the current UI state truthful while
  // still failing softly instead of throwing through the dashboard control.
  if (!writeDone(all)) return previous;
  return next;
}

export function buildTodayPlanItems(
  tasks: PlannerTaskPreview[],
  recommendations: AdaptiveRecommendation[],
  pulseAction?: { label: string; href: string; reason?: string },
): TodayPlanItem[] {
  const items: TodayPlanItem[] = [];
  const seen = new Set<string>();

  if (pulseAction) {
    const id = `pulse:${pulseAction.href}`;
    items.push({
      id,
      label: pulseAction.label,
      detail: pulseAction.reason,
      href: pulseAction.href,
      source: 'pulse',
      priority: 'urgent',
    });
    seen.add(id);
  }

  for (const task of tasks.slice(0, 4)) {
    const id = `planner:${task.id}`;
    if (seen.has(id)) continue;
    items.push({
      id,
      label: task.name,
      detail: task.startTime ? `Scheduled ${task.startTime}` : undefined,
      href: '/planner',
      source: 'planner',
      priority: 'high',
    });
    seen.add(id);
  }

  for (const rec of recommendations.slice(0, 5)) {
    const id = `adaptive:${rec.id}`;
    if (seen.has(id)) continue;
    items.push({
      id,
      label: rec.title,
      detail: rec.description,
      href: rec.to,
      source: 'adaptive',
      priority: rec.priority,
    });
    seen.add(id);
  }

  const order = { urgent: 0, high: 1, medium: 2, low: 3 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 8);
}
