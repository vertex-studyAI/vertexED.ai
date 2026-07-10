import type { AdaptiveRecommendation } from '@/lib/adaptiveLearning';
import type { PlannerTaskPreview } from '@/lib/studyEcosystem';

export type TodayPlanItem = {
  id: string;
  label: string;
  detail?: string;
  href: string;
  source: 'planner' | 'adaptive' | 'pulse';
  priority: 'urgent' | 'high' | 'medium' | 'low';
};

const STORAGE_KEY = 'vertex_today_plan_done_v1';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readDone(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDone(data: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayPlanDoneIds(): Set<string> {
  const day = todayKey();
  return new Set(readDone()[day] ?? []);
}

export function toggleTodayPlanDone(id: string): Set<string> {
  const day = todayKey();
  const all = readDone();
  const current = new Set(all[day] ?? []);
  if (current.has(id)) current.delete(id);
  else current.add(id);
  all[day] = Array.from(current);
  writeDone(all);
  return current;
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
