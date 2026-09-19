import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, FileCheck2, NotebookPen } from 'lucide-react';
import SEO from '@/components/SEO';
import WorkingTracePanel from '@/components/WorkingTracePanel';
import RevisionHero from '@/components/landing/RevisionHero';
import { useAuth } from '@/contexts/AuthContext';
import { useLandingMotion } from '@/hooks/useLandingMotion';
import { MYP5_SUBJECTS } from '@/content/myp5';
import '@/styles/vertex-home.css';
import '@/styles/working-trace.css';
import '@/styles/product-home.css';

const tools = [
  { name: 'Study Notebook', icon: NotebookPen, text: 'Keep course materials together. Ask questions with source citations, then turn the material into practice.', to: '/study-notebook', input: 'Start with your notes' },
  { name: 'Answer Reviewer', icon: FileCheck2, text: 'Bring a question and your attempt. Review suggested feedback, check the reasoning and plan a focused retry.', to: '/answer-reviewer', input: 'Start with your answer' },
  { name: 'Paper Maker', icon: BookOpen, text: 'Choose a curriculum, topic and difficulty. Generate original practice questions with suggested solutions.', to: '/paper-maker', input: 'Start with a topic' },
  { name: 'Study Planner', icon: CalendarDays, text: 'Place the next attempt in your week. Add your own study blocks or request an editable AI suggestion.', to: '/planner', input: 'Start with your week' },
];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [programme, setProgramme] = useState<'MYP' | 'DP'>('MYP');
  const [effectsOn, setEffectsOn] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEffectsOn(!query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useLandingMotion(root, effectsOn);
  useEffect(() => { if (isAuthenticated) navigate('/main', { replace: true }); }, [isAuthenticated, navigate]);
  const courses = programme === 'MYP' ? MYP5_SUBJECTS.slice(0,6).map(s=>({name:s.name,detail:s.summary,to:`/myp/subjects/${s.slug}`})) : [
    {name:'Mathematics',detail:'Functions, differentiation and integration. Revisit the algebra underneath the method.',to:'/learn?programme=IB+DP&subject=Mathematics'},
    {name:'Physics',detail:'Connect motion, force and energy. Check quantities and dimensions before calculating.',to:'/learn?programme=IB+DP&subject=Physics'},
    {name:'Chemistry',detail:'Reason about quantities, reaction rates and the particle model.',to:'/learn?programme=IB+DP&subject=Chemistry'},
  ];
  return <>
    <SEO title="Keep the working. Find the gap. | VertexED" description="A study workspace for your notes, attempts and next steps. Check algebra, practise core ideas and return to what needs attention." canonical="https://www.vertexed.app/" />
    <div className="vertex-home product-home" ref={root} data-effects={effectsOn ? 'on' : 'off'}>
      <nav className="vh-scroll-island" aria-label="Landing page sections"><a href="#working-trace">Try it</a><a href="#curriculum">Courses</a><a href="#learning">Tools</a><a href="#beta">Beta</a></nav>
      <section className="product-opening" aria-labelledby="home-title">
        <div><p className="vh-kicker">Your next attempt starts here</p><h1 id="home-title">You have read it.<br /><em>Now try it.</em></h1><p className="product-intro">Put your notes to the test. Find the step that needs attention, understand it, and come back with a better attempt.</p><div className="vh-actions"><a className="vh-primary" href="#working-trace">Check your working <ArrowDown size={18} aria-hidden /></a><Link className="vh-secondary" to="/signup">Join the private beta <ArrowUpRight size={18} aria-hidden /></Link></div><p className="product-opening-note">Try algebra without an account. Save your study work when you join.</p></div>
        <aside className="product-opening-paper" aria-label="Illustrative algebra review"><div><span>ALGEBRA / EXAMPLE</span><span>01 → 02 → 03</span></div><p>Expand the brackets</p><strong>2(x + 3)</strong><div className="product-incorrect"><span>2x + 3</span><span>Check the constant</span></div><p className="product-annotation">The 2 multiplies both terms<br />inside the brackets.</p><strong className="product-correct">2x + 6 <span>Keep the equivalence.</span></strong><footer>Try the editable checker below <ArrowDown size={16} aria-hidden /></footer></aside>
      </section>
      <section className="product-chapter" id="working-trace" aria-labelledby="trace-title">
        <header className="product-chapter-heading"><div><p className="vh-kicker">01 / From answer to understanding</p><h2 id="trace-title">Every step<br /><em>tells you something.</em></h2></div><p>Check an algebraic transformation as you work. See where the reasoning changes, repair the step and try again.</p></header>
        <WorkingTracePanel />
        <details className="product-more-examples"><summary>Explore an illustrative review in another subject</summary><RevisionHero /></details>
      </section>
      <section className="product-courses product-chapter" id="curriculum" aria-labelledby="curriculum-title">
        <header className="product-chapter-heading"><div><p className="vh-kicker">02 / Choose your starting point</p><h2 id="curriculum-title">One concept.<br /><em>A useful next step.</em></h2></div><div><p>Start with a short lesson and an original question. Curriculum pathways help you find the topic you are studying.</p><div className="vh-programme-switch" role="group" aria-label="Programme"><button type="button" aria-pressed={programme==='MYP'} onClick={()=>setProgramme('MYP')}>MYP</button><button type="button" aria-pressed={programme==='DP'} onClick={()=>setProgramme('DP')}>DP</button></div></div></header>
        <div className="product-course-list">{courses.map((s,i)=><Link key={s.name} to={s.to}><span>0{i+1}</span><div><h3>{s.name}</h3><p>{s.detail}</p></div><ArrowUpRight size={20} aria-hidden /></Link>)}</div>
        <div className="product-course-footer"><p>Original VertexED practice. Course mapping is being developed and reviewed.</p><Link to="/learn">See the micro-lesson release <ArrowRight size={18} aria-hidden /></Link></div>
      </section>
      <section className="product-chapter" id="learning" aria-labelledby="learning-title"><header className="product-chapter-heading"><div><p className="vh-kicker">03 / Keep your study connected</p><h2 id="learning-title">Bring the work.<br /><em>Choose the next move.</em></h2></div><p>Notes, questions, feedback and a place in your week. Each tool begins with something concrete.</p></header><div className="product-tools">{tools.map(tool=><Link key={tool.name} to={tool.to}><tool.icon size={24} aria-hidden /><span>{tool.input}</span><h3>{tool.name}</h3><p>{tool.text}</p><span className="product-tool-action">Open {tool.name} <ArrowUpRight size={18} aria-hidden /></span></Link>)}</div><p className="product-tool-note">AI feedback is suggested guidance. Check it against your materials or teacher advice. Service limitations are shown when they occur.</p></section>
      <section className="product-chapter product-faq" aria-labelledby="faq-title"><div><p className="vh-kicker">Before you begin</p><h2 id="faq-title">A few clear answers.</h2></div><div><details><summary>What does Working Trace check?</summary><p>Polynomial expressions up to degree six and linear equations in one variable, using exact arithmetic. Physics mode compares dimensions. Handwriting, symbolic denominators, nonlinear equations and general calculus verification are not supported yet.</p></details><details><summary>Are these official exam questions?</summary><p>No. VertexED exercises are original practice. Programme names help with navigation; they do not imply endorsement or an official mark scheme.</p></details><details><summary>What happens to my working?</summary><p>Working Trace runs in your browser. Saving an attempt stores it on this device for your account. AI features ask for consent before sending your request to a provider.</p></details><details><summary>Can I use VertexED for another board?</summary><p>Core concepts can be useful across courses. Board tools cover several programmes, but reviewed content coverage varies. Check the stated programme and topic before relying on a resource.</p></details></div></section>
      <section className="product-invitation" id="beta"><p className="vh-kicker">Built around the next attempt</p><h2>Make room<br /><em>for understanding.</em></h2><p>Join the private beta and bring one topic you want to get right.</p><Link className="vh-primary" to="/signup">Join the private beta <ArrowUpRight size={18} aria-hidden /></Link><Link className="product-team-link" to="/about">Meet the people building VertexED <ArrowRight size={16} aria-hidden /></Link></section>
    </div>
  </>;
}
