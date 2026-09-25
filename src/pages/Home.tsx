import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, ChevronRight, CircleDot, Play, Search, Sparkles, X } from 'lucide-react';
import SEO from '@/components/SEO';
import AccessibleModal from '@/components/AccessibleModal';
import LandingInk from '@/components/LandingInk';
import RevisionStack from '@/components/RevisionStack';
import ConceptLens from '@/components/ConceptLens';
import RevisionHero from '@/components/landing/RevisionHero';
import StudyGallery from '@/components/landing/StudyGallery';
import { useAuth } from '@/contexts/AuthContext';
import { useLandingMotion } from '@/hooks/useLandingMotion';
import { MYP5_SUBJECTS, topicSlug } from '@/content/myp5';
import '@/styles/vertex-home.css';

const learningStages = [
  { name: 'Learn', code: '01', title: 'Meet the idea in context.', copy: 'Read a focused explanation, connect definitions and inspect a worked method before attempting it alone.', sample: ['Concept', 'A function maps each input to one output.', 'Connect definition to graph'] },
  { name: 'Practise', code: '02', title: 'Make the first attempt.', copy: 'Move from short checks to unfamiliar, criterion-linked questions with your own working visible.', sample: ['Attempt', 'f(x) = 2x + 3. Find f(4).', 'Your working stays central'] },
  { name: 'Review', code: '03', title: 'Interrogate the reasoning.', copy: 'Compare your method with a worked solution and locate the first step where the logic changed.', sample: ['Review', '2(4) + 3 = 11', 'Method correct. Check notation.'] },
  { name: 'Diagnose', code: '04', title: 'Name the exact gap.', copy: 'Separate a knowledge gap from a command-term, calculation or communication error.', sample: ['Diagnosis', 'Not a formula error', 'Function notation needs attention'] },
  { name: 'Revise', code: '05', title: 'Return with a smaller target.', copy: 'Open the relevant concept, try a short retrieval prompt and schedule the difficult step again.', sample: ['Retry', 'Explain what f(4) means.', 'Due next study block'] },
  { name: 'Master', code: '06', title: 'Transfer without the scaffold.', copy: 'Demonstrate the same idea in a new context and use the checklist to judge what is secure.', sample: ['Transfer', 'Model a taxi fare with f(x).', 'Explain every variable'] },
];

