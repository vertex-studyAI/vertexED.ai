import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import AccessibleModal from '@/components/AccessibleModal';
import { buildPlannerCalendar, calendarTasks } from '@/lib/plannerCalendar.mjs';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import type { TaskItem } from './Schedule';

const dateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function CalendarExport({ tasks, accountId, selectedDate }: { tasks: TaskItem[]; accountId: string; selectedDate: Date }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [includeTitles, setIncludeTitles] = useState(false);
  const [reminder, setReminder] = useState('none');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const revision = useRef(0);
  const latestTasks = useRef(tasks);
  latestTasks.current = tasks;
  useEffect(() => () => { revision.current++; }, []);
  const close = () => { revision.current++; setBusy(false); setOpen(false); };
  let count = 0;
  try { count = calendarTasks(tasks, from, to).length; } catch { /* Form reports validation on submit. */ }
  const download = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || getUserContentStorageScope() !== accountId) return;
    const request = ++revision.current;
    const snapshot = tasks;
    setBusy(true); setError(null); setNotice(null);
    try {
      const result = await buildPlannerCalendar(snapshot, { from, to, accountId, includeTitles, reminderMinutes: reminder === 'none' ? null : Number(reminder) });
      if (request !== revision.current || getUserContentStorageScope() !== accountId) return;
      if (latestTasks.current !== snapshot) throw new Error('Your plan changed while preparing the file. Download again for the latest times.');
      const url = URL.createObjectURL(new Blob([result.text], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = `vertexed-plan-${from}-to-${to}.ics`;
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setNotice(`Calendar file prepared with ${result.count} task${result.count === 1 ? '' : 's'}. Import it into your calendar and check the times and reminders.`);
    } catch (failure) {
      if (request === revision.current && getUserContentStorageScope() === accountId) setError(failure instanceof Error ? failure.message : 'The calendar file could not be prepared. Try again.');
    } finally { if (request === revision.current) setBusy(false); }
  };
  return <>
    <button ref={opener} type="button" className="planner-today" onClick={() => {
      const end = new Date(selectedDate); end.setDate(end.getDate() + 6);
      setFrom(dateInput(selectedDate)); setTo(dateInput(end)); setError(null); setNotice(null);
      setIncludeTitles(false); setReminder('none'); setOpen(true);
    }}>Export calendar</button>
    {open && <AccessibleModal titleId="calendar-export-title" descriptionId="calendar-export-description" onClose={close} initialFocusRef={firstInput} openerRef={opener} busy={busy} className="popup planner-task-dialog">
      <div className="planner-dialog-heading"><h2 id="calendar-export-title">Take your plan with you</h2><button type="button" className="planner-today" onClick={close}>Close</button></div>
      <p id="calendar-export-description">Download a calendar file (.ics) with unfinished tasks in your chosen dates. Import it into a calendar that accepts these files.</p>
      <form className="planner-task-form" onSubmit={download}>
        <div className="planner-task-fields">
          <label>From date<input ref={firstInput} type="date" required min="2000-01-01" max="2100-12-31" value={from} onChange={event => { setFrom(event.target.value); setNotice(null); }} disabled={busy} /></label>
          <label>To date<input type="date" required min={from || '2000-01-01'} max="2100-12-31" value={to} onChange={event => { setTo(event.target.value); setNotice(null); }} disabled={busy} /></label>
        </div>
        <p>{count} unfinished task{count === 1 ? '' : 's'} selected. Times use this device’s time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p>
        <label className="planner-check"><input type="checkbox" checked={includeTitles} onChange={event => { setIncludeTitles(event.target.checked); setNotice(null); }} disabled={busy} />Include task names</label>
        <p className="planner-form-hint">Without names, events say “Study block” or “Reserved time”. Notes, answers and tutor conversations stay out of the file. Anyone with the file can read its contents.</p>
        <label>Calendar reminder<span className="relative"><select className="form-control-select" style={{ paddingRight: 36 }} value={reminder} onChange={event => { setReminder(event.target.value); setNotice(null); }} disabled={busy}><option value="none">No reminder</option>{[5, 15, 30, 60].map(minutes => <option key={minutes} value={minutes}>{minutes} minutes before</option>)}</select><ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" /></span></label>
        <p className="planner-form-hint">Your calendar handles reminders while VertexED is closed. Check that it imported the reminder and allows notifications.</p>
        <p className="planner-form-hint">This is a copy of your plan. Later changes, completed tasks and automatic rescheduling do not update it. Remove old imported events before importing a replacement to avoid duplicates.</p>
        {error && <p role="alert" className="planner-form-error">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        <div className="planner-dialog-actions"><button type="button" className="planner-today" onClick={close}>Cancel</button><button type="submit" className="planner-new" aria-disabled={busy}>{busy ? 'Preparing file…' : 'Download calendar'}</button></div>
      </form>
    </AccessibleModal>}
  </>;
}
