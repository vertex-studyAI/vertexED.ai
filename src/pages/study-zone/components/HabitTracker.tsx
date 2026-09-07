import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { recordStudySession } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

type Habit = {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
};

type Props = { accent: string };

const MAX_HABITS = 8;
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HabitTracker({ accent }: Props) {
  const { user, loading: authLoading } = useAuth();
  const keys = userContentStorageKeys(authLoading ? undefined : user?.id ?? null);
  const [habits, setHabits] = useLocalStorage<Habit[]>(keys.habits, []);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setDraft('');
  }, [keys.habits]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = todayKey();
    if (window.localStorage.getItem(keys.habitsResetDate) === today) return;
    setHabits((current) => current.map((habit) => ({ ...habit, completed: false })));
    window.localStorage.setItem(keys.habitsResetDate, today);
  }, [keys.habitsResetDate, setHabits]);

  useEffect(() => {
    window.dispatchEvent(new Event('vertexed:learner-state-changed'));
  }, [habits]);

  const done = useMemo(() => habits.filter((habit) => habit.completed).length, [habits]);

  const addHabit = () => {
    const name = draft.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!name || habits.length >= MAX_HABITS) return;
    setHabits((current) => [
      ...current,
      {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft('');
  };

  const toggleHabit = (id: string) => {
    const habit = habits.find((item) => item.id === id);
    setHabits((current) => current.map((item) => (
      item.id === id ? { ...item, completed: !item.completed } : item
    )));
    if (habit && !habit.completed) recordStudySession();
  };

  return (
    <div className="zone-stack">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="zone-heading">Daily habits</h2>
          <p className="zone-subtle">Keep the routines small enough to repeat tomorrow.</p>
        </div>
        <span className="text-sm font-semibold text-foreground">{done}/{habits.length || 0} done</span>
      </div>

      <div className="zone-habit-progress" aria-label={`${done} of ${habits.length} habits complete`}>
        <span
          style={{
            width: habits.length ? `${Math.round((done / habits.length) * 100)}%` : '0%',
            background: accent,
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={draft}
          maxLength={60}
          placeholder="Example: 10 minutes of recall"
          aria-label="New study habit"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addHabit();
            }
          }}
          className="form-control min-w-[220px] flex-1"
        />
        <button
          type="button"
          onClick={addHabit}
          disabled={!draft.trim() || habits.length >= MAX_HABITS}
          className="zone-btn-primary"
        >
          <Plus className="h-4 w-4" aria-hidden /> Add habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="zone-list-surface zone-empty-hint items-center justify-center">
          Add one routine you can finish even on a busy day.
        </div>
      ) : (
        <ul className="zone-list-surface" aria-label="Daily study habits">
          {habits.map((habit) => (
            <li key={habit.id} className="zone-list-item">
              <button
                type="button"
                onClick={() => toggleHabit(habit.id)}
                className="zone-habit-toggle"
                aria-pressed={habit.completed}
              >
                <span className="zone-habit-check" data-complete={habit.completed} style={{ '--habit-accent': accent } as React.CSSProperties}>
                  {habit.completed ? <Check className="h-4 w-4" aria-hidden /> : null}
                </span>
                <span className={habit.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{habit.name}</span>
              </button>
              <button
                type="button"
                onClick={() => setHabits((current) => current.filter((item) => item.id !== habit.id))}
                className="zone-btn-ghost !p-2.5"
                aria-label={`Remove ${habit.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {habits.length >= MAX_HABITS ? <p className="zone-subtle">Keep this list focused: remove one habit before adding another.</p> : null}
      <p className="zone-subtle text-xs">Checks reset daily. This list is saved to this account on the current device.</p>
    </div>
  );
}
