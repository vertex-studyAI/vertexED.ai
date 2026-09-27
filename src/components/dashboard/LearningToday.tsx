import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { buildLearningPlan } from '@/lib/learningModel.mjs';
import { readLearningState } from '@/lib/learningStore';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { plannerStorageKeys } from '@/lib/plannerStorageScope.mjs';
import { normalizePlannerTasks, plannerDateToInput } from '@/lib/plannerTasks.mjs';
import { getCurriculumPreference } from '@/lib/curriculum';
import { getDueFlashcardCount } from '@/lib/srDeck';
import '@/styles/learning-workspace.css';
export default function LearningToday() {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(25);
  const [plan, setPlan] = useState<ReturnType<typeof buildLearningPlan> | null>(null);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    try { const saved = Number(localStorage.getItem(userContentStorageKeys().learningAvailability)); if (saved >= 5 && saved <= 480) setMinutes(saved); } catch { /* Defaults are an editable preference, never a claim of availability. */ }
    const refresh = () => setRevision(v => v + 1);
    window.addEventListener('focus', refresh); window.addEventListener('vertexed:learner-state-changed', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('vertexed:learner-state-changed', refresh); };
  }, [user?.id]);
  useEffect(() => {
    try {
      const pref = getCurriculumPreference(user);
      const tasks = normalizePlannerTasks(JSON.parse(localStorage.getItem(plannerStorageKeys().tasks) || '[]'));
      const exams = pref.examTargets.length ? pref.examTargets : pref.examDate ? pref.subjects.map(subject => ({ subject, date: pref.examDate })) : [];
      setPlan(buildLearningPlan({ attempts: readLearningState().attempts, subjects: pref.subjects, exams, minutes, dueCards: getDueFlashcardCount(),
        tasks: tasks.filter(task => task.taskKind !== 'commitment').map(task => ({ id: task.id, title: task['task name'], date: plannerDateToInput(task.date), minutes: task['task duration'], completed: task.completed === true })) }));
      setError('');
    } catch { setError('Your plan could not read some saved records. Original data is preserved. Open Settings to export it before recovery.'); }
  }, [minutes, user, revision]);
  return <section className="learning-today learning-paper" aria-labelledby="learning-today-title">
    <div className="learning-heading"><div><p className="dashboard-kicker">01 / Today’s revision</p><h2 id="learning-today-title">The next useful step</h2></div><Link to="/learn">Diagnostics and concept evidence</Link></div>
    <div className="desk-time-budget"><label className="learning-availability">Time available today<select value={minutes} onChange={e => { const value = Number(e.target.value); setMinutes(value); setSaveError(''); try { localStorage.setItem(userContentStorageKeys().learningAvailability, String(value)); } catch { setSaveError('Your time preference could not be saved on this device.'); } }}>{[5,10,15,25,45,60,90,120,180,240,480].map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label><p>Make a little room for the next attempt.<br />Your suggestions adjust to the time you have.</p></div>
    {saveError && <p role="status">{saveError}</p>}
    {error && <p role="alert">{error}</p>}
    {plan && !error && <><div className="desk-budget-summary"><span><strong>{plan.plannedMinutes} min</strong> suggested</span><span>{Math.max(0, minutes - plan.plannedMinutes)} min left open</span></div><div className="desk-budget-track" aria-hidden="true"><span style={{ width: `${Math.min(100, plan.plannedMinutes / minutes * 100)}%` }} /></div>
      {!plan.planned.length && <p>No complete task fits this time budget. Choose a shorter session or increase your available time.</p>}
      <ol className="learning-plan">{plan.planned.map((item, index) => <li key={item.id}><span className="desk-plan-number" aria-hidden>{String(index + 1).padStart(2, '0')}</span><div><Link to={item.to}>{item.title}</Link><p>{item.reason}</p></div><span className="desk-plan-duration">{item.minutes} min</span></li>)}</ol>
      <div className="learning-actions"><Link to="/study-zone?focus=timer">Start a focus session</Link><Link to="/planner">Edit commitments and deadlines</Link><Link to="/learn?tab=mistakes">Review mistakes</Link></div>
      {plan.backlog.length > 0 && <details><summary>{plan.backlog.length} items outside today's time budget</summary><ul>{plan.backlog.map(item => <li key={item.id}><Link to={item.to}>{item.title}</Link> · {item.minutes} min<p>{item.reason}</p></li>)}</ul></details>}
      <p className="learning-meta">Suggestions use your saved attempts, deadlines and due reviews. Choose any item. Completing a task does not establish mastery.</p>
    </>}
  </section>;
}
