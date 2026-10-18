import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AccessibleModal from '@/components/AccessibleModal';
import { parseCalendarFile, planCalendarImport } from '@/lib/calendarImport.mjs';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import type { TaskItem } from './Schedule';

type Preview = { additions: TaskItem[]; duplicates: TaskItem[]; conflicts: { task: TaskItem; reason: string }[]; source: string };
const displayDate = (value: string) => {
  const [month, day, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function CalendarImport({ tasks, accountId, onCommit }: {
  tasks: TaskItem[]; accountId: string; onCommit: (expected: TaskItem[], next: TaskItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showCalendars, setShowCalendars] = useState(false);
  const [removeSource, setRemoveSource] = useState<string | null>(null);
  const revision = useRef(0);
  const snapshot = useRef<TaskItem[]>(tasks);
  const latest = useRef(tasks); latest.current = tasks;
  const opener = useRef<HTMLButtonElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const errorMessage = useRef<HTMLParagraphElement>(null);
  const removeCancel = useRef<HTMLButtonElement>(null);
  const manageButton = useRef<HTMLButtonElement>(null);
  const step = added !== null ? 'done' : preview ? 'review' : 'choose';
  useLayoutEffect(() => {
    if (open) {
      if (step === 'choose') firstInput.current?.focus();
      else stepHeading.current?.focus();
    }
  }, [step, open]);
  useLayoutEffect(() => { if (error) errorMessage.current?.focus(); }, [error]);
  useLayoutEffect(() => { if (removeSource) removeCancel.current?.focus(); }, [removeSource]);
  useEffect(() => () => { revision.current++; }, []);
  const invalidate = () => { revision.current++; setPreview(null); setError(null); setBusy(false); };
  const close = () => { invalidate(); setOpen(false); };
  const sources = [...new Set(tasks.map(task => task.calendarSource).filter((value): value is string => typeof value === 'string' && Boolean(value)))];
  const inspect = async () => {
    if (busy || !file || getUserContentStorageScope() !== accountId) return;
    const request = ++revision.current;
    const expected = tasks;
    setBusy(true); setError(null); setNotice(null); setPreview(null);
    try {
      if (file.size > 1024 * 1024) throw new Error('Choose a calendar file no larger than 1 MB.');
      const { events, cancelled } = parseCalendarFile(await file.text());
      const result = await planCalendarImport(events, expected, { accountId, source });
      if (request !== revision.current || getUserContentStorageScope() !== accountId) return;
      if (latest.current !== expected) throw new Error('Your plan changed. Review the file again before importing.');
      snapshot.current = expected; setPreview(result);
      setNotice(cancelled ? `${cancelled} cancelled event${cancelled === 1 ? '' : 's'} excluded. Existing planner tasks were not deleted.` : null);
    } catch (failure) { if (request === revision.current) setError(failure instanceof Error ? failure.message : 'The calendar could not be read.'); }
    finally { if (request === revision.current) setBusy(false); }
  };
  const commit = () => {
    if (!preview || getUserContentStorageScope() !== accountId) return;
    try {
      if (latest.current !== snapshot.current) throw new Error('Your plan changed. Review the file again before importing.');
      onCommit(snapshot.current, [...snapshot.current, ...preview.additions]);
      setAdded(preview.additions.length);
      setNotice(null);
      setPreview(null); setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The calendar could not be imported.'); }
  };
  return <>
    <button ref={opener} type="button" className="planner-today" onClick={() => { invalidate(); setNotice(null); setFile(null); setSource(''); setAdded(null); setShowHelp(false); setShowCalendars(false); setRemoveSource(null); setOpen(true); }}>Import calendar</button>
    {open && <AccessibleModal titleId="calendar-import-title" descriptionId="calendar-import-description" onClose={close} openerRef={opener} initialFocusRef={firstInput} busy={busy} className="popup planner-task-dialog calendar-import-dialog">
      <header className="calendar-import-header">
        <div className="planner-dialog-heading"><h2 id="calendar-import-title">Reserve calendar time</h2><button type="button" className="planner-today" onClick={close}>Close</button></div>
        <p id="calendar-import-description">Add fixed commitments from a calendar file. Your original calendar stays unchanged.</p>
        {step !== 'done' && <ol className="calendar-import-steps" aria-label="Import steps"><li aria-current={step === 'choose' ? 'step' : undefined}>1. Choose file</li><li aria-current={step === 'review' ? 'step' : undefined}>2. Review</li></ol>}
      </header>
      <div className="calendar-import-body planner-task-form">
        <div hidden={step !== 'choose'} className="calendar-choose-fields">
          <label>Calendar name<input ref={firstInput} value={source} maxLength={80} aria-describedby="calendar-name-help" onChange={event => { invalidate(); setSource(event.target.value); }} placeholder="School timetable" /></label>
          <p id="calendar-name-help" className="planner-form-hint">Use the same name next time to recognise duplicate events.</p>
          <label>Calendar file<input ref={fileInput} type="file" accept=".ics,text/calendar" aria-describedby="calendar-file-help" onChange={event => { invalidate(); setNotice(null); setFile(event.target.files?.[0] || null); }} /></label>
          <p id="calendar-file-help" className="planner-form-hint">{file ? `Selected: ${file.name}` : 'Choose an .ics export, up to 1 MB.'}</p>
          <p className="calendar-import-privacy">Only event titles and times are imported. Review them before adding anything.</p>
          <button type="button" className="calendar-disclosure" aria-expanded={showHelp} aria-controls="calendar-file-details" onClick={() => setShowHelp(value => !value)}>Supported events and privacy <span aria-hidden="true">{showHelp ? '−' : '+'}</span></button>
          {showHelp && <div id="calendar-file-details" className="calendar-import-help">
            <p>Up to 1,000 timed occurrences. Supports UTC, local and IANA time zones, and weekly repeats with a fixed count. All-day events, recurrence exceptions and events spanning midnight need separate timed entries.</p>
            <p>Times are shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}. Descriptions, attendees, links and reminders are not imported. This does not connect to your calendar provider.</p>
          </div>}
        </div>
        {preview && <section aria-label="Calendar import preview">
          <h3 ref={stepHeading} tabIndex={-1} className="calendar-step-title">Review {preview.source}</h3>
          <p className="planner-form-hint">Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p>
          <dl className="calendar-review-counts" aria-label="Import totals">
            <div><dt>Ready to add</dt><dd>{preview.additions.length}</dd></div>
            <div><dt>Duplicates skipped</dt><dd>{preview.duplicates.length}</dd></div>
            <div><dt>Conflicts excluded</dt><dd>{preview.conflicts.length}</dd></div>
          </dl>
          {preview.additions.length > 0 ? <ul className="calendar-event-list" aria-label="Commitments to add">{preview.additions.map(task => <li key={task.id}><strong>{task['task name']}</strong><span>{displayDate(task.date)} · {task['start time']} to {task['end time']}</span></li>)}</ul> : <p>No new commitments to add. Your existing plan stays unchanged.</p>}
          {preview.conflicts.length > 0 && <div className="calendar-import-conflicts"><h4>These events will not be added</h4><ul className="calendar-event-list">{preview.conflicts.map(({ task, reason }) => <li key={task.id}><strong>{task['task name']}</strong><span>{reason}</span></li>)}</ul></div>}
        </section>}
        {added !== null && <section className="calendar-import-success">
          <span className="calendar-success-mark" aria-hidden="true">✓</span>
          <h3 ref={stepHeading} tabIndex={-1} className="calendar-step-title">{added} commitment{added === 1 ? '' : 's'} added</h3>
          <p>Time from {source} is now reserved in your plan.</p>
          <p className="planner-form-hint">Check the planner’s save status to confirm account sync.</p>
        </section>}
        {notice && <p role="status">{notice}</p>}
        {error && <p ref={errorMessage} tabIndex={-1} role="alert" className="planner-form-error">{error}</p>}
        {step === 'choose' && sources.length > 0 && <section aria-label="Imported calendars">
          <button ref={manageButton} type="button" className="calendar-disclosure" aria-expanded={showCalendars} aria-controls="calendar-imported-list" onClick={() => { setShowCalendars(value => !value); setRemoveSource(null); }}>Manage imported calendars ({sources.length}) <span aria-hidden="true">{showCalendars ? '−' : '+'}</span></button>
          {showCalendars && <div id="calendar-imported-list">{sources.map(name => {
            const count = tasks.filter(task => task.calendarSource === name).length;
            return <div key={name} className="calendar-source-row"><div><strong>{name}</strong><span>{count} commitment{count === 1 ? '' : 's'}</span></div><button type="button" className="planner-today" disabled={busy} aria-label={`Remove ${name}`} onClick={() => setRemoveSource(name)}>Remove</button></div>;
          })}</div>}
          {removeSource && <div className="calendar-remove-confirm" role="group" aria-label={`Remove ${removeSource}`}>
            <p>Remove all commitments from <strong>{removeSource}</strong>, including edits made here? Other tasks and your original calendar stay unchanged.</p>
            <div className="calendar-confirm-actions"><button ref={removeCancel} type="button" className="planner-today" onClick={() => { setRemoveSource(null); manageButton.current?.focus(); }}>Keep commitments</button><button type="button" className="planner-today" onClick={() => {
              if (getUserContentStorageScope() !== accountId) return;
              try { onCommit(tasks, tasks.filter(task => task.calendarSource !== removeSource)); invalidate(); setNotice(`Removed commitments from ${removeSource}. Check the planner’s save status.`); setRemoveSource(null); firstInput.current?.focus(); }
              catch (failure) { setError(failure instanceof Error ? failure.message : 'The imported calendar could not be removed.'); }
            }}>Confirm removal</button></div>
          </div>}
        </section>}
      </div>
      <footer className="calendar-import-actions">
        {step === 'choose' && <><span className="planner-form-hint">{busy ? 'Reading your events…' : error ? 'Check the file, then try again.' : !source.trim() ? 'Name your calendar to continue.' : !file ? 'Choose a calendar file to continue.' : 'Next: check events and conflicts.'}</span><button type="button" className="planner-new" disabled={!file || !source.trim()} aria-disabled={busy} onClick={() => void inspect()}>{busy ? 'Reading calendar…' : 'Review calendar file'}</button></>}
        {preview && <><button type="button" className="planner-today" onClick={() => { invalidate(); setNotice(null); }}>Back</button><button type="button" className="planner-new" disabled={!preview.additions.length || busy} onClick={commit}>Add {preview.additions.length} commitment{preview.additions.length === 1 ? '' : 's'}</button></>}
        {added !== null && <><button type="button" className="planner-today" onClick={() => { invalidate(); setAdded(null); }}>Import another file</button><button type="button" className="planner-new" onClick={close}>Done</button></>}
      </footer>
    </AccessibleModal>}
  </>;
}