const aiTools = [
  ['Answer Reviewer', 'Bring a response', 'Suggested criterion feedback and a next attempt', '/answer-reviewer'],
  ['Explain This', 'Select a difficult step', 'A simpler explanation plus a check question', '/chatbot'],
  ['Generate Practice', 'Choose topic and demand', 'Original questions with worked solutions', '/paper-maker'],
  ['Diagnose Weakness', 'Review an attempted answer', 'A named misconception, not a grade prediction', '/answer-reviewer'],
  ['Study Planner', 'Add deadlines and time', 'Editable study blocks around your week', '/planner'],
  ['Ask Vertex', 'Ask a course question', 'A guided explanation to verify with course materials', '/chatbot'],
  ['Exam Feedback', 'Add your working', 'Command-term and method feedback to investigate', '/answer-reviewer'],
] as const;
const dpSubjects = ['Mathematics AA', 'Mathematics AI', 'Biology', 'Chemistry', 'Physics', 'Economics', 'English A', 'History'];
const betaQuestions = [
  ['Ananya Shah · Fictional preview', 'I want to understand why a method works, not just remember the answer.'],
  ['Oliver Chen · Fictional preview', 'My ideal revision session starts with the step I missed last time.'],
  ['Zara Williams · Fictional preview', 'I want my notes, practice and feedback to feel like one connected course.'],
  ['Aarav Patel · Fictional preview', 'Exam technique matters. So does being able to use the idea outside the exam.'],
] as const;
const assessmentQuestions = [
  ['ENG-01 / STANDARD / 8 MARKS', 'Analyse how a writer uses narrative perspective to create uncertainty.'],
  ['PHY-01 / STANDARD / 6 MARKS', 'Interpret the force data, identify the resultant force and justify the cyclist’s motion.'],
  ['MAT-01 / STANDARD / 5 MARKS', 'Model two pricing plans and determine when their total costs are equal.'],
  ['HIS-01 / STANDARD / 8 MARKS', 'Evaluate the usefulness of a diary entry using its content, origin and purpose.'],
  ['CHE-01 / STANDARD / 6 MARKS', 'Analyse rate data, identify a control variable and explain one improvement.'],
  ['BIO-01 / STANDARD / 6 MARKS', 'Explain how a change in water potential affects a plant cell and predict one observable result.'],
] as const;

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [programme, setProgramme] = useState<'MYP' | 'DP'>('MYP');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [masteryStep, setMasteryStep] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [lensOpen, setLensOpen] = useState(false);
  const [effectsOn, setEffectsOn] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEffectsOn(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useLandingMotion(root, effectsOn);
  useEffect(() => { if (isAuthenticated) navigate('/main', { replace: true }); }, [isAuthenticated, navigate]);
  const subjects = useMemo(() => programme === 'MYP' ? MYP5_SUBJECTS.slice(0, 8).map((item) => item.name) : dpSubjects, [programme]);
  const activeSubject = subjects[Math.min(subjectIndex, subjects.length - 1)];
  const mypSubject = MYP5_SUBJECTS.find((item) => item.name === activeSubject) ?? MYP5_SUBJECTS[0];
  const assessmentQuestion = assessmentQuestions[exampleIndex % assessmentQuestions.length];
  const moveStageFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? learningStages.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + learningStages.length) % learningStages.length;
    setStage(next);
    requestAnimationFrame(() => document.getElementById(`learning-stage-${next}`)?.focus());
  };

  return <>
    <SEO title="IB MYP and Diploma study platform | VertexED" description="Learn curriculum concepts, practise original questions, review answers and return to the exact gaps in your understanding." canonical="https://www.vertexed.app/" jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'VertexED', url: 'https://www.vertexed.app/' }} />
    <div className="vertex-home" ref={root} data-effects={effectsOn ? 'on' : 'off'}>
      <LandingInk enabled={effectsOn} />
      <div className="vh-page-trace" aria-hidden="true"><i /></div>
      <nav className="vh-scroll-island" aria-label="Landing page sections">
        <a href="#concept-lens">Lens</a><a href="#curriculum">Courses</a><a href="#learning">Method</a><a href="#study-examples">Try it</a><a href="#beta">Beta</a>
      </nav>
      <section className="vh-hero landing-hero" aria-labelledby="home-title">
        <div className="vh-hero-copy"><p className="vh-kicker">Curriculum. Practice. Revision.</p><h1 id="home-title"><span>You have read <br className="vh-mobile-title-break" aria-hidden="true" />it.</span><em>Now try it.</em></h1><p>Put your notes to the test. Practise a question, check your reasoning and come back to what you missed.</p><div className="vh-actions"><Link to="/signup" className="vh-primary">Join the private beta <ArrowUpRight aria-hidden /></Link><a href="#curriculum" className="vh-secondary">Explore subjects <ArrowDown aria-hidden /></a></div><nav className="vh-quick" aria-label="Programme shortcuts"><Link to="/myp" data-preview="Seventeen MYP subject paths with topic-led practice.">See MYP 5 <ArrowRight aria-hidden /></Link><Link to="/curricula/ib-dp/paper-maker" data-preview="Build original practice around a subject and command term.">Explore IB Diploma <ArrowRight aria-hidden /></Link><a href="https://tally.so/r/2E0o9p?utm_source=website&utm_medium=homepage&utm_campaign=vertexed_opportunities" target="_blank" rel="noreferrer" data-preview="Beta testing, school pilots, research, engineering, curriculum, ambassadors, mentors and partnerships.">Schools, research & team <ArrowUpRight aria-hidden /></a></nav></div>
        <RevisionHero onExampleChange={setExampleIndex} /><div className="vh-scroll-cue"><span>IB MYP · IB Diploma · A levels · IGCSE · GCSE</span><ArrowDown aria-hidden /></div>
      </section>

      <section className="vh-lens-launcher" id="concept-lens" aria-labelledby="lens-launcher-title" data-reveal>
        <div><p className="vh-kicker">Contextual study tool</p><h2 id="lens-launcher-title">Open the lens<br /><em>when you need it.</em></h2></div>
        <div><p>Inspect a difficult visual without leaving the learning step. The example only opens when you choose it.</p><button type="button" className="vh-primary" onClick={() => setLensOpen(true)}><Search aria-hidden /> Open concept lens</button></div>
      </section>
      <StudyGallery />
      <RevisionStack />
      <section className="vh-statement" data-reveal><p>01 / Beyond the paper</p><h2>Learn for the exam.<br /><em className="vh-media-text">Keep it for life.</em></h2><p>Connect curriculum practice to lasting understanding. Explain the method, test it without help and recognise where the same idea appears outside the classroom.</p></section>

      <section className="vh-curriculum" id="curriculum" aria-labelledby="curriculum-title" data-reveal>
        <header><div><p className="vh-kicker">02 / Interactive curriculum explorer</p><h2 id="curriculum-title">Go from programme<br />to the exact resource.</h2></div><div className="vh-programme-switch" role="group" aria-label="Programme"><button type="button" aria-pressed={programme === 'MYP'} onClick={() => { setProgramme('MYP'); setSubjectIndex(0); }}>MYP</button><button type="button" aria-pressed={programme === 'DP'} onClick={() => { setProgramme('DP'); setSubjectIndex(0); }}>DP</button></div></header>
        <div className="vh-curriculum-body"><div className="vh-subject-rail" role="list" aria-label={`${programme} subjects`}>{subjects.map((subject, index) => <button role="listitem" type="button" aria-pressed={subjectIndex === index} onClick={() => setSubjectIndex(index)} key={subject}><span>{String(index + 1).padStart(2, '0')}</span>{subject}<ChevronRight aria-hidden /></button>)}</div><div className="vh-curriculum-path" aria-live="polite"><div className="vh-path-line"><span>{programme}</span><i /><span>{activeSubject}</span><i /><span>{programme === 'MYP' ? mypSubject.topics[0] : 'Core concepts'}</span></div><div className="vh-topic-sheet"><p>Selected subject</p><h3>{activeSubject}</h3><p>{programme === 'MYP' ? mypSubject.summary : 'Move from syllabus statements to focused explanations, original practice and review.'}</p><ol><li><span>Unit</span><strong>{programme === 'MYP' ? mypSubject.topics[0] : 'Foundations'}</strong></li><li><span>Topic</span><strong>{programme === 'MYP' ? mypSubject.topics[1] ?? mypSubject.topics[0] : 'Core concepts'}</strong></li><li><span>Concept</span><strong>Explanation and worked method</strong></li><li><span>Resource</span><strong>Practice, solution and mastery check</strong></li></ol>{programme === 'MYP' ? <Link to={`/myp/subjects/${mypSubject.slug}/${topicSlug(mypSubject.topics[0])}`}>Open {activeSubject} <ArrowRight aria-hidden /></Link> : <Link to="/curricula/ib-dp/paper-maker">Explore Diploma tools <ArrowRight aria-hidden /></Link>}</div></div></div>
      </section>

      <section className="vh-learning" id="learning" aria-labelledby="learning-title" data-reveal><header><p className="vh-kicker">03 / The learning experience</p><h2 id="learning-title">Six moves.<br /><em>One visible thread.</em></h2></header><div className="vh-stage-layout"><div className="vh-stage-tabs" role="tablist" aria-label="Learning stages" style={{ '--active-x': `${(stage % 3) * 100 / 3}%`, '--active-y': stage >= 3 ? '50%' : '0px' } as React.CSSProperties}>{learningStages.map((item, index) => <button role="tab" type="button" aria-selected={stage === index} aria-controls="learning-stage-panel" id={`learning-stage-${index}`} tabIndex={stage === index ? 0 : -1} onKeyDown={event => moveStageFocus(event, index)} onClick={() => setStage(index)} key={item.name}><span>{item.code}</span>{item.name}</button>)}</div><div className="vh-stage-panel" role="tabpanel" id="learning-stage-panel" aria-labelledby={`learning-stage-${stage}`}><div><p>{learningStages[stage].name}</p><h3>{learningStages[stage].title}</h3><p>{learningStages[stage].copy}</p>{['Learn', 'Review', 'Diagnose'].includes(learningStages[stage].name) && <button type="button" className="vh-stage-lens" onClick={() => setLensOpen(true)}><Search aria-hidden /> Inspect the example with Concept Lens</button>}</div><div className="vh-stage-demo" data-float><span>{learningStages[stage].sample[0]} / Example</span><strong>{learningStages[stage].sample[1]}</strong><p><CircleDot aria-hidden /> {learningStages[stage].sample[2]}</p></div></div></div></section>

      <section className="vh-subjects" id="subjects" aria-labelledby="subjects-title" data-reveal><header><div><p className="vh-kicker">04 / Subject universe</p><h2 id="subjects-title">Each discipline<br />has its own logic.</h2></div><p>Colour supports orientation. The shared revision trace keeps the learning workflow familiar across subjects.</p></header><div className="vh-subject-scroll">{MYP5_SUBJECTS.map((subject, index) => <Link to={`/myp/subjects/${subject.slug}`} className="vh-subject-card" data-float style={{ '--subject': subject.accent } as React.CSSProperties} key={subject.slug}><div><span>{String(index + 1).padStart(2, '0')}</span><BookOpen aria-hidden /></div><p>{subject.group}</p><h3>{subject.name}</h3><p>{subject.summary}</p><ul><li>{subject.topics.length} mapped topics</li><li>Practice and revision resources</li><li>Criterion-linked skills</li><li>Mastery checklist</li></ul><span>Explore <ArrowUpRight aria-hidden /></span></Link>)}</div></section>

      <section className="vh-ai" id="study-ai" aria-labelledby="ai-title" data-reveal><header><p className="vh-kicker">05 / AI in the study loop</p><h2 id="ai-title">Useful when the<br /><em>workflow is concrete.</em></h2><p>AI does not replace the attempt or make a result official. It helps inspect reasoning, generate independent practice and decide what to revisit.</p></header><div className="vh-ai-workflow"><div className="vh-ai-list">{aiTools.map(([name, input, output, href], index) => <Link to={href} data-preview={`${input}. ${output}.`} key={name}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{input}</p></div><ArrowRight aria-hidden /><div><p>{output}</p></div></Link>)}</div><aside data-float><BrainCircuit aria-hidden /><p>Example workflow</p><h3>“My answer quotes the source but does not explain what the evidence supports.”</h3><ol><li>Keep the original answer visible.</li><li>Name the missing relationship.</li><li>Generate one focused retry.</li><li>Check the result against course materials.</li></ol><Link to="/answer-reviewer">Review an answer <ArrowUpRight aria-hidden /></Link></aside></div></section>

      <section className="vh-mastery" aria-labelledby="mastery-title" data-reveal><div className="vh-mastery-copy"><p className="vh-kicker">06 / Progress and mastery</p><h2 id="mastery-title">Progress is not a number.<br /><em>It is a trace.</em></h2><p>This example journey keeps the attempt, misconception and next action connected. It is an illustration only and does not represent a learner account.</p><div className="vh-mastery-controls" role="group" aria-label="Example learner journey">{['Learned', 'Attempted', 'Gap found', 'Revised', 'Transferred'].map((item, index) => <button type="button" aria-pressed={masteryStep === index} onClick={() => setMasteryStep(index)} key={item}><span>0{index + 1}</span>{item}</button>)}</div></div><div className="vh-mastery-paper" aria-live="polite"><span>Example / Linear functions</span><div className="vh-mastery-meter"><i style={{ width: `${(masteryStep + 1) * 20}%` }} /></div><p>{['The learner connects gradient to a constant rate of change.', 'A question asks for an equation from a graph.', 'The equation is correct but neither variable is defined.', 'A focused retry targets notation and interpretation.', 'A new pricing context is modelled and explained without the scaffold.'][masteryStep]}</p><strong>{['Concept opened', 'Question attempted', 'Misconception detected', 'Revision completed', 'Mastery evidenced in a new context'][masteryStep]}</strong></div></section>

      <section className="vh-eassessment" data-reveal><div><p className="vh-kicker">07 / MYP 5 eAssessment</p><h2>Original practice.<br />Visible technique.</h2><p>Filter by subject and difficulty. Work with command terms, data, sources, extended responses and review strategies without using protected examination content.</p><Link to="/myp/eassessment" className="vh-primary">Open eAssessment hub <ArrowUpRight aria-hidden /></Link></div><div className="vh-question-preview" aria-live="polite"><span>{assessmentQuestion[0]}</span><h3>{assessmentQuestion[1]}</h3><div><span>01</span><p>Read the task and command term</p><span>02</span><p>Select relevant evidence or working</p><span>03</span><p>Connect evidence to explanation</p></div></div></section>

      <section className="vh-beta" id="beta" aria-labelledby="beta-title" data-reveal>
        <header><p className="vh-kicker">Student voices / Design preview</p><h2 id="beta-title">Space for ambition.<br /><em>Room to understand.</em></h2><p>Sample testimonial layouts with fictional names and illustrative wishes. These are not customer endorsements or measured outcomes.</p></header>
        <div className="vh-marquee" tabIndex={0} aria-label="Fictional sample testimonials. Focus to pause scrolling."><div>{[...betaQuestions, ...betaQuestions].map(([label, question], index) => <article key={`${label}-${index}`} aria-hidden={index >= betaQuestions.length}><span>{label}</span><p>{question}</p></article>)}</div></div>
      </section>

      <section className="vh-eassessment" id="opportunities" data-reveal>
        <div>
          <p className="vh-kicker">08 / Work with VertexED</p>
          <h2>Use it. Test it.<br />Help build it.</h2>
          <p>One intake now covers private-beta interest, student testing, school and classroom pilots, education research, engineering, AI/ML, curriculum, product, design, ambassadors, contributor cohorts, mentors, events, and institutional partnerships.</p>
          <a href="https://tally.so/r/2E0o9p?utm_source=website&utm_medium=opportunity_section&utm_campaign=vertexed_opportunities" target="_blank" rel="noreferrer" className="vh-primary">Explore VertexED opportunities <ArrowUpRight aria-hidden /></a>
        </div>
        <div className="vh-question-preview" aria-label="VertexED opportunity routes">
          <span>ONE FORM · MULTIPLE ROUTES</span>
          <h3>Students, educators, builders and partners.</h3>
          <div>
            <span>01</span><p>Beta access, curricula and student testing</p>
            <span>02</span><p>School pilots, research and educator collaboration</p>
            <span>03</span><p>Engineering, product, curriculum and partnership roles</p>
          </div>
        </div>
      </section>

      <section className="vh-final" aria-labelledby="final-title" data-reveal><Sparkles aria-hidden /><p className="vh-kicker">Choose the next subject</p><h2 id="final-title">The next attempt<br /><em>starts with one concept.</em></h2><p>Enter MYP 5 through the subject you are studying now.</p><div className="vh-final-links">{MYP5_SUBJECTS.slice(0, 6).map((subject) => <Link to={`/myp/subjects/${subject.slug}`} data-preview={`${subject.group}. ${subject.topics.length} mapped topics.`} key={subject.slug}>{subject.name}<ArrowRight aria-hidden /></Link>)}</div><Link to="/myp" className="vh-final-all">Explore all MYP 5 subjects <ArrowUpRight aria-hidden /></Link></section>
      {lensOpen && <AccessibleModal titleId="concept-lens-title" descriptionId="concept-lens-dialog-description" onClose={() => setLensOpen(false)} overlayClassName="vh-lens-overlay" className="vh-lens-dialog"><button type="button" className="vh-lens-close" aria-label="Close concept lens" onClick={() => setLensOpen(false)}><X aria-hidden /></button><p id="concept-lens-dialog-description" className="sr-only">Interactive graph example for inspecting slope and energy transfer. Press Escape to close and return to the page.</p><ConceptLens id="concept-lens-dialog" /></AccessibleModal>}
    </div>
  </>;
}

function LearningSystem() {
  return <div className="vh-system" data-float aria-label="Illustration of a VertexED learning path"><div className="vh-system-orbit" aria-hidden><i /><i /><i /></div><div className="vh-system-centre"><img src="/logo.png" alt="" /><span>YOUR TOPIC</span><strong>Source evaluation</strong></div><div className="vh-system-card vh-card-learn"><span>LEARN / 01</span><strong>Origin and purpose</strong><p>Place the source in its historical context.</p></div><div className="vh-system-card vh-card-practise"><span>PRACTISE / 02</span><strong>Test an inference</strong><p>6 marks · original practice</p></div><div className="vh-system-card vh-card-review"><span>REVIEW / 03</span><strong>One gap found</strong><p>Connect the quotation to the claim.</p></div><div className="vh-system-trace" aria-hidden><i /><i /><i /></div><div className="vh-system-label"><Play aria-hidden /> Interactive learning system</div></div>;
}
