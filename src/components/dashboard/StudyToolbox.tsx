import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BookOpen, Brain, CalendarDays, FileCheck2, FileText, GraduationCap, MessageCircle, Pin, Search, Target, Timer } from 'lucide-react';

const stages = ['All tools', 'Plan', 'Focus', 'Practise', 'Review', 'Remember'] as const;
const tools = [
  { id: 'practice', title: 'Adaptive practice', stage: 'Practise', description: 'Try a question, check your reasoning and find the next concept to revisit.', to: '/learn', icon: Target },
  { id: 'notebook', title: 'Study Notebook', stage: 'Remember', description: 'Keep your sources, questions and revision notes together.', to: '/study-notebook', icon: BookOpen },
  { id: 'planner', title: 'Study planner', stage: 'Plan', description: 'Make room for revision around classes and deadlines.', to: '/planner', icon: CalendarDays },
  { id: 'focus', title: 'Study Zone', stage: 'Focus', description: 'Set a timer and keep your working beside your session notes.', to: '/study-zone?focus=timer', icon: Timer },
  { id: 'mistakes', title: 'Mistake notebook', stage: 'Review', description: 'Return to saved mistakes and the reasoning you corrected.', to: '/learn?tab=mistakes', icon: FileCheck2 },
  { id: 'paper', title: 'Paper Maker', stage: 'Practise', description: 'Build a practice paper for your board, subject and topic.', to: '/paper-maker', icon: FileText },
  { id: 'review', title: 'Answer Reviewer', stage: 'Review', description: 'Get AI-suggested feedback to check against your course materials.', to: '/answer-reviewer', icon: FileCheck2 },
  { id: 'notes', title: 'Notes & flashcards', stage: 'Remember', description: 'Turn class material into notes, retrieval prompts and quizzes.', to: '/notetaker', icon: Brain },
  { id: 'exam', title: 'Exam Prep', stage: 'Plan', description: 'Build a session around your exam dates and due reviews.', to: '/exam-prep', icon: Target },
  { id: 'apex', title: 'Apex', stage: 'Practise', description: 'Talk through a difficult concept with the AI tutor.', to: '/chatbot', icon: MessageCircle },
  { id: 'modules', title: 'MYP learning modules', stage: 'Remember', description: 'Read a lesson, work through an example and try a retrieval question.', to: '/myp', icon: GraduationCap },
];

export default function StudyToolbox({ accountId }: { accountId?: string }) {
  const storageKey = accountId ? `vertexed:tool-pins:${encodeURIComponent(accountId)}` : null;
  const [pins, setPins] = useState<string[]>(() => {
    try {
      const saved: unknown = storageKey ? JSON.parse(localStorage.getItem(storageKey) || '[]') : [];
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string' && tools.some(tool => tool.id === id)) : [];
    } catch { return []; }
  });
  const [stage, setStage] = useState<string>('All tools');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [onlyPinned, setOnlyPinned] = useState(false);
  const pinFilterRef = useRef<HTMLButtonElement>(null);
  const filtered = tools.filter(tool =>
    (stage === 'All tools' || tool.stage === stage) &&
    (!onlyPinned || pins.includes(tool.id)) &&
    `${tool.title} ${tool.description} ${tool.stage}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  function togglePin(id: string, title: string) {
    if (onlyPinned && pins.includes(id)) pinFilterRef.current?.focus();
    const next = pins.includes(id) ? pins.filter(pin => pin !== id) : [...pins, id];
    setPins(next);
    try {
      if (!storageKey) throw new Error('No account');
      localStorage.setItem(storageKey, JSON.stringify(next));
      setMessage(`${title} ${next.includes(id) ? 'pinned' : 'unpinned'}. Saved on this device.`);
    } catch { setMessage('Your shortcuts changed for this visit, but could not be saved on this device.'); }
  }
  return <section className="desk-toolbox" aria-labelledby="study-tools-heading">
    <div className="dashboard-section-heading">
      <div><p className="dashboard-kicker">Your toolkit</p><h2 id="study-tools-heading">A place for every next step.</h2></div>
      <p className="desk-toolbox-note">Pin the tools you reach for most.<br />Shortcuts stay on this device.</p>
    </div>
    {pins.length > 0 && <nav className="desk-pinned" aria-label="Pinned study tools"><Pin size={16} aria-hidden /><span>Pinned</span>{tools.filter(tool => pins.includes(tool.id)).map(tool => <Link key={tool.id} to={tool.to}>{tool.title}<ArrowRight size={14} aria-hidden /></Link>)}</nav>}
    <div className="desk-tool-filters">
      <label className="desk-tool-search"><Search size={18} aria-hidden /><span className="sr-only">Find a study tool</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a tool or a task…" /></label>
      <button ref={pinFilterRef} type="button" className="desk-pin-filter" aria-pressed={onlyPinned} onClick={() => setOnlyPinned(value => !value)}><Pin size={16} aria-hidden />Pinned only</button>
    </div>
    <div className="desk-stage-filters" role="group" aria-label="Filter tools by study stage">{stages.map((item, index) => <button type="button" key={item} aria-pressed={stage === item} onClick={() => setStage(item)}>{index > 0 && <span aria-hidden>{String(index).padStart(2, '0')}</span>}{item}</button>)}</div>
    <p className="desk-tool-count" role="status">{filtered.length} tools to choose from{message && <span> · {message}</span>}</p>
    <div className="desk-tool-grid">{filtered.map(tool => {
      const Icon = tool.icon;
      const pinned = pins.includes(tool.id);
      return <article key={tool.id} className="desk-tool-card">
        <div className="desk-tool-card-top"><span className="desk-tool-icon"><Icon size={22} aria-hidden /></span><span className="desk-tool-stage">{tool.stage}</span><button type="button" aria-label={`${pinned ? 'Unpin' : 'Pin'} ${tool.title}`} aria-pressed={pinned} onClick={() => togglePin(tool.id, tool.title)}><Pin size={17} aria-hidden /></button></div>
        <h3><Link to={tool.to}>{tool.title}<ArrowRight size={18} aria-hidden /></Link></h3><p>{tool.description}</p>
      </article>;
    })}</div>
    {!filtered.length && <div className="desk-tools-empty"><h3>{onlyPinned && !pins.length ? 'Keep your favourite tools close.' : 'No tools match these filters.'}</h3><p>{onlyPinned && !pins.length ? 'Use the pin button beside any tool to add a shortcut here.' : 'Try another study stage or a shorter search.'}</p><button type="button" onClick={() => { setStage('All tools'); setQuery(''); setOnlyPinned(false); setMessage(''); }}>Show all tools</button></div>}
  </section>;
}
