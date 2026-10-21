import { useEffect, useState } from 'react';
import type { z } from 'zod';
import { Link, useParams, useSearchParams } from 'react-router';
import PageSection from '@/components/PageSection';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { mergeFlashcardsIntoDeck } from '@/lib/srDeck';
import { resolveLocalStorage } from '@/lib/browserStorage.mjs';
import { learningLessonSchema } from '../../../contracts/learningLibrary.js';
import syllabusRegister from '@/content/syllabus-sources.json';
import { checkFoundationAnswer, emptyFoundationProgress, foundationManifestSchema, foundationProgressKey,
  loadFoundationLesson, loadFoundationManifest, readFoundationProgress, saveFoundationProgress, verifyFoundationBytes } from '@/lib/foundationLibrary.mjs';
import '@/styles/foundation-lessons.css';

type Manifest = z.infer<typeof foundationManifestSchema>;
type Entry = Manifest['entries'][number];
type Lesson = z.infer<typeof learningLessonSchema>;
type Progress = { version: number; bookmarked: boolean; answers: Record<string, string>; reviewed: string[]; updatedAt: string };

function download(name: string, body: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FoundationLessons() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const subject = params.get('subject') ?? '';
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loaded, setLoaded] = useState<{ entry: Entry; lesson: Lesson } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(''); setLoaded(null); setManifest(null);
    void loadFoundationManifest(controller.signal).then(async catalogue => {
      if (controller.signal.aborted) return;
      setManifest(catalogue);
      if (lessonId) {
        const entry = catalogue.entries.find(item => item.id === lessonId);
        if (!entry) throw new Error('This lesson is awaiting review or is not currently available.');
        const lesson = await loadFoundationLesson(entry, controller.signal);
        if (!controller.signal.aborted) setLoaded({ entry, lesson });
      }
    }).catch(problem => { if (!controller.signal.aborted) setError(problem instanceof Error ? problem.message : 'The library could not be loaded.'); });
    return () => controller.abort();
  }, [lessonId, retry]);
  const current = loaded?.entry.id === lessonId ? loaded : null;
  const entries = manifest?.entries.filter(entry => (!subject || entry.subject === subject) &&
    `${entry.subject} ${entry.unit} ${entry.topic}`.toLowerCase().includes(query.toLowerCase().trim())) ?? [];
  const updateFilter = (key: string, value: string) => setParams(previous => {
    const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next;
  }, { replace: true, preventScrollReset: true });
  return <PageSection className="foundation-library">
    <SEO title={`${current?.lesson.topic ?? 'Foundation lessons'} | VertexED`} robots="noindex, follow" />
    <Link to={lessonId ? '/resources/foundations' : '/resources'}>{lessonId ? 'Back to foundation lessons' : 'Back to learning library'}</Link>
    {error ? <section role="alert"><h1>Lesson unavailable</h1><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>Try loading again</button></section>
      : !manifest || (lessonId && !current) ? <p role="status">Loading study material…</p>
      : current ? <LessonWorkspace key={`${user?.id ?? 'visitor'}:${current.entry.contentHash}`} {...current} owner={user?.id ?? null} />
      : <>
        <header><p className="foundation-eyebrow">Read. Attempt. Review.</p><h1>Foundation lessons</h1>
          <p>Original notes, worked examples, recall cards and practice. These shared foundations are not a complete syllabus or a claim of board-specific alignment.</p></header>
        <div className="foundation-filters">
          <label>Search foundation lessons<input type="search" value={query} onChange={event => updateFilter('q', event.target.value)} /></label>
          <label>Subject<select aria-label="Subject" value={subject} onChange={event => updateFilter('subject', event.target.value)}><option value="">All subjects</option>
            {[...new Set<string>(manifest.entries.map(entry => String(entry.subject)))].sort().map(name => <option key={name}>{name}</option>)}</select></label>
        </div>
        <p role="status">{entries.length} available {entries.length === 1 ? 'lesson' : 'lessons'}</p>
        {!manifest.entries.length ? <section><h2>Lessons are awaiting subject review</h2><p>No foundation lessons are approved for student access yet. Drafts are not included in these results.</p><Link to="/study-notebook">Study from your own approved sources in Study Notebook</Link></section>
          : !entries.length ? <p>No lesson matches these filters. Change the subject or search text.</p>
          : <div className="foundation-results">{entries.map(entry => <Link key={entry.id} to={`/resources/foundations/${entry.id}`}>
            <span>{entry.subject} · {entry.unit}</span><h2>{entry.topic}</h2><p>{entry.flashcardCount} recall cards · {entry.questionCount} practice questions</p><strong>Open lesson</strong></Link>)}</div>}
      </>}
  </PageSection>;
}

