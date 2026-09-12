import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, ChevronRight, CircleDot, Play, SlidersHorizontal, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';
import LandingInk from '@/components/LandingInk';
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

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [effects, setEffects] = useState(() => { try { return localStorage.getItem('vertexed:landing-effects') !== 'off'; } catch { return true; } });
  const [programme, setProgramme] = useState<'MYP' | 'DP'>('MYP');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [masteryStep, setMasteryStep] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useLandingMotion(root, effects);
  useEffect(() => { if (isAuthenticated) navigate('/main', { replace: true }); }, [isAuthenticated, navigate]);
  const subjects = useMemo(() => programme === 'MYP' ? MYP5_SUBJECTS.slice(0, 8).map((item) => item.name) : dpSubjects, [programme]);
  const activeSubject = subjects[Math.min(subjectIndex, subjects.length - 1)];
  const mypSubject = MYP5_SUBJECTS.find((item) => item.name === activeSubject) ?? MYP5_SUBJECTS[0];
  const toggleEffects = () => { const next = !effects; setEffects(next); try { localStorage.setItem('vertexed:landing-effects', next ? 'on' : 'off'); } catch { /* Optional device preference. */ } };

  return <>
    <SEO title="IB MYP and Diploma study platform | VertexED" description="Learn curriculum concepts, practise original questions, review answers and return to the exact gaps in your understanding." canonical="https://www.vertexed.app/" jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'VertexED', url: 'https://www.vertexed.app/' }} />
    <div className="vertex-home" ref={root} data-effects={effects ? 'on' : 'off'}>
      <LandingInk enabled={effects} />
      <div className="vh-utility"><span><i aria-hidden /> VERTEXED / IB STUDY SYSTEM</span><button type="button" aria-pressed={effects} onClick={toggleEffects}><SlidersHorizontal aria-hidden /> Effects {effects ? 'on' : 'off'}</button></div>
      <section className="vh-hero landing-hero" aria-labelledby="home-title">
        <div className="vh-hero-copy"><p className="vh-kicker">Curriculum. Practice. Revision.</p><h1 id="home-title"><span>Master the IB.</span><em>Understand everything.</em></h1><p>Structured curriculum content, original practice, revision planning and AI-supported explanations. One place to learn the idea, test it and return to what you missed.</p><div className="vh-actions"><Link to="/signup" className="vh-primary">Start learning <ArrowUpRight aria-hidden /></Link><a href="#curriculum" className="vh-secondary">Explore subjects <ArrowDown aria-hidden /></a></div><nav className="vh-quick" aria-label="Programme shortcuts"><Link to="/myp">See MYP 5 <ArrowRight aria-hidden /></Link><Link to="/curricula/ib-dp/paper-maker">Explore IB Diploma <ArrowRight aria-hidden /></Link></nav></div>
        <LearningSystem /><div className="vh-scroll-cue"><span>Scroll to enter the curriculum</span><ArrowDown aria-hidden /></div>
      </section>

      <section className="vh-statement" data-reveal><p>01 / The system</p><h2>A syllabus is a map.<br /><em>Learning is the route through it.</em></h2><p>VertexED connects the course structure to the work students actually do: understand, attempt, inspect, retry.</p></section>

      <section className="vh-curriculum" id="curriculum" aria-labelledby="curriculum-title" data-reveal>
        <header><div><p className="vh-kicker">02 / Interactive curriculum explorer</p><h2 id="curriculum-title">Go from programme<br />to the exact resource.</h2></div><div className="vh-programme-switch" role="group" aria-label="Programme"><button type="button" aria-pressed={programme === 'MYP'} onClick={() => { setProgramme('MYP'); setSubjectIndex(0); }}>MYP</button><button type="button" aria-pressed={programme === 'DP'} onClick={() => { setProgramme('DP'); setSubjectIndex(0); }}>DP</button></div></header>
        <div className="vh-curriculum-body"><div className="vh-subject-rail" role="list" aria-label={`${programme} subjects`}>{subjects.map((subject, index) => <button role="listitem" type="button" aria-pressed={subjectIndex === index} onClick={() => setSubjectIndex(index)} key={subject}><span>{String(index + 1).padStart(2, '0')}</span>{subject}<ChevronRight aria-hidden /></button>)}</div><div className="vh-curriculum-path" aria-live="polite"><div className="vh-path-line"><span>{programme}</span><i /><span>{activeSubject}</span><i /><span>{programme === 'MYP' ? mypSubject.topics[0] : 'Core concepts'}</span></div><div className="vh-topic-sheet"><p>Selected subject</p><h3>{activeSubject}</h3><p>{programme === 'MYP' ? mypSubject.summary : 'Move from syllabus statements to focused explanations, original practice and review.'}</p><ol><li><span>Unit</span><strong>{programme === 'MYP' ? mypSubject.topics[0] : 'Foundations'}</strong></li><li><span>Topic</span><strong>{programme === 'MYP' ? mypSubject.topics[1] ?? mypSubject.topics[0] : 'Core concepts'}</strong></li><li><span>Concept</span><strong>Explanation and worked method</strong></li><li><span>Resource</span><strong>Practice, solution and mastery check</strong></li></ol>{programme === 'MYP' ? <Link to={`/myp/subjects/${mypSubject.slug}/${topicSlug(mypSubject.topics[0])}`}>Open {activeSubject} <ArrowRight aria-hidden /></Link> : <Link to="/curricula/ib-dp/paper-maker">Explore Diploma tools <ArrowRight aria-hidden /></Link>}</div></div></div>
      </section>

      <section className="vh-learning" aria-labelledby="learning-title" data-reveal><header><p className="vh-kicker">03 / The learning experience</p><h2 id="learning-title">Six moves.<br /><em>One visible thread.</em></h2></header><div className="vh-stage-layout"><div className="vh-stage-tabs" role="tablist" aria-label="Learning stages">{learningStages.map((item, index) => <button role="tab" type="button" aria-selected={stage === index} aria-controls="learning-stage-panel" id={`learning-stage-${index}`} onClick={() => setStage(index)} key={item.name}><span>{item.code}</span>{item.name}</button>)}</div><div className="vh-stage-panel" role="tabpanel" id="learning-stage-panel" aria-labelledby={`learning-stage-${stage}`}><div><p>{learningStages[stage].name}</p><h3>{learningStages[stage].title}</h3><p>{learningStages[stage].copy}</p></div><div className="vh-stage-demo"><span>{learningStages[stage].sample[0]} / Example</span><strong>{learningStages[stage].sample[1]}</strong><p><CircleDot aria-hidden /> {learningStages[stage].sample[2]}</p></div></div></div></section>

      <section className="vh-subjects" aria-labelledby="subjects-title" data-reveal><header><div><p className="vh-kicker">04 / Subject universe</p><h2 id="subjects-title">Each discipline<br />has its own logic.</h2></div><p>Colour supports orientation. The shared revision trace keeps the learning workflow familiar across subjects.</p></header><div className="vh-subject-scroll">{MYP5_SUBJECTS.map((subject, index) => <Link to={`/myp/subjects/${subject.slug}`} className="vh-subject-card" style={{ '--subject': subject.accent } as React.CSSProperties} key={subject.slug}><div><span>{String(index + 1).padStart(2, '0')}</span><BookOpen aria-hidden /></div><p>{subject.group}</p><h3>{subject.name}</h3><p>{subject.summary}</p><ul><li>{subject.topics.length} mapped topics</li><li>Practice and revision resources</li><li>Criterion-linked skills</li><li>Mastery checklist</li></ul><span>Explore <ArrowUpRight aria-hidden /></span></Link>)}</div></section>

      <section className="vh-ai" aria-labelledby="ai-title" data-reveal><header><p className="vh-kicker">05 / AI in the study loop</p><h2 id="ai-title">Useful when the<br /><em>workflow is concrete.</em></h2><p>AI does not replace the attempt or make a result official. It helps inspect reasoning, generate independent practice and decide what to revisit.</p></header><div className="vh-ai-workflow"><div className="vh-ai-list">{aiTools.map(([name, input, output, href], index) => <Link to={href} key={name}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{input}</p></div><ArrowRight aria-hidden /><div><p>{output}</p></div></Link>)}</div><aside><BrainCircuit aria-hidden /><p>Example workflow</p><h3>“My answer names osmosis but does not explain the direction.”</h3><ol><li>Keep the original answer visible.</li><li>Explain the missing relationship.</li><li>Generate one focused retry.</li><li>Check the result against course materials.</li></ol><Link to="/answer-reviewer">Review an answer <ArrowUpRight aria-hidden /></Link></aside></div></section>

      <section className="vh-mastery" aria-labelledby="mastery-title" data-reveal><div className="vh-mastery-copy"><p className="vh-kicker">06 / Progress and mastery</p><h2 id="mastery-title">Progress is not a number.<br /><em>It is a trace.</em></h2><p>This example journey keeps the attempt, misconception and next action connected. It is an illustration only and does not represent a learner account.</p><div className="vh-mastery-controls" role="group" aria-label="Example learner journey">{['Learned', 'Attempted', 'Gap found', 'Revised', 'Transferred'].map((item, index) => <button type="button" aria-pressed={masteryStep === index} onClick={() => setMasteryStep(index)} key={item}><span>0{index + 1}</span>{item}</button>)}</div></div><div className="vh-mastery-paper" aria-live="polite"><span>Example / Cell transport</span><div className="vh-mastery-meter"><i style={{ width: `${(masteryStep + 1) * 20}%` }} /></div><p>{['The learner explains diffusion using particle movement.', 'A question asks for osmosis across a partially permeable membrane.', 'The answer omits the direction of net water movement.', 'A short explanation and focused retry target the missing relationship.', 'A new plant-cell context is answered without the scaffold.'][masteryStep]}</p><strong>{['Concept opened', 'Question attempted', 'Misconception detected', 'Revision completed', 'Mastery evidenced in a new context'][masteryStep]}</strong></div></section>

      <section className="vh-eassessment" data-reveal><div><p className="vh-kicker">07 / MYP 5 eAssessment</p><h2>Original practice.<br />Visible technique.</h2><p>Filter by subject and difficulty. Work with command terms, data, sources, extended responses and review strategies without using protected examination content.</p><Link to="/myp/eassessment" className="vh-primary">Open eAssessment hub <ArrowUpRight aria-hidden /></Link></div><div className="vh-question-preview"><span>SCI-01 / STANDARD / 6 MARKS</span><h3>Analyse a cooling curve, identify a control variable and explain one improvement.</h3><div><span>01</span><p>Read axes and units</p><span>02</span><p>Describe the trend</p><span>03</span><p>Connect evidence to explanation</p></div></div></section>

      <section className="vh-final" aria-labelledby="final-title" data-reveal><Sparkles aria-hidden /><p className="vh-kicker">Choose the next subject</p><h2 id="final-title">The next attempt<br /><em>starts with one concept.</em></h2><p>Enter MYP 5 through the subject you are studying now.</p><div className="vh-final-links">{MYP5_SUBJECTS.slice(0, 6).map((subject) => <Link to={`/myp/subjects/${subject.slug}`} key={subject.slug}>{subject.name}<ArrowRight aria-hidden /></Link>)}</div><Link to="/myp" className="vh-final-all">Explore all MYP 5 subjects <ArrowUpRight aria-hidden /></Link></section>
    </div>
  </>;
}

function LearningSystem() {
  return <div className="vh-system" data-float aria-label="Illustration of a VertexED learning path"><div className="vh-system-orbit" aria-hidden><i /><i /><i /></div><div className="vh-system-centre"><img src="/logo.png" alt="" /><span>YOUR TOPIC</span><strong>Cell transport</strong></div><div className="vh-system-card vh-card-learn"><span>LEARN / 01</span><strong>Osmosis</strong><p>Water moves across a partially permeable membrane.</p></div><div className="vh-system-card vh-card-practise"><span>PRACTISE / 02</span><strong>Explain the direction</strong><p>4 marks · original practice</p></div><div className="vh-system-card vh-card-review"><span>REVIEW / 03</span><strong>One gap found</strong><p>Add water potential and net movement.</p></div><div className="vh-system-trace" aria-hidden><i /><i /><i /></div><div className="vh-system-label"><Play aria-hidden /> Interactive learning system</div></div>;
}
