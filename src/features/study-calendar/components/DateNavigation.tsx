import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { inputDateToPlanner } from '@/lib/plannerTasks.mjs';

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DateNavigation({ selectedDate, mode, onChange, children }: {
  selectedDate: Date; mode: string; onChange: (date: Date) => void; children?: ReactNode;
}) {
  const [draft, setDraft] = useState(() => dateInputValue(selectedDate));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setDraft(dateInputValue(selectedDate)); setError(null); }, [selectedDate]);
  const shift = (direction: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * (mode === 'Week' ? 7 : 1));
    return next;
  };
  return <div className="planner-date-navigation">
    <div className="planner-date-arrows" role="group" aria-label="Step through your plan">
      <button type="button" className="planner-today" aria-label={mode === 'Week' ? 'Previous week' : 'Previous day'} disabled={shift(-1).getFullYear() < 2000} onClick={() => onChange(shift(-1))}><ChevronLeft size={20} aria-hidden="true" /></button>
      <button type="button" className="planner-today" aria-label={mode === 'Week' ? 'Next week' : 'Next day'} disabled={shift(1).getFullYear() > 2100} onClick={() => onChange(shift(1))}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>
    {children}
    <form className="planner-date-jump" onSubmit={event => {
      event.preventDefault();
      try {
        inputDateToPlanner(draft);
        const [year, month, day] = draft.split('-').map(Number);
        onChange(new Date(year, month - 1, day)); setError(null);
      } catch (failure) { setError(failure instanceof Error ? failure.message : 'Choose a valid date.'); }
    }}>
      <label htmlFor="planner-jump-date">Jump to date</label>
      <input id="planner-jump-date" type="date" required min="2000-01-01" max="2100-12-31" value={draft} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? 'planner-date-error' : undefined} onChange={event => { setDraft(event.target.value); setError(null); }} />
      <button type="submit" className="planner-today">Go</button>
    </form>
    {error && <p id="planner-date-error" role="alert">{error}</p>}
  </div>;
}