function LessonWorkspace({ entry, lesson, owner }: { entry: Entry; lesson: Lesson; owner: string | null }) {
  const key = owner ? foundationProgressKey(owner, entry) : null;
  const [initial] = useState(() => key ? readFoundationProgress(resolveLocalStorage(window), key) : { raw: null, value: emptyFoundationProgress(), error: null });
  const [progress, setProgress] = useState<Progress>(initial.value);
  const [raw, setRaw] = useState<string | null>(initial.raw);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(initial.error ?? '');
  const [dirty, setDirty] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('notes');
  const [jumpTarget, setJumpTarget] = useState('');
  function jump(tab: string, target: string) { setActiveTab(tab); setJumpTarget(target); }
  // Radix mounts inactive panels lazily. Focus from the destination's committed
  // ref, not a parent effect that may run before the panel has entered the DOM.
  function focusDestination(node: HTMLHeadingElement | null) {
    if (node?.id === jumpTarget) { node.focus(); setJumpTarget(''); }
  }
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    const guardLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (dirty && link && !link.hasAttribute('download') && !link.getAttribute('href')?.startsWith('#') && !window.confirm('Your latest answers are not saved. Leave this lesson without saving?')) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', guard); document.addEventListener('click', guardLink, true);
    return () => { window.removeEventListener('beforeunload', guard); document.removeEventListener('click', guardLink, true); };
  }, [dirty]);
  function change(patch: Partial<Progress>) { setProgress(value => ({ ...value, ...patch, updatedAt: new Date().toISOString() })); setDirty(true); setNotice('Unsaved changes. Save on this device or export your answers.'); }
  function assertOwner() { if (!owner || getUserContentStorageScope() !== owner) throw new Error('Sign in and wait for your account to finish loading before saving.'); }
  function save() {
    try {
      assertOwner(); if (initial.error) throw new Error(initial.error);
      setRaw(saveFoundationProgress(resolveLocalStorage(window), key, progress, raw)); setDirty(false); setError(''); setNotice('Saved on this device for this account and lesson revision. Not synced to other devices.');
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Your work was not saved.'); }
  }
  async function exportMarkdown() {
    try {
      // Recheck publication on every download; no cached draft body is exported as an approved file.
      const catalogue = await loadFoundationManifest(undefined);
      const fresh = catalogue.entries.find(item => item.id === entry.id && item.contentHash === entry.contentHash);
      if (!fresh?.markdown) throw new Error('This Markdown export is not currently approved.');
      const response = await fetch(fresh.markdown, { cache: 'no-store' });
      if (!response.ok) throw new Error('The export is unavailable. Try reloading the lesson.');
      const body = await response.text(); await verifyFoundationBytes(body, fresh.markdownHash);
      download(`${lesson.id}.md`, body, 'text/markdown');
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Export failed.'); }
  }
  return <>
    <header><p className="foundation-eyebrow">{lesson.subject} / {lesson.unit}</p><h1>{lesson.topic}</h1><p>{lesson.scope}</p>
      <p className="foundation-meta">Revision {lesson.revision} · Practice marks are editorial, not official exam marks. Self-review does not establish mastery.</p></header>
    <div className="foundation-toolbar">
      <button aria-pressed={progress.bookmarked} onClick={() => change({ bookmarked: !progress.bookmarked })}>{progress.bookmarked ? 'Bookmarked' : 'Bookmark lesson'}</button>
      <button className="foundation-save" onClick={save} disabled={!owner || Boolean(initial.error)}>Save on this device</button>
      <button onClick={() => download(`${lesson.id}-my-work.json`, JSON.stringify({ lessonId: lesson.id, revision: lesson.revision, contentHash: entry.contentHash, ...progress }, null, 2))}>Export my answers</button>
      {entry.markdown && <button onClick={() => void exportMarkdown()}>Download lesson Markdown</button>}
    </div>
    {!owner && <p><Link to="/auth">Sign in</Link> to save on this device. You can practise and export answers without signing in.</p>}
    <p role="status">{notice || (initial.raw ? 'Restored your saved work for this lesson revision.' : 'No work saved for this lesson revision.')}</p>
    {error && <p role="alert">{error}</p>}
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList aria-label="Lesson study stages" className="foundation-tabs"><TabsTrigger value="notes">Notes</TabsTrigger>{lesson.teachingSequence && <TabsTrigger value="learn">Guided study</TabsTrigger>}<TabsTrigger value="cards">Flashcards</TabsTrigger><TabsTrigger value="practice">Practise</TabsTrigger><TabsTrigger value="revision">Revise</TabsTrigger></TabsList>
      {lesson.teachingSequence && <TabsContent value="learn"><h2>Guided teaching sequence</h2><p>A suggested route through this lesson. Follow the references, attempt the questions and explain your reasoning. Following a step does not record mastery.</p>
        {lesson.teachingSequence.map((step, index) => <section key={step.title}><h3>{index + 1}. {step.title}</h3><p>{step.guidance}</p>
          <div className="foundation-study-links">{step.noteHeadings.map(heading => <button key={heading} onClick={() => jump('notes', `note-${lesson.notes.findIndex(note => note.heading === heading)}`)}>Read: {heading}</button>)}
            {step.workedExampleNumbers.map(number => <button key={number} onClick={() => jump('notes', `example-${number}`)}>Worked example {number}</button>)}
            {step.questionIds.map(id => <button key={id} onClick={() => jump('practice', `question-${id}`)}>Practise question {lesson.questions.findIndex(question => question.id === id) + 1}</button>)}</div>
        </section>)}
      </TabsContent>}
      <TabsContent value="notes">
        <section><h2>Before you begin</h2><ul>{lesson.prerequisites.map(item => <li key={item}>{item}</li>)}</ul><h3>Learning objectives</h3><ul>{lesson.objectives.map(item => <li key={item}>{item}</li>)}</ul></section>
        {!!lesson.syllabusMappings?.length && <section><h2>Partial syllabus links</h2><p>These links identify supporting skills or selected syllabus points, not complete course coverage or independent subject approval.</p>
          {lesson.syllabusMappings.map(mapping => {
            const source = syllabusRegister.sources.find(source => source.id === mapping.sourceId);
            return <details key={`${mapping.sourceId}:${mapping.point}`}><summary>{source?.specification ?? mapping.sourceId}: {mapping.point}</summary>
              {source && <><p><a href={source.url} target="_blank" rel="noopener noreferrer">Official source: {source.board}</a></p><p>{source.version}. Location: {source.locator}.</p><p>{source.limitations}</p></>}
              <p>{mapping.tier}</p><p>Remaining work:</p><ul>{mapping.remaining.map(gap => <li key={gap}>{gap}</li>)}</ul></details>;
          })}
        </section>}
        {lesson.notes.map((section, index) => <section key={section.heading}><h2 ref={focusDestination} id={`note-${index}`} tabIndex={-1}>{section.heading}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>)}
        {lesson.diagrams?.map(diagram => <figure className="foundation-diagram" key={diagram.id} aria-labelledby={`diagram-${diagram.id}`}>
          <figcaption><h2 id={`diagram-${diagram.id}`}>{diagram.title}</h2><p>{diagram.description}</p></figcaption>
          <ol>{diagram.steps.map((step, index) => <li key={step.label}><div className="foundation-diagram-node"><strong>{step.label}</strong><p>{step.detail}</p></div>
            {diagram.links[index] && <div className="foundation-diagram-link"><svg aria-hidden="true" focusable="false" width="24" height="32" viewBox="0 0 24 32"><path d="M12 2v26M5 21l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" /></svg><span>{diagram.links[index]}</span></div>}</li>)}</ol>
        </figure>)}
        <section><h2>Worked examples</h2>{lesson.workedExamples.map((example, index) => <article key={index}><h3 ref={focusDestination} id={`example-${index + 1}`} tabIndex={-1}>Example {index + 1}</h3><p>{example.prompt}</p><ol>{example.steps.map((step, i) => <li key={i}>{step}</li>)}</ol><p><strong>Answer:</strong> {example.answer}</p></article>)}</section>
        <section><h2>Common misconceptions</h2>{lesson.misconceptions.map(item => <article key={item.claim}><h3>{item.claim}</h3><p>{item.correction}</p></article>)}</section>
      </TabsContent>
      <TabsContent value="cards"><h2>Recall before revealing</h2><p>Try each prompt without looking. Revealing a card is not a graded attempt.</p>
        <button disabled={!owner} onClick={() => { try { assertOwner(); const count = mergeFlashcardsIntoDeck(lesson.flashcards, `foundation-${lesson.id}-${entry.contentHash.slice(7, 19)}`); setNotice(`${count} new cards saved to your device review deck.`); setError(''); } catch (problem) { setError(problem instanceof Error ? problem.message : 'Cards were not saved.'); } }}>Add cards to review deck</button>
        {lesson.flashcards.map(card => <article key={card.id}><h3>{card.front}</h3><button aria-expanded={!!revealed[card.id]} onClick={() => setRevealed(value => ({ ...value, [card.id]: !value[card.id] }))}>{revealed[card.id] ? 'Hide answer' : 'Reveal answer'}</button>{revealed[card.id] && <p>{card.back}</p>}</article>)}
      </TabsContent>
      <TabsContent value="practice"><h2>Attempt, then review</h2><p>Checks compare MCQs and numeric values with the practice key. Written reasoning needs self-review; no full marks or mastery score is assigned.</p>
        {lesson.questions.map((question, index) => <article key={question.id}><h3 ref={focusDestination} id={`question-${question.id}`} tabIndex={-1}>Question {index + 1}</h3><p className="foundation-meta">{question.difficulty} · {question.marks} practice marks · Calculator: {question.calculator.replaceAll('-', ' ')}</p><p>{question.prompt}</p>
          <label>Your answer to question {index + 1}{question.type === 'mcq' ? <select aria-label={`Your answer to question ${index + 1}`} value={progress.answers[question.id] ?? ''} onChange={event => { change({ answers: { ...progress.answers, [question.id]: event.target.value } }); setFeedback(value => ({ ...value, [question.id]: '' })); }}><option value="">Choose an answer</option>{question.options?.map(option => <option key={option}>{option}</option>)}</select>
            : <textarea aria-label={`Your answer to question ${index + 1}`} rows={3} maxLength={20000} value={progress.answers[question.id] ?? ''} onChange={event => { change({ answers: { ...progress.answers, [question.id]: event.target.value } }); setFeedback(value => ({ ...value, [question.id]: '' })); }} />}</label>
          <button onClick={() => setFeedback(value => ({ ...value, [question.id]: checkFoundationAnswer(question, progress.answers[question.id] ?? '').message }))}>Check question {index + 1}</button>
          {feedback[question.id] && <p role="status">{feedback[question.id]}</p>}
          <details><summary>Solution and marking points</summary><p>{question.answer}</p><ol>{question.solution.map((step, i) => <li key={i}>{step}</li>)}</ol><h4>One practice mark per point</h4><ul>{question.markingPoints.map((point, i) => <li key={i}>{point}</li>)}</ul></details>
        </article>)}
      </TabsContent>
      <TabsContent value="revision">
        {lesson.revisionGuide && <section><h2>Revision guide</h2><p>{lesson.revisionGuide.summary}</p><h3>Key ideas</h3><ul>{lesson.revisionGuide.keyIdeas.map(idea => <li key={idea}>{idea}</li>)}</ul>
          {lesson.revisionGuide.formulas.length > 0 && <><h3>Formula sheet and conditions</h3><dl className="foundation-formulas">{lesson.revisionGuide.formulas.map(formula => <div key={formula.expression}><dt>{formula.expression}</dt><dd>{formula.meaning}<br /><strong>Conditions:</strong> {formula.conditions}</dd></div>)}</dl></>}
          <h3>Retrieve without looking</h3><ol>{lesson.revisionGuide.recallPrompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ol>
          <h3>Mixed practice</h3><div className="foundation-study-links">{lesson.revisionGuide.practiceQuestionIds.map(id => <button key={id} onClick={() => jump('practice', `question-${id}`)}>Retry question {lesson.questions.findIndex(question => question.id === id) + 1}</button>)}</div><p>{lesson.revisionGuide.revisit}</p>
        </section>}
        <h2>Revision checklist</h2><p>Record what you have reviewed. These checks are self-reported, not measured mastery.</p>{lesson.revisionChecklist.map((item, index) => <label className="foundation-check" key={item}><input type="checkbox" checked={progress.reviewed.includes(String(index))} onChange={event => change({ reviewed: event.target.checked ? [...progress.reviewed, String(index)] : progress.reviewed.filter(id => id !== String(index)) })} />{item}</label>)}<p>{progress.reviewed.length} of {lesson.revisionChecklist.length} checklist items reviewed.</p></TabsContent>
    </Tabs>
  </>;
}
