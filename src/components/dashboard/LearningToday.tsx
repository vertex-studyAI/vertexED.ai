import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { parsePracticeSession } from '@/lib/practiceSession.mjs';
import { trackProductEvent } from '@/lib/productAnalytics.mjs';
import { buildLearningPlan } from '@/lib/learningModel.mjs';
import { readLearningState } from '@/lib/learningStore';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { plannerStorageKeys } from '@/lib/plannerStorageScope.mjs';
import { normalizePlannerTasks, plannerDateToInput } from '@/lib/plannerTasks.mjs';
import { getCurriculumPreference } from '@/lib/curriculum';
import { localDayKey } from '@/lib/studyDates.mjs';
import { getDueFlashcardCount } from '@/lib/srDeck';
import '@/styles/learning-workspace.css';
export default function LearningToday() {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(15);
  const [resume, setResume] = useState<ReturnType<typeof parsePracticeSession>>(null);
  const [assessments, setAssessments] = useState<Array<{ subject: string; date: string }>>([]);
  const [plan, setPlan] = useState<ReturnType<typeof buildLearningPlan> | null>(null);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    try { const saved = Number(localStorage.getItem(userContentStorageKeys().learningAvailability)); if (saved >= 5 && saved <= 480) setMinutes(saved); } catch { /* Defaults are an editable preference, never a claim of availability. */ }
    const refresh = () => setRevision(v => v + 1);
    window.addEventListener('storage', refresh); window.addEventListener('vertexed:practice-changed', refresh); window.addEventListener('focus', refresh); window.addEventListener('vertexed:learner-state-changed', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('vertexed:practice-changed', refresh); window.removeEventListener('focus', refresh); window.removeEventListener('vertexed:learner-state-changed', refresh); };
  }, [user?.id]);
  useEffect(() => {
    try {
      const pref = getCurriculumPreference(user);
      const tasks = normalizePlannerTasks(JSON.parse(localStorage.getItem(plannerStorageKeys().tasks) || '[]'));
      const exams = pref.examTargets.length ? pref.examTargets : pref.examDate ? pref.subjects.map(subject => ({ subject, date: pref.examDate })) : [];
      setResume(parsePracticeSession(localStorage.getItem(userContentStorageKeys().practiceSession)));
      setAssessments(exams.filter(e => e.date >= localDayKey()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3));
      setPlan(buildLearningPlan({ attempts: readLearningState().attempts, subjects: pref.subjects, exams, minutes, dueCards: getDueFlashcardCount(),
        tasks: tasks.filter(task => task.taskKind !== 'commitment').map(task => ({ id: task.id, title: task['task name'], date: plannerDateToInput(task.date), minutes: task['task duration'], completed: task.completed === true })) }));
      setError('');
    } catch { setError('Your plan could not read some saved records. Original data is preserved. Open Settings to export it before recovery.'); }
  }, [minutes, user, revision]);
  const chooseMinutes = (value: number) => {
    setMinutes(value); setSaveError('');
    trackProductEvent('Learning budget selected', { minutes: value });
    try { localStorage.setItem(userContentStorageKeys().learningAvailability, String(value)); }
    catch { setSaveError('Your time preference could not be saved on this device.'); }
  };
  return <section className="learning-today learning-paper" aria-labelledby="learning-today-title">
    <div className="learning-heading"><div><p className="dashboard-kicker">01 / Today’s revision</p><h2 id="learning-today-title">The next useful step</h2></div><Link to="/learn">Diagnostics and concept evidence</Link></div>
    <div className="learning-actions" role="group" aria-label="I have this much time">{[5,15,30,60].map(n => <button key={n} aria-pressed={minutes === n} onClick={() => chooseMinutes(n)}>{n} min</button>)}</div>
    <div className="desk-time-budget"><label className="learning-availability">Time available today<select value={minutes} onChange={e => chooseMinutes(Number(e.target.value))}>{[5,10,15,25,30,45,60,90,120,180,240,480].map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label><p>Estimated time includes an attempt and feedback.<br />You can stop or take longer whenever you need.</p></div>
    {saveError && <p role="status">{saveError}</p>}
    {error && <p role="alert">{error}</p>}
    {plan && !error && <>
      <div className="learning-continue">
        <p className="dashboard-kicker">{resume && !resume.finished ? 'Continue learning' : 'Start with this'}</p>
        <h3>{resume && !resume.finished ? resume.subject + ' · ' + (resume.topic || 'Practice') : plan.planned[0]?.title || 'Choose your next step'}</h3>
        <p>{resume && !resume.finished ? 'Your answers are saved. Return to question ' + (resume.index + 1) + ' of ' + resume.ids.length + '.' : plan.planned[0]?.reason}</p>
        {(resume && !resume.finished || plan.planned[0]) && <Link className="learning-start" to={resume && !resume.finished ? '/learn' : plan.planned[0].to} onClick={() => trackProductEvent('Learning next step opened', { resume: Boolean(resume && !resume.finished), minutes })}>{resume && !resume.finished ? 'Continue saved practice' : 'Start next step · ' + plan.planned[0].minutes + ' min'}</Link>}
      </div>
      <div className="desk-budget-summary"><span><strong>{plan.plannedMinutes} min</strong> suggested</span><span>{Math.max(0, minutes - plan.plannedMinutes)} min left open</span></div><div className="desk-budget-track" aria-hidden="true"><span style={{ width: `${Math.min(100, plan.plannedMinutes / minutes * 100)}%` }} /></div>
      {!plan.planned.length && <p>No complete task fits this time budget. Choose a shorter session or increase your available time.</p>}
      <ol className="learning-plan">{plan.planned.map((item, index) => <li key={item.id}><span className="desk-plan-number" aria-hidden>{String(index + 1).padStart(2, '0')}</span><div><Link to={item.to}>{item.title}</Link><p>{item.reason}</p></div><span className="desk-plan-duration">{item.minutes} min</span></li>)}</ol>
      <div className="learning-actions"><Link to="/learn?tab=knowledge">Inspect mastery and review dates</Link><Link to="/planner">Edit commitments and deadlines</Link><Link to="/learn?tab=mistakes">Review mistakes</Link></div>
      {plan.backlog.length > 0 && <details><summary>{plan.backlog.length} items outside today's time budget</summary><ul>{plan.backlog.map(item => <li key={item.id}><Link to={item.to}>{item.title}</Link> · {item.minutes} min<p>{item.reason}</p></li>)}</ul></details>}
      {plan.model.some(n => n.status === 'weak' || n.reviewDue) && <section aria-label="Needs attention"><h3>Needs attention</h3><ul>{plan.model.filter(n => n.status === 'weak' || n.reviewDue).slice(0, 3).map(n => <li key={n.id}><Link to={'/learn?tab=knowledge&concept=' + encodeURIComponent(n.id)}>{n.label}</Link> · {n.status === 'weak' ? 'Recent errors' : 'Review due'}</li>)}</ul></section>}
      {assessments.length > 0 && <section aria-label="Upcoming assessments"><h3>Upcoming assessments</h3><ul>{assessments.map(e => <li key={e.subject + e.date}>{e.subject} · {new Date(e.date + 'T12:00:00').toLocaleDateString()} · <Link to="/exam-prep">Prepare</Link></li>)}</ul><p className="learning-meta">Dates from your profile. No readiness prediction.</p></section>}
      <p className="learning-meta">Suggestions use your saved attempts, deadlines and due reviews. Choose any item. Completing a task does not establish mastery.</p>
    </>}
  </section>;
}
