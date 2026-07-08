import { authFetch } from '@/lib/apiAuth';

type PlannerTask = {
  'task name': string;
  date: string;
  'start time': string;
  'task duration': number;
  'end time': string;
  tag: string;
};

export async function textToTask(
  prompt: string,
  tags: string[],
  existingTasks: unknown[],
): Promise<PlannerTask> {
  const res = await authFetch('/api/planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, tags, existingTasks }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data?.error === 'string' && data.error.trim()
        ? data.error
        : `Planner request failed (${res.status})`,
    );
  }

  return data as PlannerTask;
}
