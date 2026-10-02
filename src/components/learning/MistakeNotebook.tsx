import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import AccessibleModal from '@/components/AccessibleModal';
import RichMarkdown from '@/components/RichMarkdown';
import { buildMistakeNotebook } from '@/lib/learningJourney.mjs';
import { MISTAKE_CAUSES, LEARNING_QUESTIONS } from '@/lib/learningModel.mjs';
import { answerLabel, classifyPracticeAnswer } from '@/lib/adaptivePractice.mjs';
import { saveLearningRecord, type PracticeAttempt, type PracticeMistake } from '@/lib/learningStore';

export default function MistakeNotebook({ attempts, mistakes, busy, onRepair, onSaved }: {
  attempts: PracticeAttempt[]; mistakes: PracticeMistake[]; busy: boolean;
  onRepair: (id: string) => void; onSaved: () => void;
}) {
  const rows = useMemo(() => buildMistakeNotebook(attempts, mistakes), [attempts, mistakes]);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState('');
  const [cause, setCause] = useState('unclassified');
  const [reflection, setReflection] = useState('');
  const [correction, setCorrection] = useState('');
  const [notice, setNotice] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);
  const active = rows.find(r => r.question.id === selected);
  const visible = rows.filter(r => filter === 'All' || (r.reflection?.cause || 'unclassified') === filter);
  const open = (row: typeof rows[number], button: HTMLButtonElement) => { opener.current = button; setSelected(row.question.id); setCause(row.reflection?.cause || 'unclassified'); setReflection(row.reflection?.reflection || ''); setCorrection(row.reflection?.correction || ''); setNotice(''); };
  return <section className="learning-paper"><h2>Mistake notebook</h2><p>Every recorded incorrect answer appears here. Add your own diagnosis; an answer pattern alone cannot establish why you made a mistake.</p>
    <label>Filter by your error category<select value={filter} onChange={e => setFilter(e.target.value)}>{['All', ...MISTAKE_CAUSES].map(c => <option key={c}>{c}</option>)}</select></label>
    {!rows.length && <p>No recorded mistakes yet. Complete a practice attempt to start building your record.</p>}
    {!!rows.length && !visible.length && <p>No mistakes match this category. Choose All to see your record.</p>}
    {visible.map(row => <article key={row.question.id} className="learning-mistake"><p className="learning-meta">{row.question.subject} · {row.question.topic}</p><h3>{row.question.concepts.join(', ')}</h3><p>{row.reflection?.cause || 'unclassified'} · {row.errors.length} incorrect attempt{row.errors.length === 1 ? '' : 's'} · {row.recovery}</p><p>{row.reflection?.reflection || classifyPracticeAnswer(row.question, row.lastError.answer).evidence}</p><p className="learning-meta">Last seen {new Date(row.lastError.at).toLocaleDateString()}</p><button onClick={e => open(row, e.currentTarget)}>Inspect mistake · {row.question.topic}</button></article>)}
    {active && <AccessibleModal titleId="mistake-inspector-title" onClose={() => setSelected('')} openerRef={opener} overlayClassName="learning-rail-overlay" className="learning-workspace learning-paper learning-rail">
      <div className="learning-heading"><h2 id="mistake-inspector-title">{active.question.topic} · Review and repair</h2><button onClick={() => setSelected('')}>Close inspector</button></div>
      <RichMarkdown>{active.question.prompt}</RichMarkdown><p>Your last incorrect response:</p><RichMarkdown>{active.question.type === 'multiple-choice' ? active.question.choices?.[Number(active.lastError.answer)] || active.lastError.answer : active.lastError.answer}</RichMarkdown>
      <details><summary>Correct response and worked method</summary><RichMarkdown>{answerLabel(active.question)}</RichMarkdown>{active.question.solution.map(s => <RichMarkdown key={s}>{s}</RichMarkdown>)}</details>
      <p>{classifyPracticeAnswer(active.question, active.lastError.answer).nextStep}</p><p className="learning-meta">Suggested feedback from the answer key; your reasoning may reveal a different cause.</p>
      <label>Error cause (your reflection)<select value={cause} onChange={e => setCause(e.target.value)}>{MISTAKE_CAUSES.map(c => <option key={c}>{c}</option>)}</select></label><label>Why I got it wrong<textarea maxLength={2000} value={reflection} onChange={e => setReflection(e.target.value)} /></label><label>Corrected reasoning<textarea maxLength={2000} value={correction} onChange={e => setCorrection(e.target.value)} /></label>
      <button onClick={() => { try { saveLearningRecord('practice_mistake', { id: active.reflection?.id || 'mistake:' + crypto.randomUUID(), questionId: active.question.id, cause, reflection, correction, updatedAt: new Date().toISOString() }); onSaved(); setNotice('Reflection saved on this device. Account sync queued.'); } catch (e) { setNotice((e as Error).message); } }}>Save reflection</button>{notice && <p role="status">{notice}</p>}
      <h3>Error history</h3><ul>{active.history.slice(-20).map(a => <li key={a.id}>{new Date(a.at).toLocaleString()} · {a.correct ? 'Correct' : 'Incorrect'} · {a.hinted ? 'Assisted' : 'Unassisted'}</li>)}</ul>
      <h3>Fix this weakness</h3><p>Review the method, explain your correction, then practise. A later retrieval attempt checks what you can do without help.</p>
      <p className="learning-meta">{LEARNING_QUESTIONS.some(q => q.id !== active.question.id && q.conceptIds.some(id => active.question.conceptIds.includes(id))) ? 'A related original question is available for transfer practice.' : 'No separate transfer question exists for this skill in the current bank. A retry repeats this question; use your course materials for a fresh problem.'}</p>
      <div className="learning-actions"><button className="learning-primary" disabled={busy} onClick={() => { onRepair(active.question.id); setSelected(''); }}>Start repair practice</button><Link to="/learn?tab=knowledge">See later reviews</Link><Link to="/planner">Schedule a retrieval check</Link></div>{busy && <p>Finish your active practice session before starting a repair.</p>}
    </AccessibleModal>}
  </section>;
}
