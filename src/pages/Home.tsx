import { Link, useNavigate } from 'react-router';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import RevisionTrace from '@/components/RevisionTrace';
import LandingInk from '@/components/LandingInk';
import AnswerCompare from '@/components/landing/AnswerCompare';
import ToolGallery from '@/components/landing/ToolGallery';
import StudyEntry from '@/components/landing/StudyEntry';
import LandingDock from '@/components/landing/LandingDock';
import { useLandingMotion } from '@/hooks/useLandingMotion';
import { ArrowUpRight, ArrowDown, ArrowRight, BookOpen, ScanLine, SlidersHorizontal, Check } from 'lucide-react';
import '@/styles/landing.css';

const sessions = [
  { minutes: 25, blocks: [['Recall', 5], ['Practise', 15], ['Review', 5]] },
  { minutes: 45, blocks: [['Recall', 10], ['Practise', 25], ['Review', 10]] },
  { minutes: 75, blocks: [['Recall', 15], ['Practise', 45], ['Review', 15]] },
] as const;
export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [effects, setEffects] = useState(() => {
    try { return localStorage.getItem('vertexed:landing-effects') !== 'off'; } catch { return true; }
  });
  const [session, setSession] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useLandingMotion(root, effects);
  useEffect(() => { if (isAuthenticated) navigate('/main', { replace: true }); }, [isAuthenticated, navigate]);
  const toggleEffects = () => {
    setEffects(!effects);
    try { localStorage.setItem('vertexed:landing-effects', effects ? 'off' : 'on'); } catch { /* Device preference is optional. */ }
  };

  return <>
    <SEO title="AI Study Planner & Exam Practice Tools | VertexED"
      description="Plan a study session, practise exam-style questions, review your answers and return to the topics that need another attempt."
      canonical="https://www.vertexed.app/"
      jsonLd={[{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'VertexED', url: 'https://www.vertexed.app/' }]} />
    <div className="landing-v3" ref={root} data-effects={effects ? 'on' : 'off'}>
      <LandingInk enabled={effects} />
      <div className="landing-edition"><span><i aria-hidden/> THE REVISION WORKSPACE</span><button type="button" aria-pressed={effects} onClick={toggleEffects}><SlidersHorizontal size={15} aria-hidden/> Effects {effects ? 'on' : 'off'}</button></div>
      <section className="landing-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span>Private beta</span> Plan. Practise. Review.</p>
          <h1 id="home-title"><span className="heading-line">You’ve read it.</span><span className="heading-line hero-blue">Now try it.<svg viewBox="0 0 500 24" preserveAspectRatio="none" aria-hidden><path d="M4 16 Q190 0 496 11 M58 22 Q252 10 456 17" /></svg></span></h1>
          <p className="hero-subtext">Turn your notes into an attempt.<br/>Work through the gaps, then try again without help.</p>
          <div className="landing-actions"><Link to="/signup" className="landing-primary"><span>Join the private beta</span><ArrowUpRight size={19} aria-hidden/></Link><a href="#revision-example" className="landing-secondary">Try the revision loop <ArrowDown size={17} aria-hidden/></a></div>
        </div>
        <div className="hero-desk" id="revision-example">
          <div className="desk-overline"><span>ONE TOPIC. ATTEMPT, REVIEW, RETRY.</span><span>Try the tabs <ArrowDown size={13} aria-hidden/></span></div>
          <div className="desk-depth" data-float><RevisionTrace /></div>
          <div className="desk-under"><span aria-hidden>↳</span> The next attempt starts with what this one missed.</div>
        </div>
      </section>
      <LandingDock />

      <StudyEntry />

      <section className="landing-section compare-section" aria-labelledby="comparison-title" data-reveal>
        <div className="section-intro"><p className="section-kicker">02 / Look closer</p><h2 id="comparison-title">A familiar word.<br/>A missing <span className="ink-highlight">explanation.</span></h2><p>Knowing “osmosis” is a start. Describing the direction and the membrane makes the answer more specific. Compare the two attempts.</p><Link to="/answer-reviewer" className="landing-secondary">Open Answer Reviewer <ArrowUpRight size={17}/></Link></div>
        <AnswerCompare />
      </section>

      <section className="landing-section tools-section" id="study-tools" aria-labelledby="tools-title" data-reveal>
        <div className="section-intro section-wide"><p className="section-kicker">03 / Your study desk</p><h2 id="tools-title">Room for your<br/><span className="ink-highlight">whole study session.</span></h2><p>From the first plan to the question you try again. Open the tool that fits the work in front of you.</p></div>
        <ToolGallery effects={effects}/>
      </section>

      <section className="landing-section session-section" id="exam-session" aria-labelledby="session-title" data-reveal>
        <div className="section-intro"><p className="section-kicker">04 / Exam Prep</p><h2 id="session-title">An evening.<br/>An hour.<br/><span className="ink-highlight">Or just 25 minutes.</span></h2><p>Choose your subject and session length. Exam Prep brings unfinished mocks, scheduled retries and due flashcards into the next session.</p><Link to="/exam-prep" className="landing-primary"><span>Build my study session</span><ArrowUpRight size={18}/></Link></div>
        <div className="session-preview"><div className="session-caption"><BookOpen size={18}/><span>A session, broken down</span><span>Example</span></div>
          <div className="session-duration" role="group" aria-label="Example session duration">{sessions.map((entry, index) => <button key={entry.minutes} type="button" aria-pressed={session === index} onClick={() => setSession(index)}>{entry.minutes}<span>min</span></button>)}</div>
          <p className="session-question">{sessions[session].minutes} minutes, with a place to start.</p>
          <div className="session-bar" aria-hidden>{sessions[session].blocks.map(([name, minutes]) => <span key={name} style={{ flex: minutes } as CSSProperties}/>)}</div>
          <ol className="session-blocks">{sessions[session].blocks.map(([name, minutes], index) => <li key={name}><span className="session-step">0{index + 1}</span><div><strong>{name}</strong><p>{['Bring the topic back without notes.', 'Work through a question on your own.', 'Check the gaps. Choose a next attempt.'][index]}</p></div><span>{minutes} min</span></li>)}</ol>
          <p className="landing-fineprint">A sample time split, not your saved plan. Your session depends on your subject and available work.</p>
        </div>
      </section>

      <section className="landing-principle" aria-labelledby="principle-title" data-reveal><div className="principle-mark" aria-hidden><ScanLine size={32}/></div><div><p className="section-kicker">Your thinking comes first</p><h2 id="principle-title">Feedback is a starting point.<br/>Not the final word.</h2><p>AI explanations and suggested marks can be wrong. Check them against your teacher’s feedback, syllabus and official mark schemes.</p></div><ul><li><Check size={16}/> Make your own attempt</li><li><Check size={16}/> Check the explanation</li><li><Check size={16}/> Try again without help</li></ul></section>
      <section className="landing-faq landing-section" aria-labelledby="faq-title" data-reveal>
        <div className="section-intro"><p className="section-kicker">Before you start</p><h2 id="faq-title">A few things<br/>worth <span className="ink-highlight">knowing.</span></h2></div>
        <div className="faq-answers">
          <details><summary>Can I try it without an account?<span aria-hidden>+</span></summary><p>The revision desk and examples on this page work without signing in. To use the study tools with your own material, join the private beta or log in.</p><Link to="/signup">Join the private beta <ArrowUpRight size={16}/></Link></details>
          <details><summary>Are generated papers official exam papers?<span aria-hidden>+</span></summary><p>No. Paper Maker creates exam-style practice, not official past papers. Check generated questions against your syllabus and use official exam-board resources alongside them.</p></details>
          <details><summary>Should I trust the suggested marks?<span aria-hidden>+</span></summary><p>Treat them as feedback to investigate, not a final grade. AI can miss context or apply a criterion incorrectly. Compare the reasoning with an official mark scheme or your teacher’s feedback.</p></details>
        </div>
      </section>
      <section className="landing-invitation" aria-labelledby="beta-title" data-reveal><p className="section-kicker">VERTEXED / PRIVATE BETA</p><h2 id="beta-title">Your next attempt<br/>starts <em>here.</em></h2><p>Built by Ryan Gomez, Pratyush Vel Shankar and Ritayush Dey. Bring your work. Try the tools. Tell us what needs fixing.</p><div className="landing-actions"><Link to="/signup" className="landing-primary"><span>Join the private beta</span><ArrowRight size={18}/></Link><Link to="/about" className="landing-secondary">Meet the team <ArrowUpRight size={17}/></Link></div></section>
    </div>
  </>;
}
