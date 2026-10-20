import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import { CalendarClock, Check, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getPendingLearnerStateCount, initializeLearnerStateSync, queueLearnerStateWrite } from '@/lib/learnerStateSync';
import { IB_PLAN_STATE_KEY, emptyIbStudyPlan, ibPlanSummary, normaliseIbStudyPlan, readIbStudyPlan } from '@/lib/ibStudyPlan.mjs';
import '@/styles/ib-diploma.css';

type Plan = NonNullable<ReturnType<typeof normaliseIbStudyPlan>>;
type Subject = Plan['subjects'][number];
type Milestone = Plan['milestones'][number];

function identifier(prefix: string) {
  const token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2);
  return `${prefix}:${token.slice(0, 24)}`;
}

function today() { return new Date().toISOString().slice(0, 10); }

export default function IBDiploma() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>(() => emptyIbStudyPlan());
  const [notice, setNotice] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectLevel, setSubjectLevel] = useState<'HL' | 'SL'>('HL');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneKind, setMilestoneKind] = useState<Milestone['kind']>('IA');
  const [milestoneSubject, setMilestoneSubject] = useState<string>('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectKind, setProjectKind] = useState<'IA' | 'EE'>('IA');
  const [projectSubject, setProjectSubject] = useState('');
  const [projectMilestone, setProjectMilestone] = useState('');

  const storageKey = userContentStorageKeys(user?.id).ibDiplomaPlan;
  useEffect(() => {
    const load = () => {
      if (!user?.id) return;
      const loaded = readIbStudyPlan(safeStorageGet(resolveLocalStorage(window), storageKey));
      if (!loaded.plan) { setBlocked(true); setNotice(loaded.error); return; }
      setPlan(loaded.plan); setBlocked(false); setNotice(loaded.error);
    };
    load();
    window.addEventListener('vertexed:learner-state-changed', load);
    return () => window.removeEventListener('vertexed:learner-state-changed', load);
  }, [storageKey, user?.id]);

  const summary = useMemo(() => ibPlanSummary(plan), [plan]);
  const save = async (next: Plan) => {
    const normalized = normaliseIbStudyPlan({ ...next, updatedAt: new Date().toISOString() });
    if (!normalized || !user?.id || !getUserContentStorageScope()) { setNotice('Your plan could not be saved. Check the required fields and sign in again.'); return; }
    if (!safeStorageSet(resolveLocalStorage(window), storageKey, JSON.stringify(normalized))) { setNotice('Browser storage is unavailable. Your plan was not changed.'); return; }
    setPlan(normalized);
    queueLearnerStateWrite('ib_plan', IB_PLAN_STATE_KEY, normalized);
    try {
      await initializeLearnerStateSync();
      setNotice(getPendingLearnerStateCount() ? 'Saved on this device. Account sync will retry when available.' : 'Saved to your account.');
    } catch {
      setNotice('Saved on this device. Account sync is unavailable and will retry later.');
    }
  };

  const addSubject = (event: FormEvent) => {
    event.preventDefault();
    const name = subjectName.trim();
    if (!name) { setNotice('Name the subject before adding it.'); return; }
    if (plan.subjects.some((subject) => subject.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setNotice('That subject is already in your plan.'); return; }
    void save({ ...plan, subjects: [...plan.subjects, { id: identifier('subject'), name, level: subjectLevel, targetGrade: null }] });
    setSubjectName('');
  };
  const addMilestone = (event: FormEvent) => {
    event.preventDefault();
    const title = milestoneTitle.trim();
    if (!title || !milestoneDate) { setNotice('Name the milestone and choose its deadline.'); return; }
    if (milestoneKind === 'EE' && milestoneSubject) { setNotice('Extended Essay milestones are kept separate from a subject in this plan.'); return; }
    void save({ ...plan, milestones: [...plan.milestones, { id: identifier('milestone'), title, kind: milestoneKind, subjectId: milestoneKind === 'EE' ? null : milestoneSubject || null, dueDate: milestoneDate, status: 'not-started' }] });
    setMilestoneTitle(''); setMilestoneDate('');
  };
  const addProject = (event: FormEvent) => {
    event.preventDefault();
    const title = projectTitle.trim();
    if (!title) { setNotice('Give this IA or EE workspace a working title.'); return; }
    if (projectKind === 'IA' && !projectSubject) { setNotice('Link an IA workspace to one of your subjects.'); return; }
    const subjectId = projectKind === 'IA' ? projectSubject : null;
    const milestone = projectMilestone ? plan.milestones.find((item) => item.id === projectMilestone) : null;
    if (milestone && (milestone.kind !== projectKind || milestone.subjectId !== subjectId)) { setNotice('Choose a deadline with the same IA or EE type and subject.'); return; }
    void save({ ...plan, projects: [...plan.projects, { id: identifier('project'), kind: projectKind, title, subjectId, milestoneId: milestone?.id ?? null, researchQuestion: '', method: '', supervisorFeedback: '', bibliography: '' }] });
    setProjectTitle('');
    setProjectMilestone('');
  };
  const changeProject = (id: string, patch: Partial<Plan['projects'][number]>) => {
    setPlan((current) => ({ ...current, projects: current.projects.map((project) => project.id === id ? { ...project, ...patch } : project) }));
  };
  const saveProject = (id: string) => {
    const latest = normaliseIbStudyPlan(plan);
    if (!latest?.projects.some((project) => project.id === id)) return;
    void save(latest);
  };
  if (blocked) return <section className="ib-plan-shell"><h1>IB Diploma workspace</h1><p role="alert">{notice}</p></section>;

  return <>
    <Helmet><title>IB Diploma workspace | VertexED</title><meta name="robots" content="noindex, follow" /></Helmet>
    <div className="ib-plan-shell">
      <header className="ib-plan-hero"><div><p className="ib-plan-kicker">IB Diploma / your revision trace</p><h1>Keep every course and deadline in view.</h1><p>Set your HL and SL subjects, record targets you chose, and keep IA, EE and paper milestones beside the study tools you use. Targets are not predicted grades.</p></div><Link to="/exam-prep" className="ib-plan-link">Open exam preparation</Link></header>
      {notice && <p className="ib-plan-notice" role="status">{notice}</p>}
      <section className="ib-plan-summary" aria-label="IB plan summary"><div><strong>{summary?.subjectCount ?? 0}</strong><span>subjects set</span></div><div><strong>{summary?.openMilestones ?? 0}</strong><span>open milestones</span></div><div><strong>{summary?.completedMilestones ?? 0}</strong><span>marked complete</span></div><div><strong>{summary?.projectCount ?? 0}</strong><span>IA / EE workspaces</span></div></section>
      <div className="ib-plan-grid">
        <section className="ib-plan-paper" aria-labelledby="ib-subjects"><p className="ib-plan-kicker">01 / subjects</p><h2 id="ib-subjects">HL and SL courses</h2><p className="ib-plan-copy">Add the courses you are actually taking. A target stays separate from measured or predicted performance.</p>
          <form className="ib-plan-form" onSubmit={addSubject}><label>Subject<input value={subjectName} maxLength={80} onChange={(event) => setSubjectName(event.target.value)} placeholder="For example, Biology" /></label><label>Level<select value={subjectLevel} onChange={(event) => setSubjectLevel(event.target.value as 'HL' | 'SL')}><option>HL</option><option>SL</option></select></label><button type="submit"><Plus aria-hidden /> Add subject</button></form>
          {plan.subjects.length === 0 ? <p className="ib-plan-empty">No subjects yet. Add the courses you are taking to link paper milestones and study routes.</p> : <ul className="ib-subject-list">{plan.subjects.map((subject) => <li key={subject.id}><div><strong>{subject.name}</strong><span>{subject.level}</span></div><label>Target grade <select aria-label={`Target grade for ${subject.name}`} value={subject.targetGrade ?? ''} onChange={(event) => void save({ ...plan, subjects: plan.subjects.map((item) => item.id === subject.id ? { ...item, targetGrade: event.target.value ? Number(event.target.value) : null } : item) })}><option value="">Not set</option>{[1, 2, 3, 4, 5, 6, 7].map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></label><button type="button" aria-label={`Remove ${subject.name}`} onClick={() => void save({ ...plan, subjects: plan.subjects.filter((item) => item.id !== subject.id), milestones: plan.milestones.filter((milestone) => milestone.subjectId !== subject.id) })}><Trash2 aria-hidden /></button></li>)}</ul>}
        </section>
        <section className="ib-plan-paper" aria-labelledby="ib-milestones"><p className="ib-plan-kicker">02 / deadlines</p><h2 id="ib-milestones">IA, EE and paper milestones</h2><p className="ib-plan-copy">Record the deadline your school gave you. VertexED does not invent due dates or claim that a completion is assessed work.</p>
          <form className="ib-plan-form ib-milestone-form" onSubmit={addMilestone}><label>Milestone<input value={milestoneTitle} maxLength={140} onChange={(event) => setMilestoneTitle(event.target.value)} placeholder="For example, IA first draft" /></label><label>Type<select value={milestoneKind} onChange={(event) => setMilestoneKind(event.target.value as Milestone['kind'])}>{['IA', 'EE', 'Paper 1', 'Paper 2', 'Paper 3', 'Other'].map((kind) => <option key={kind}>{kind}</option>)}</select></label><label>Subject<select disabled={milestoneKind === 'EE'} value={milestoneSubject} onChange={(event) => setMilestoneSubject(event.target.value)}><option value="">No subject</option>{plan.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.level})</option>)}</select></label><label>Deadline<input type="date" min={today()} value={milestoneDate} onChange={(event) => setMilestoneDate(event.target.value)} /></label><button type="submit"><CalendarClock aria-hidden /> Add deadline</button></form>
          {plan.milestones.length === 0 ? <p className="ib-plan-empty">No milestones yet. Add a genuine deadline to make this workspace useful.</p> : <ol className="ib-milestone-list">{[...plan.milestones].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((milestone) => <li key={milestone.id}><button type="button" className={milestone.status === 'completed' ? 'is-complete' : ''} aria-pressed={milestone.status === 'completed'} aria-label={`Mark ${milestone.title} ${milestone.status === 'completed' ? 'not complete' : 'complete'}`} onClick={() => void save({ ...plan, milestones: plan.milestones.map((item) => item.id === milestone.id ? { ...item, status: item.status === 'completed' ? 'in-progress' : 'completed' } : item) })}><Check aria-hidden /></button><div><strong>{milestone.title}</strong><span>{milestone.kind} · {plan.subjects.find((subject) => subject.id === milestone.subjectId)?.name ?? 'Core / no subject'} · {milestone.dueDate}</span></div><button type="button" aria-label={`Remove ${milestone.title}`} onClick={() => void save({ ...plan, milestones: plan.milestones.filter((item) => item.id !== milestone.id) })}><Trash2 aria-hidden /></button></li>)}</ol>}
        </section>
      </div>
      <section className="ib-plan-paper ib-projects" aria-labelledby="ib-projects"><p className="ib-plan-kicker">03 / investigation and essay</p><h2 id="ib-projects">IA and Extended Essay workspace</h2><p className="ib-plan-copy">Keep a working question, method, source list and supervisor feedback together. This is your private planning record, not assessment feedback or a predicted grade.</p>
        <form className="ib-plan-form ib-project-form" onSubmit={addProject}><label>Workspace title<input value={projectTitle} maxLength={120} onChange={(event) => setProjectTitle(event.target.value)} placeholder="For example, enzyme IA investigation" /></label><label>Type<select value={projectKind} onChange={(event) => { setProjectKind(event.target.value as 'IA' | 'EE'); setProjectMilestone(''); }}><option>IA</option><option>EE</option></select></label><label>Subject<select disabled={projectKind === 'EE'} value={projectSubject} onChange={(event) => { setProjectSubject(event.target.value); setProjectMilestone(''); }}><option value="">Choose subject</option>{plan.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.level})</option>)}</select></label><label>Link deadline<select value={projectMilestone} onChange={(event) => setProjectMilestone(event.target.value)}><option value="">No deadline linked</option>{plan.milestones.filter((milestone) => milestone.kind === projectKind && milestone.subjectId === (projectKind === 'IA' ? projectSubject || null : null)).map((milestone) => <option key={milestone.id} value={milestone.id}>{milestone.title} · {milestone.dueDate}</option>)}</select></label><button type="submit"><Plus aria-hidden /> Add workspace</button></form>
        {plan.projects.length === 0 ? <p className="ib-plan-empty">No IA or EE workspaces yet. Add a working title when you are ready to keep project notes in one place.</p> : <div className="ib-project-list">{plan.projects.map((project) => <details key={project.id} className="ib-project"><summary><span><strong>{project.title}</strong><small>{project.kind} · {plan.subjects.find((subject) => subject.id === project.subjectId)?.name ?? 'Extended Essay'}</small></span><span className="ib-project-summary">Edit planning details</span></summary><div className="ib-project-fields"><label>Linked deadline<select value={project.milestoneId ?? ''} onChange={(event) => { const next = event.target.value || null; changeProject(project.id, { milestoneId: next }); const nextPlan = { ...plan, projects: plan.projects.map((item) => item.id === project.id ? { ...item, milestoneId: next } : item) }; void save(nextPlan); }}><option value="">No deadline linked</option>{plan.milestones.filter((milestone) => milestone.kind === project.kind && milestone.subjectId === project.subjectId).map((milestone) => <option key={milestone.id} value={milestone.id}>{milestone.title} · {milestone.dueDate}</option>)}</select></label><label>Working research question<textarea value={project.researchQuestion} maxLength={600} onChange={(event) => changeProject(project.id, { researchQuestion: event.target.value })} onBlur={() => saveProject(project.id)} placeholder="What are you investigating?" /></label><label>Method or next evidence step<textarea value={project.method} maxLength={600} onChange={(event) => changeProject(project.id, { method: event.target.value })} onBlur={() => saveProject(project.id)} placeholder="Describe your approach or next evidence step." /></label><label>Supervisor feedback<textarea value={project.supervisorFeedback} maxLength={1200} onChange={(event) => changeProject(project.id, { supervisorFeedback: event.target.value })} onBlur={() => saveProject(project.id)} placeholder="Record feedback in your own words and date it in the text if useful." /></label><label>Bibliography or source notes<textarea value={project.bibliography} maxLength={2000} onChange={(event) => changeProject(project.id, { bibliography: event.target.value })} onBlur={() => saveProject(project.id)} placeholder="Add source citations or reminders. Check your school citation requirements." /></label><div className="ib-project-actions"><button type="button" onClick={() => saveProject(project.id)}><Save aria-hidden /> Save planning details</button><button type="button" aria-label={`Remove ${project.title}`} onClick={() => void save({ ...plan, projects: plan.projects.filter((item) => item.id !== project.id) })}><Trash2 aria-hidden /> Remove workspace</button></div></div></details>)}</div>}
      </section>
      <section className="ib-plan-paper ib-plan-next" aria-labelledby="ib-next"><p className="ib-plan-kicker">04 / next fourteen days</p><h2 id="ib-next">Upcoming work</h2>{summary?.upcoming.length ? <ul>{summary.upcoming.map((milestone) => <li key={milestone.id}><strong>{milestone.dueDate}</strong><span>{milestone.title}</span></li>)}</ul> : <p className="ib-plan-empty">There are no incomplete milestones due in the next fourteen days.</p>}<div><Link to="/planner"><Save aria-hidden /> Add a study session in Planner</Link><Link to="/learn?tab=knowledge">Open subject practice</Link></div></section>
    </div>
  </>;
}
