import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import AccessibleModal from '@/components/AccessibleModal';
import RichMarkdown from '@/components/RichMarkdown';
import { COMPLEX_DEFINITIONS } from '@/content/complexNumbersPractice.mjs';
import ComplexPlane from './ComplexPlane';
import { LEARNING_QUESTIONS, buildKnowledgeModel } from '@/lib/learningModel.mjs';
import { prerequisitePath, reviewBucket } from '@/lib/learningJourney.mjs';
import type { PracticeAttempt } from '@/lib/learningStore';

type Node = ReturnType<typeof buildKnowledgeModel>[number];
const stateLabel = (node: Node) => node.status === 'unassessed' ? 'Not started' : node.reviewDue ? 'Needs review · ' + node.status : node.status;
export default function KnowledgeExplorer({ model, attempts, subject, subjects, onSubject, onPractice, initialConcept }: {
  model: Node[]; attempts: PracticeAttempt[]; subject: string; subjects: string[]; onSubject: (value: string) => void;
  onPractice: (node: Node) => void; initialConcept?: string;
}) {
  const [view, setView] = useState('Course');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(initialConcept || '');
  const [zoom, setZoom] = useState(1);
  const [highlight, setHighlight] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const subjectNodes = model.filter(n => n.subject === subject);
  const nodes = subjectNodes.filter(n => (n.label + ' ' + n.topic).toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || filter === 'Needs review' && n.reviewDue || filter === 'Weak' && n.status === 'weak' || filter === 'Not started' && !n.attempts));
  const path = useMemo(() => prerequisitePath(subjectNodes) as Node[], [subjectNodes]);
  const active = model.find(n => n.id === selected);
  const history = active ? attempts.filter(a => LEARNING_QUESTIONS.find(q => q.id === a.questionId)?.conceptIds.includes(active.id)).sort((a, b) => b.at.localeCompare(a.at)) : [];
  const inspect = (node: Node, button: HTMLButtonElement) => { opener.current = button; setSelected(node.id); setHighlight(node.id); };
  const row = (node: Node) => <li key={node.id} className="learning-skill-row"><button onClick={e => inspect(node, e.currentTarget)}><strong>{node.label}</strong><span className="learning-state">{stateLabel(node)}</span></button><p className="learning-meta">{node.explanation}</p></li>;
  return <section className="learning-paper">
    <h2>Concepts and prerequisites</h2>
    <p>Explore the available practice topics. This original bank is a small part of a course, not a complete syllabus.</p>
    <div className="learning-fields"><label>Show subject<select value={subject} onChange={e => { onSubject(e.target.value); setSelected(''); }}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label><label>Find a skill<input value={search} onChange={e => setSearch(e.target.value)} type="search" /></label><label>Evidence filter<select value={filter} onChange={e => setFilter(e.target.value)}>{['All', 'Needs review', 'Weak', 'Not started'].map(s => <option key={s}>{s}</option>)}</select></label></div>
    <div className="learning-tabs" aria-label="Concept views">{['Course', 'Path', 'Graph', 'Reviews'].map(v => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v}</button>)}</div>
    {!nodes.length && <p>No concepts match this scope. Change the filter or use your own materials in <Link to="/study-notebook">Study notebook</Link>.</p>}
    {view === 'Course' && [...new Set(nodes.map(n => n.topic))].map(topic => <details className="learning-unit" key={topic} open><summary>{topic} · {nodes.filter(n => n.topic === topic && n.attempts).length} / {nodes.filter(n => n.topic === topic).length} skills attempted</summary><ul>{nodes.filter(n => n.topic === topic).map(row)}</ul></details>)}
    {view === 'Path' && <><p>Prerequisites come first. This is a suggested sequence; every concept stays available.</p><ol className="learning-path">{path.filter(n => nodes.some(v => v.id === n.id)).map(n => <li key={n.id}><button onClick={e => inspect(n, e.currentTarget)}>{n.label} · {stateLabel(n)}</button><p className="learning-meta">{n.prerequisites.some(id => model.find(p => p.id === id)?.status === 'weak') ? 'A prerequisite has recent errors. Inspect it to choose a repair or study this concept anyway.' : n.attempts ? n.explanation : 'Try an attempt to find your starting point.'}</p></li>)}</ol></>}
    {view === 'Reviews' && <><p>Intervals come from your saved attempts. Missed reviews stay available; choose what fits today.</p>{['Overdue', 'Due today', 'Upcoming'].map(bucket => <section key={bucket}><h3>{bucket}</h3><ul>{nodes.filter(n => n.dueAt !== null && reviewBucket(n.dueAt) === bucket).map(row)}</ul>{!nodes.some(n => n.dueAt !== null && reviewBucket(n.dueAt) === bucket) && <p className="learning-meta">No reviews in this group.</p>}</section>)}</>}
    {view === 'Graph' && <>
      <p>Arrows point from prerequisite to dependent concept. Use search and evidence filters above. Select a node to highlight its immediate connections.</p>
      <div className="learning-actions"><button onClick={() => setZoom(z => Math.max(.75, z - .25))} disabled={zoom <= .75}>Zoom out</button><button onClick={() => setZoom(z => Math.min(2, z + .25))} disabled={zoom >= 2}>Zoom in</button><button onClick={() => { setZoom(1); setHighlight(''); viewport.current?.scrollTo(0, 0); }}>Reset view</button></div>
      <div className="learning-graph-scroll" tabIndex={0} ref={viewport} aria-label="Prerequisite graph; use arrow keys to pan" onKeyDown={e => { if (e.target !== e.currentTarget) return; const moves: Record<string, [number, number]> = { ArrowLeft: [-100, 0], ArrowRight: [100, 0], ArrowUp: [0, -100], ArrowDown: [0, 100] }; if (moves[e.key]) { e.preventDefault(); e.currentTarget.scrollBy(...moves[e.key]); } }}>
        <div className="learning-graph" style={{ width: 700 * zoom, minHeight: Math.max(180, nodes.length * 80) * zoom }}>
          <svg aria-hidden="true" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs><marker id="dependency-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="currentColor" /></marker></defs>
            {nodes.flatMap((n, i) => n.prerequisites.map(id => { const j = nodes.findIndex(p => p.id === id); return j < 0 ? null : <path key={id + n.id} d={'M ' + (330 * zoom) + ' ' + ((j * 80 + 30) * zoom) + ' C ' + (660 * zoom) + ' ' + ((j * 80 + 30) * zoom) + ', ' + (660 * zoom) + ' ' + ((i * 80 + 30) * zoom) + ', ' + (330 * zoom) + ' ' + ((i * 80 + 30) * zoom)} fill="none" stroke="currentColor" strokeWidth={highlight === id || highlight === n.id ? 3 : 1} opacity={highlight && highlight !== id && highlight !== n.id ? .25 : 1} markerEnd="url(#dependency-arrow)" />; }))}
          </svg>
          {nodes.map((n, i) => <button key={n.id} style={{ position: 'absolute', left: 16 * zoom, top: (i * 80 + 4) * zoom, width: 300 * zoom }} onClick={e => inspect(n, e.currentTarget)}>{n.label}<br /><small>{stateLabel(n)}</small></button>)}
        </div>
      </div>
    </>}
    <details><summary>How the evidence states work</summary><p>Mastered requires three recent correct unassisted attempts across at least two questions and two days, with the latest correct and unassisted. Weak means at least two errors comprising half or more of the last five attempts. These are transparent practice rules, not validated learning measurements. Sparse question coverage may prevent a mastered classification.</p></details>
    {active && <AccessibleModal titleId="skill-inspector-title" onClose={() => setSelected('')} openerRef={opener} overlayClassName="learning-rail-overlay" className="learning-workspace learning-paper learning-rail">
      <div className="learning-heading"><h2 id="skill-inspector-title">{active.label}</h2><button onClick={() => setSelected('')}>Close inspector</button></div>
      <p>{COMPLEX_DEFINITIONS[active.label] || 'Practise ' + active.label + ' through the original questions mapped below.'}</p>
      <p>{active.subject} → {active.topic} → {active.skill}</p><span className="learning-state">{stateLabel(active)}</span><p>{active.explanation}</p>
      <dl className="learning-evidence"><div><dt>Recorded accuracy</dt><dd>{active.accuracy === null ? 'No attempts' : Math.round(active.accuracy * 100) + '% on these questions'}</dd></div><div><dt>Help used</dt><dd>{history.filter(a => a.hinted).length} attempts</dd></div><div><dt>Review</dt><dd>{active.dueAt === null ? 'Not scheduled' : new Date(active.dueAt).toLocaleDateString()}</dd></div></dl>
      <h3>Prerequisites</h3>{active.prerequisites.length ? <ul>{active.prerequisites.map(id => { const pre = model.find(n => n.id === id); return pre && <li key={id}><button onClick={() => setSelected(id)}>{pre.label} · {stateLabel(pre)}</button></li>; })}</ul> : <p>No prerequisite is mapped in this bank.</p>}
      <div className="learning-actions"><button className="learning-primary" onClick={() => { onPractice(active); setSelected(''); }}>Practise this concept</button><Link to="/study-notebook">Learn from your notes</Link></div>
      <h3>Next concepts</h3><ul>{model.filter(n => n.prerequisites.includes(active.id)).map(n => <li key={n.id}><button onClick={() => setSelected(n.id)}>{n.label} · Study anyway</button></li>)}</ul>
      <h3>Recent evidence</h3>{!history.length && <p>No recorded attempts yet.</p>}<ol>{history.slice(0, 10).map(a => <li key={a.id}>{new Date(a.at).toLocaleString()} · {a.correct ? 'Correct' : 'Incorrect'} · {a.hinted ? 'Assisted' : 'Unassisted'}{a.confidence !== null ? ' · Confidence ' + a.confidence + '/5' : ''}</li>)}</ol>
      <details><summary>Example question and worked method</summary>{LEARNING_QUESTIONS.filter(q => q.conceptIds.includes(active.id)).slice(0, 1).map(q => <div key={q.id}><RichMarkdown>{q.prompt}</RichMarkdown>{q.solution.map(step => <RichMarkdown key={step}>{step}</RichMarkdown>)}</div>)}<p>Worked examples are help, not assessment evidence.</p></details>
      {active.topic === 'Complex numbers' && <ComplexPlane />}
    </AccessibleModal>}
  </section>;
}
