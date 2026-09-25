import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import RichMarkdown from '@/components/RichMarkdown';
import { LEARNING_QUESTIONS, CONCEPT_GRAPH, CURRICULUM_CATALOG, PRACTICE_MODES, MISTAKE_CAUSES, buildKnowledgeModel, selectLearningQuestion } from '@/lib/learningModel.mjs';
import { answerLabel, classifyPracticeAnswer } from '@/lib/adaptivePractice.mjs';
import { readLearningState, saveLearningRecord, type PracticeAttempt, type PracticeMistake } from '@/lib/learningStore';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getPendingLearnerStateCount, initializeLearnerStateSync } from '@/lib/learnerStateSync';
import { storeApexPrefill } from '@/lib/apexPrefillStorage.mjs';
import '@/styles/learning-workspace.css';

type Question = typeof LEARNING_QUESTIONS[number];
type Response = { answer: string; confidence: number; hinted: boolean; seconds: number; flagged: boolean; submitted?: string };
type Session = { id: string; ids: string[]; index: number; mode: string; startedAt: number; deadline: number | null; finished: boolean; responses: Record<string, Response>; subject: string; topic: string; concept: string; curriculum: string };
const modeNames: Record<string, string> = { diagnostic: 'Diagnostic', targeted: 'Targeted weakness', mixed: 'Mixed review', exam: 'Exam simulation', rapid: 'Rapid recall', prerequisites: 'Prerequisite repair', challenge: 'Challenge' };
const emptyResponse = (): Response => ({ answer: '', confidence: 3, hinted: false, seconds: 0, flagged: false });
function readSession(): Session | null {
  const raw = localStorage.getItem(userContentStorageKeys().practiceSession);
  if (!raw) return null;
  const value = JSON.parse(raw);
  if (!value || typeof value.id !== 'string' || !Array.isArray(value.ids) || !value.ids.length || value.ids.length > 25
    || value.ids.some((id: string) => !LEARNING_QUESTIONS.some(q => q.id === id)) || !PRACTICE_MODES.includes(value.mode)
    || !Number.isInteger(value.index) || value.index < 0 || value.index >= value.ids.length
    || typeof value.finished !== 'boolean' || !Number.isFinite(value.startedAt)
    || (value.deadline !== null && !Number.isFinite(value.deadline)) || !value.responses || typeof value.responses !== 'object'
    || Object.values(value.responses).some((r: Response) => !r || typeof r.answer !== 'string' || r.answer.length > 200 || ![1,2,3,4,5].includes(r.confidence) || !Number.isFinite(r.seconds) || typeof r.hinted !== 'boolean' || typeof r.flagged !== 'boolean')) {
    throw new Error('Your saved session could not be read. Its original data is preserved. Export account data in Settings before recovery.');
  }
  return value;
}
export default function LearningWorkspace() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  return <Workspace key={`${user?.id || 'signed-out'}:${params.toString()}`} />;
}
function Workspace() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const selectedConcept = CONCEPT_GRAPH.find(n => n.id === params.get('concept'));
  const [subject, setSubject] = useState(selectedConcept?.subject || params.get('subject') || 'Mathematics');
  const [topic, setTopic] = useState('');
  const [concept, setConcept] = useState(selectedConcept?.id || '');
  const [curriculum, setCurriculum] = useState('');
  const [mode, setMode] = useState(PRACTICE_MODES.includes(params.get('mode') || '') ? params.get('mode')! : 'diagnostic');
  const [count, setCount] = useState(5);
  const [tab, setTab] = useState(params.get('tab') || 'practice');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [mistakes, setMistakes] = useState<PracticeMistake[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const [cause, setCause] = useState('unclassified');
  const [reflection, setReflection] = useState('');
  const [correction, setCorrection] = useState('');
  const refresh = () => { const state = readLearningState(); setAttempts(state.attempts); setMistakes(state.mistakes); };
  useEffect(() => {
    try { refresh(); setSession(readSession()); setReady(true); } catch (e) { setError((e as Error).message); }
    const onChange = () => { try { refresh(); } catch (e) { setError((e as Error).message); } };
    window.addEventListener('vertexed:learner-state-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => { window.removeEventListener('vertexed:learner-state-changed', onChange); window.removeEventListener('storage', onChange); };
  }, []);
  const sessionId = session?.id;
  const sessionFinished = session?.finished;
  useEffect(() => {
    if (!sessionId || sessionFinished) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === 'visible') setSession(s => {
        if (!s || s.finished) return s;
        const id = s.ids[s.index];
        const r = s.responses[id] || emptyResponse();
        if (r.submitted || (s.deadline && Date.now() >= s.deadline)) return s;
        return { ...s, responses: { ...s.responses, [id]: { ...r, seconds: Math.min(86400, r.seconds + 1) } } };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId, sessionFinished]);
  useEffect(() => {
    if (!ready || !session) return;
    try { localStorage.setItem(userContentStorageKeys().practiceSession, JSON.stringify(session)); }
    catch { setError('This session could not be saved on your device. Keep this page open and free browser storage before leaving.'); }
  }, [session, ready]);
  const model = useMemo(() => buildKnowledgeModel(attempts), [attempts]);
  const q = LEARNING_QUESTIONS.find(q => q.id === session?.ids[session.index]);
  const response = q && session ? session.responses[q.id] || emptyResponse() : emptyResponse();
  const result = q && response.submitted && (session?.mode !== 'exam' || session.finished) ? classifyPracticeAnswer(q, response.answer) : null;
  const expired = Boolean(session?.deadline && now >= session.deadline);
  const updateResponse = (patch: Partial<Response>) => setSession(s => !s || !q ? s : ({ ...s, responses: { ...s.responses, [q.id]: { ...(s.responses[q.id] || emptyResponse()), ...patch } } }));
  const start = (targetId = '', nextMode = mode) => {
    if (!ready) return;
    const target = LEARNING_QUESTIONS.find(q => q.id === targetId);
    const filters = target ? { subject: target.subject, topic: '', concept: '', curriculum: '' } : { subject, topic, concept, curriculum };
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const next = selectLearningQuestion({ ...filters, attempts, mode: nextMode, exclude: ids, targetId: i === 0 ? targetId : '' });
      if (next) ids.push(next.id);
    }
    if (!ids.length) { setNotice('No original question matches this scope. Choose another scope or use your course materials in Study notebook.'); return; }
    setSession({ id: crypto.randomUUID(), ids, index: 0, mode: nextMode, startedAt: Date.now(), deadline: nextMode === 'exam' ? Date.now() + ids.reduce((sum, id) => sum + LEARNING_QUESTIONS.find(q => q.id === id)!.estimatedSeconds * 1000, 0) : null, responses: {}, finished: false, ...filters });
    setTab('practice'); setNotice('Session saved on this device. Each submitted answer joins your practice history.'); setError('');
  };
  const submitOne = (question: Question, value: Response, current: Session) => {
    if (!value.answer.trim() || value.submitted) return value;
    const id = `attempt:${current.id}-${current.ids.indexOf(question.id)}`;
    saveLearningRecord('practice_attempt', { id, questionId: question.id, answer: value.answer, confidence: value.confidence, hinted: value.hinted, seconds: value.seconds, at: new Date().toISOString(), mode: current.mode });
    return { ...value, submitted: id };
  };
  const check = () => {
    if (!q || !session) return;
    try { updateResponse(submitOne(q, response, session)); refresh(); setNotice('Answer saved on this device. Account sync queued.'); }
    catch (e) { setError((e as Error).message); }
  };
  const finish = () => {
    if (!session) return;
    try {
      const responses = { ...session.responses };
      for (const id of session.ids) responses[id] = submitOne(LEARNING_QUESTIONS.find(q => q.id === id)!, responses[id] || emptyResponse(), session);
      setSession({ ...session, responses, finished: true }); refresh(); setNotice('Session finished. Results use one mark per original question, with no partial credit.');
    } catch (e) { setError((e as Error).message); }
  };
  const next = () => {
    if (!session) return;
    let ids = session.ids;
    if (session.mode === 'diagnostic' && session.index < ids.length - 1) {
      const nextQuestion = selectLearningQuestion({ ...session, attempts, exclude: ids.slice(0, session.index + 1) });
      if (nextQuestion) ids = [...ids.slice(0, session.index + 1), nextQuestion.id, ...ids.slice(session.index + 1).filter(id => id !== nextQuestion.id)].slice(0, ids.length);
    }
    setSession({ ...session, ids, index: Math.min(ids.length - 1, session.index + 1) }); setReflection(''); setCorrection(''); setCause('unclassified');
  };
  const saveMistake = () => {
    if (!q) return;
    try {
      const existing = mistakes.find(m => m.questionId === q.id);
      saveLearningRecord('practice_mistake', { id: existing?.id || `mistake:${crypto.randomUUID()}`, questionId: q.id, cause, reflection, correction, updatedAt: new Date().toISOString() });
      refresh(); setNotice('Mistake saved. Review timing follows later attempts on this question.');
    } catch (e) { setError((e as Error).message); }
  };
  const personalSubjects = Array.isArray(user?.user_metadata?.subjects) ? user.user_metadata.subjects : [];
  const subjects = [...new Set([...LEARNING_QUESTIONS.map(q => q.subject), ...personalSubjects])] as string[];
  const score = session?.ids.filter(id => session.responses[id]?.answer.trim() && classifyPracticeAnswer(LEARNING_QUESTIONS.find(q => q.id === id), session.responses[id].answer).correct).length || 0;
  return <div className="learning-workspace">
    <Helmet><title>Learn and practise | VertexED</title><meta name="robots" content="noindex" /></Helmet>
    <header className="learning-heading"><div><p className="dashboard-kicker">Attempt → feedback → return</p><h1>Your learning record</h1><p>Original questions, visible evidence, and a next step you can explain.</p></div><Link to="/main">Back to Today</Link></header>
    <nav className="learning-tabs" aria-label="Learning views">{['practice', 'knowledge', 'mistakes', 'progress'].map(name => <button key={name} aria-pressed={tab === name} onClick={() => setTab(name)}>{name === 'practice' ? 'Practise' : name[0].toUpperCase() + name.slice(1)}</button>)}</nav>
    {error && <p role="alert" className="learning-notice">{error}</p>}
    {notice && <p role="status" className="learning-notice">{notice}</p>}
    <p className="learning-meta">{getPendingLearnerStateCount() ? `${getPendingLearnerStateCount()} account updates pending. Device copies retained.` : 'Practice records are stored under your account on this device.'} <button onClick={() => void initializeLearnerStateSync().then(() => { refresh(); setNotice('Account sync checked. Pending items remain saved on this device.'); }).catch(() => setError('Account sync is unavailable. Device records are preserved.'))}>Retry account sync</button></p>
    {tab === 'practice' && <>
      <section className="learning-paper" aria-labelledby="practice-setup"><h2 id="practice-setup">Choose your next attempt</h2>
        <div className="learning-fields">
          <label>Curriculum scope<select value={curriculum} onChange={e => setCurriculum(e.target.value)}><option value="">General original bank</option>{CURRICULUM_CATALOG.map(c => <option key={c.id} value={c.bankLabel}>{c.label}</option>)}</select></label>
          <label>Subject<select value={subject} onChange={e => { setSubject(e.target.value); setTopic(''); setConcept(''); }}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Unit / topic<select value={topic} onChange={e => { setTopic(e.target.value); setConcept(''); }}><option value="">All available topics</option>{(Array.from(new Set(LEARNING_QUESTIONS.filter(q => q.subject === subject).map(q => q.topic))) as string[]).map(t => <option key={t}>{t}</option>)}</select></label>
          <label>Concept<select value={concept} onChange={e => setConcept(e.target.value)}><option value="">All concepts in scope</option>{CONCEPT_GRAPH.filter(n => n.subject === subject && (!topic || n.topic === topic)).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></label>
          <label>Practice mode<select value={mode} onChange={e => setMode(e.target.value)}>{PRACTICE_MODES.map(m => <option key={m} value={m}>{modeNames[m]}</option>)}</select></label>
          <label>Questions<select value={count} onChange={e => setCount(Number(e.target.value))}>{[3,5,10,20].map(n => <option key={n}>{n}</option>)}</select></label>
        </div><p>Limited original bank: {LEARNING_QUESTIONS.length} questions. This is not a complete syllabus, official paper or predicted grade. Fewer questions appear when your scope is narrow.</p>
        <button className="learning-primary" disabled={!ready || Boolean(session && !session.finished)} onClick={() => start(params.get('question') || '')}>Start practice</button>
        {session && !session.finished && <p>Resume the saved session below or finish it before starting another.</p>}
      </section>
      {session && <section className="learning-paper" aria-labelledby="active-question">
        <div className="learning-heading"><h2 id="active-question">{session.finished ? 'Session review' : modeNames[session.mode]} · {session.index + 1} / {session.ids.length}</h2>
          {session.deadline && <p role="timer" aria-label="Exam time remaining">{Math.max(0, Math.ceil((session.deadline - now) / 60000))} min remaining</p>}</div>
        {session.finished && <p role="status">{score} / {session.ids.length} marks. Unanswered questions receive zero. Hints and repeats remain visible in your evidence.</p>}
        {session.finished && <details><summary>Marks, timing and revision by topic</summary><div className="learning-table"><table><thead><tr><th>Topic</th><th>Marks</th><th>Time</th><th>Lost mark / next step</th></tr></thead><tbody>{session.ids.map(id => {
          const item = LEARNING_QUESTIONS.find(item => item.id === id)!;
          const saved = session.responses[id];
          const checked = saved?.answer.trim() ? classifyPracticeAnswer(item, saved.answer) : null;
          const reflection = mistakes.find(m => m.questionId === id);
          return <tr key={id}><td>{item.topic}</td><td>{checked?.correct ? 1 : 0} / 1</td><td>{saved?.seconds || 0}s</td><td>{checked?.correct ? 'Try a transfer question' : !checked ? 'Unanswered: revisit this topic' : reflection?.cause && reflection.cause !== 'unclassified' ? `${reflection.cause} (your reflection)` : checked.errorSubcategory?.replace(/_/g, ' ') || 'Cause not established'} <Link to={`/learn?concept=${encodeURIComponent(item.conceptIds[0])}`}>Revise</Link></td></tr>;
        })}</tbody></table></div></details>}

        {expired && !session.finished && <p role="status">Time is up. Answers are locked; finish to see your review.</p>}
        <nav className="learning-tabs" aria-label="Question navigation">{session.ids.map((id, i) => <button key={id} aria-current={session.index === i ? 'step' : undefined} disabled={session.mode !== 'exam' && !session.finished && i > session.index} onClick={() => setSession({ ...session, index: i })}>{i + 1}{session.responses[id]?.flagged ? ' ⚑' : ''}{session.responses[id]?.submitted ? ' ✓' : ''}</button>)}</nav>
        {q && <>
          <p className="learning-meta">{q.subject} · {q.topic} · {q.difficulty} · {q.marks} mark · Calculator {q.calculator} · {Math.ceil(q.estimatedSeconds / 60)} min suggested</p>
          <RichMarkdown>{q.prompt}</RichMarkdown>
          <fieldset disabled={Boolean(response.submitted) || session.finished || expired}><legend>Your attempt</legend>
            {q.type === 'multiple-choice' ? q.choices?.map((choice, i) => <label key={choice} className="learning-choice"><input type="radio" name={q.id} checked={response.answer === String(i)} onChange={() => updateResponse({ answer: String(i) })} /><RichMarkdown>{choice}</RichMarkdown></label>) : <label>Answer {q.units ? `(${q.units})` : ''}<input aria-label="Your answer" inputMode="decimal" value={response.answer} maxLength={200} onChange={e => updateResponse({ answer: e.target.value })} /></label>}
            <label>Confidence before feedback<select value={response.confidence} onChange={e => updateResponse({ confidence: Number(e.target.value) })}>{['Guessing', 'Unsure', 'Somewhat sure', 'Sure', 'Very sure'].map((label, i) => <option key={label} value={i + 1}>{label}</option>)}</select></label>
          </fieldset>
          <div className="learning-actions">
            <button aria-pressed={response.flagged} onClick={() => updateResponse({ flagged: !response.flagged })}>{response.flagged ? 'Unflag question' : 'Flag question'}</button>
            {session.mode !== 'exam' && !response.submitted && <button disabled={session.finished} onClick={() => updateResponse({ hinted: true })}>Show a hint</button>}
            {session.mode !== 'exam' && !response.submitted && <button className="learning-primary" disabled={!response.answer.trim() || session.finished} onClick={check}>Check answer</button>}
            {session.index < session.ids.length - 1 && <button disabled={session.mode !== 'exam' && !response.submitted && !session.finished} onClick={next}>Next question</button>}
            {!session.finished && <button onClick={finish}>Finish session</button>}
          </div>
          {response.hinted && <p className="learning-notice">Hint: {q.difficultyReason} Start by identifying {q.concepts[0]}. This attempt will be marked as assisted.</p>}
          {result && <div className="learning-feedback"><h3>{result.correct ? 'Correct' : 'Review this attempt'}</h3><p>{result.evidence}</p><p>{result.nextStep}</p><p>{response.seconds} seconds of visible-page time · Confidence {response.confidence}/5 · {response.hinted ? 'Hint used' : 'No hint used'}</p>
            <details><summary>Worked reasoning and answer</summary><ol>{q.solution.map(step => <li key={step}><RichMarkdown>{step}</RichMarkdown></li>)}</ol><RichMarkdown>{`Answer: ${answerLabel(q)}`}</RichMarkdown></details>
            <Link to="/chatbot" onClick={() => storeApexPrefill(window, user?.id, `Help me understand ${q.concepts.join(', ')}. I answered ${response.answer} to: ${q.prompt}. Ask me to explain my reasoning before giving another step.`)}>Discuss my reasoning with Apex</Link>
            {!result.correct && <details><summary>Save or update this mistake</summary><label>Error cause (your reflection)<select value={cause} onChange={e => setCause(e.target.value)}>{MISTAKE_CAUSES.map(c => <option key={c}>{c}</option>)}</select></label><label>Why I got it wrong<textarea maxLength={2000} value={reflection} onChange={e => setReflection(e.target.value)} /></label><label>Corrected reasoning<textarea maxLength={2000} value={correction} onChange={e => setCorrection(e.target.value)} /></label><button onClick={saveMistake}>Save mistake</button></details>}
          </div>}
          {session.finished && <div className="learning-actions"><button onClick={() => start('', session.mode)}>Start another session</button><button onClick={() => setTab('knowledge')}>See concept evidence</button><Link to="/main">See today's recommendations</Link></div>}
        </>}
      </section>}
    </>}
    {tab === 'knowledge' && <section className="learning-paper"><h2>Concepts and prerequisites</h2><p>Mastered means at least three recent correct, unassisted attempts across two questions and two days, with the latest correct. Weak means at least two recent errors making up half or more of recent attempts. These are practice rules, not validated learning measurements. Sparse bank coverage can prevent a mastered classification.</p>
      <label>Show subject<select value={subject} onChange={e => setSubject(e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
      <div className="learning-concepts">{model.filter(n => n.subject === subject).map(n => <article key={n.id}><span className={`learning-state state-${n.status}`}>{n.status}</span><h3>{n.label}</h3><p>{n.subject} → {n.unit} → {n.skill}</p><p>{n.explanation}</p><p>{n.lastAt ? `Last attempted ${new Date(n.lastAt).toLocaleDateString()}. ${n.reviewDue ? 'Review due.' : `Next review ${new Date(n.dueAt!).toLocaleDateString()}.`}` : 'Start with a diagnostic.'}</p>
        {n.prerequisites.length > 0 && <p>Prerequisites: {n.prerequisites.map(id => { const pre = model.find(p => p.id === id); return pre ? `${pre.label} (${pre.status})` : id; }).join(', ')}</p>}
        <button onClick={() => { setSubject(n.subject); setConcept(n.id); setTopic(''); setTab('practice'); }}>Practise this concept</button>
      </article>)}</div>
      {!model.some(n => n.subject === subject) && <p>No original-bank concepts for this subject yet. Use your notes and teacher feedback in <Link to="/study-notebook">Study notebook</Link>.</p>}
    </section>}
    {tab === 'mistakes' && <section className="learning-paper"><h2>Mistake bank</h2><p>Save an incorrect attempt to retain your explanation and corrected reasoning. Review intervals are a simple scheduling heuristic.</p>
      {!mistakes.length && <p>No saved mistakes. After checking an incorrect answer, choose “Save or update this mistake”.</p>}
      {mistakes.map(m => { const question = LEARNING_QUESTIONS.find(q => q.id === m.questionId)!; const retries = attempts.filter(a => a.questionId === m.questionId); const node = model.find(n => n.id === question.conceptIds[0]); return <article key={m.id} className="learning-mistake"><h3>{question.subject} · {question.topic}</h3><RichMarkdown>{question.prompt}</RichMarkdown><p>Cause: {m.cause}</p><p>{m.reflection || 'No reflection entered.'}</p><p>Corrected reasoning: {m.correction || 'Add your own reasoning after the next attempt.'}</p><p>{retries.length} recorded attempts · {retries.filter(a => a.correct).length} correct · {node?.reviewDue ? 'Review due' : node?.dueAt ? `Review ${new Date(node.dueAt).toLocaleDateString()}` : 'Not scheduled'}</p><button disabled={Boolean(session && !session.finished)} onClick={() => start(question.id, 'targeted')}>Retry this question</button></article>; })}
    </section>}
    {tab === 'progress' && <section className="learning-paper"><h2>What has changed</h2>{!attempts.length ? <p>No practice evidence yet. Complete a diagnostic to begin. Opening a lesson does not count as mastery.</p> : <><div className="learning-summary"><p><strong>{attempts.length}</strong> submitted attempts</p><p><strong>{attempts.filter(a => a.correct).length}</strong> correct answers</p><p><strong>{Math.round(attempts.reduce((n, a) => n + a.seconds, 0) / 60)}</strong> active-page minutes</p><p><strong>{model.filter(n => n.status === 'unassessed').length}</strong> unassessed bank concepts</p></div><p>Accuracy includes repeated questions. Active-page time is not verified attention. No predicted grade or exam-readiness percentage is inferred.</p><div className="learning-table"><table><caption>Recent practice evidence</caption><thead><tr><th>When</th><th>Topic</th><th>Difficulty</th><th>Result</th><th>Confidence</th><th>Support</th></tr></thead><tbody>{[...attempts].sort((a,b) => b.at.localeCompare(a.at)).slice(0, 30).map(a => { const question = LEARNING_QUESTIONS.find(q => q.id === a.questionId)!; return <tr key={a.id}><td>{new Date(a.at).toLocaleDateString()}</td><td>{question.topic}</td><td>{question.difficulty}</td><td>{a.correct ? 'Correct' : 'Incorrect'}</td><td>{a.confidence === null ? 'Not recorded' : `${a.confidence}/5`}</td><td>{a.hinted ? 'Hint used' : 'Unassisted'}</td></tr>; })}</tbody></table></div></>}</section>}
  </div>;
}
