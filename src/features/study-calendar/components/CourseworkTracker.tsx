import { useRef, useState } from 'react';
import AccessibleModal from '@/components/AccessibleModal';
import { exportCoursework, removeCourseworkMilestone, updateCourseworkMilestone, validateCoursework, type CourseworkProject, type CourseworkMilestone } from '@/lib/coursework.mjs';
import { localDayKey } from '@/lib/studyDates.mjs';
import '../styles/coursework.css';

type Editor = { projectId: string; milestone: CourseworkMilestone };
const statusLabel = { planned: 'Planned', 'in-progress': 'In progress', complete: 'Complete' };

export default function CourseworkTracker({ projects, onChange, onSchedule }: {
  projects: CourseworkProject[];
  onChange: (projects: CourseworkProject[]) => void;
  onSchedule: (name: string, deadline: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editor | null>(null);
  const [revision, setRevision] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [milestoneToRemove, setMilestoneToRemove] = useState<{ projectId: string; milestoneId: string } | null>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const editorOpener = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState({ title: '', subject: '', course: '', deadline: '', submitted: false });

  const commit = (next: CourseworkProject[]) => { validateCoursework(next); onChange(next); setError(''); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportCoursework(projects)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'vertexed-coursework.json'; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const startMilestone = (project: CourseworkProject, milestone?: CourseworkMilestone) => {
    setEditing({ projectId: project.id, milestone: milestone ? { ...milestone } : { id: crypto.randomUUID(), title: '', dueDate: project.deadline, status: 'planned', evidence: '', revisions: [] } });
    setRevision(''); setError('');
  };

  return <section id="coursework" className="coursework-tracker" aria-labelledby="coursework-heading">
    <div className="coursework-heading"><div><p className="text-sm text-primary">Deadline → evidence → revision</p><h2 id="coursework-heading">Coursework and assessments</h2><p>Break an IA, project or assessment into milestones you can schedule.</p></div><div className="coursework-actions"><button className="planner-new" disabled={projects.length >= 60} aria-describedby={projects.length >= 60 ? 'coursework-limit' : undefined} onClick={event => { editorOpener.current = event.currentTarget; setProjectToEdit(null); setAdding(true); setError(''); setDraft({ title: '', subject: '', course: '', deadline: '', submitted: false }); }}>Add coursework</button>{projects.length > 0 && <button className="planner-today" onClick={download}>Export coursework</button>}</div></div>
    {projects.length >= 60 && <p id="coursework-limit" className="text-sm text-muted-foreground">You have 60 coursework projects. Export your records, then remove a project before adding another.</p>}
    {notice && <p role="status">{notice}</p>}
    {error && !adding && !editing && <p role="alert">{error}</p>}
    {!projects.length && <p className="coursework-empty">No coursework yet. Add a deadline, then record research, draft and review milestones.</p>}
    <div className="coursework-projects">{projects.map(project => <article key={project.id} aria-labelledby={`coursework-${project.id}`}>
      <div className="coursework-heading"><div><h3 id={`coursework-${project.id}`}>{project.title}</h3><p>{project.subject}{project.course ? ` · ${project.course}` : ''} · Due {project.deadline}</p><p className="text-sm text-muted-foreground">{project.submitted ? 'Submitted, as recorded by you' : 'Not yet submitted'} · {project.milestones.filter(m => m.status === 'complete').length} of {project.milestones.length} milestones marked complete by you</p></div><div className="coursework-actions"><button className="planner-today" onClick={event => { editorOpener.current = event.currentTarget; setProjectToEdit(project.id); setDraft({ title: project.title, subject: project.subject, course: project.course, deadline: project.deadline, submitted: project.submitted === true }); setError(''); setAdding(true); }}>Edit coursework</button><button className="planner-today" disabled={project.milestones.length >= 20} onClick={event => { editorOpener.current = event.currentTarget; startMilestone(project); }}>Add milestone</button><button className="planner-today" onClick={() => { setRemoveId(project.id); setMilestoneToRemove(null); }}>Remove coursework</button></div></div>
      {removeId === project.id && <div className="coursework-confirm" role="group" aria-label="Confirm coursework removal"><p>Remove {project.title} and its evidence and revision notes? Scheduled study tasks stay in your planner. Export first if you need a copy.</p><button className="planner-today" onClick={() => { commit(projects.filter(row => row.id !== project.id)); setRemoveId(null); setNotice('Coursework removed. Your scheduled study tasks are unchanged.'); }}>Confirm removal</button><button className="planner-today" onClick={() => setRemoveId(null)}>Keep coursework</button></div>}
      {!project.milestones.length && <p>Add the first milestone with your teacher’s deadline.</p>}
      <ol className="coursework-milestones">{project.milestones.map(milestone => <li key={milestone.id}>
        <div><h4>{milestone.title}</h4><p>{statusLabel[milestone.status]} · Due {milestone.dueDate}{milestone.status !== 'complete' && milestone.dueDate < localDayKey() ? ' · Overdue' : ''}</p>
          {milestone.evidence && <details><summary>Evidence and source locations</summary><p className="coursework-evidence">{milestone.evidence}</p></details>}
          {milestone.revisions.length > 0 && <details><summary>{milestone.revisions.length} revision {milestone.revisions.length === 1 ? 'note' : 'notes'}</summary><ol className="coursework-revisions">{milestone.revisions.map((entry, i) => <li key={i}><time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time><p>{entry.note}</p></li>)}</ol></details>}
          {milestoneToRemove?.projectId === project.id && milestoneToRemove.milestoneId === milestone.id && <div className="coursework-confirm" role="group" aria-label={`Confirm removal of ${milestone.title}`}><p>Remove {milestone.title} and its evidence and revision notes? Other milestones and scheduled study tasks stay. Export coursework first if you need a copy.</p><div className="coursework-actions"><button className="planner-today" onClick={() => { try { commit(removeCourseworkMilestone(projects, project.id, milestone.id)); setMilestoneToRemove(null); setNotice('Milestone removed. Other milestones, their notes and scheduled study tasks are unchanged.'); } catch (e) { setError(e instanceof Error ? e.message : 'The milestone could not be removed.'); } }}>Confirm milestone removal</button><button className="planner-today" onClick={() => setMilestoneToRemove(null)}>Keep milestone</button></div></div>}
        </div><div className="coursework-actions"><button className="planner-today" onClick={event => { editorOpener.current = event.currentTarget; startMilestone(project, milestone); }} aria-label={`Update ${milestone.title}`}>Update</button>{milestone.status !== 'complete' && <button className="planner-today" onClick={() => onSchedule(`${project.title}: ${milestone.title}`, milestone.dueDate)} aria-label={`Schedule ${milestone.title}`}>Schedule study time</button>}<button className="planner-today" onClick={() => { setMilestoneToRemove({ projectId: project.id, milestoneId: milestone.id }); setRemoveId(null); setError(''); }} aria-label={`Remove milestone ${milestone.title}`}>Remove milestone</button></div>
      </li>)}</ol>
    </article>)}</div>
    <p className="text-sm text-muted-foreground">Completion and evidence are your own records. Grade estimate: insufficient evidence. Milestones do not establish an official mark or teacher approval. Saved with your planner; its save status applies here.</p>
    {adding && <AccessibleModal titleId="coursework-add-title" onClose={() => setAdding(false)} initialFocusRef={firstInput} openerRef={editorOpener} className="coursework-dialog">
      <h2 id="coursework-add-title">{projectToEdit ? 'Edit coursework' : 'Add coursework'}</h2><p>Use the dates and requirements given by your school.</p>
      <form onSubmit={event => { event.preventDefault(); try { const now = new Date().toISOString(); const fields = { ...draft, title: draft.title.trim(), subject: draft.subject.trim(), course: draft.course.trim(), updatedAt: now }; commit(projectToEdit ? projects.map(row => row.id === projectToEdit ? { ...row, ...fields } : row) : [...projects, { ...fields, id: crypto.randomUUID(), createdAt: now, milestones: [] }]); setAdding(false); setNotice(projectToEdit ? 'Coursework updated. Your milestones and revision notes are preserved.' : 'Coursework added. Add a milestone to plan the next step.'); } catch (e) { setError(e instanceof Error ? e.message : 'Coursework could not be added.'); } }}>
        <label>Coursework title<input ref={firstInput} required maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
        <label>Subject<input required maxLength={100} value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} /></label>
        <label>Course and level (optional)<input maxLength={100} placeholder="For example, IB DP Biology HL" value={draft.course} onChange={e => setDraft({ ...draft, course: e.target.value })} /></label>
        <label>Final deadline<input type="date" required min="2000-01-01" max="2100-12-31" value={draft.deadline} onChange={e => setDraft({ ...draft, deadline: e.target.value })} /></label>
        <label>Submission status<select value={draft.submitted ? 'submitted' : 'pending'} onChange={e => setDraft({ ...draft, submitted: e.target.value === 'submitted' })}><option value="pending">Not yet submitted</option><option value="submitted">Submitted, as recorded by me</option></select></label><p className="text-sm text-muted-foreground">The final deadline stays in Today until you mark this coursework submitted. Completing milestones does not submit your work.</p>
        {error && <p role="alert">{error}</p>}<div className="coursework-actions"><button className="planner-new" type="submit">Save coursework</button><button type="button" className="planner-today" onClick={() => setAdding(false)}>Cancel</button></div>
      </form>
    </AccessibleModal>}
    {editing && <AccessibleModal titleId="coursework-edit-title" onClose={() => setEditing(null)} initialFocusRef={firstInput} openerRef={editorOpener} className="coursework-dialog">
      <h2 id="coursework-edit-title">Milestone and revision</h2>
      <form onSubmit={event => { event.preventDefault(); try {
        const project = projects.find(row => row.id === editing.projectId);
        if (!project) throw new Error('This coursework is no longer available.');
        const existing = project.milestones.some(row => row.id === editing.milestone.id);
        const base = existing ? projects : projects.map(row => row.id === project.id ? { ...row, milestones: [...row.milestones, editing.milestone] } : row);
        const { title, dueDate, status, evidence } = editing.milestone;
        commit(updateCourseworkMilestone(base, project.id, editing.milestone.id, { title: title.trim(), dueDate, status, evidence: evidence.trim() }, revision));
        setEditing(null); setNotice('Milestone updated. Previous revision notes are preserved.');
      } catch (e) { setError(e instanceof Error ? e.message : 'The milestone could not be saved.'); } }}>
        <label>Milestone title<input ref={firstInput} required maxLength={160} value={editing.milestone.title} onChange={e => setEditing({ ...editing, milestone: { ...editing.milestone, title: e.target.value } })} /></label>
        <label>Milestone deadline<input type="date" required min="2000-01-01" max={projects.find(row => row.id === editing.projectId)?.deadline} value={editing.milestone.dueDate} onChange={e => setEditing({ ...editing, milestone: { ...editing.milestone, dueDate: e.target.value } })} /></label>
        <label>Status<select value={editing.milestone.status} onChange={e => setEditing({ ...editing, milestone: { ...editing.milestone, status: e.target.value as CourseworkMilestone['status'] } })}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Evidence and source locations<textarea rows={3} maxLength={4000} placeholder="Record a notebook title, document page, feedback or where to find your work." value={editing.milestone.evidence} onChange={e => setEditing({ ...editing, milestone: { ...editing.milestone, evidence: e.target.value } })} /></label>
        <label>Add a revision note<textarea rows={3} maxLength={2000} placeholder="What changed, and what will you try next?" value={revision} onChange={e => setRevision(e.target.value)} /></label><p className="text-sm text-muted-foreground">New notes are appended to your history. Source locations are recorded as text; they are not uploaded or independently verified.</p>
        {error && <p role="alert">{error}</p>}<div className="coursework-actions"><button className="planner-new" type="submit">Save milestone</button><button type="button" className="planner-today" onClick={() => setEditing(null)}>Cancel</button></div>
      </form>
    </AccessibleModal>}
  </section>;
}
