import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Timer, FileText, NotebookPen, MessageCircle, Layers, X, Plus } from 'lucide-react';
import { LANDING_FEATURES } from '@/content/landing';
import AccessibleModal from '@/components/AccessibleModal';

const icons = [Layers, CalendarDays, Timer, FileText, NotebookPen, Layers, MessageCircle];

function ToolPreview({ href }: { href: string }) {
  if (href === '/exam-prep') return <div className="tool-preview preview-session"><span className="preview-label">Example session</span><strong>45<span> min</span></strong><div className="preview-time-split"><i/><i/><i/></div><p>Recall <span>Practise</span> Review</p></div>;
  if (href === '/planner') return <div className="tool-preview preview-plan"><span className="preview-label">Example study blocks</span><div><span>MON</span><strong>Cell transport</strong></div><div><span>TUE</span><strong>Exam-style questions</strong></div><div><span>WED</span><strong>Review the gaps</strong></div></div>;
  if (href === '/study-zone') return <div className="tool-preview preview-focus"><span className="preview-label">Example focus timer</span><strong>25<span>:</span>00</strong><p>One topic. Notes beside you.</p></div>;
  if (href === '/paper-maker') return <div className="tool-preview preview-paper"><span className="preview-label">Example question</span><strong><span>01</span> Cell transport</strong><p>Explain water uptake in a root hair cell.</p><span className="preview-note">Your working belongs here.</span></div>;
  if (href === '/answer-reviewer') return <div className="tool-preview preview-review"><span className="preview-label">Example feedback</span><p>“Water enters by osmosis.”</p><strong>↳ Explain the direction.</strong><span className="preview-note">Check the gradient and membrane.</span></div>;
  if (href === '/notetaker') return <div className="tool-preview preview-recall"><span className="preview-label">Example recall prompt</span><strong>What does<br/>osmosis describe?</strong><p>Think first. Check your notes.</p></div>;
  return <div className="tool-preview preview-apex"><span className="preview-label">Example topic prompt</span><p>Help me understand water potential.</p><strong>Ask about the step<br/>you cannot explain.</strong></div>;
}
export default function ToolGallery({ effects }: { effects: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const previousDetail = useRef<HTMLButtonElement>(null);
  const nextDetail = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [position, setPosition] = useState(0);
  const modalOpen = selected !== null;
  const item = selected === null ? null : LANDING_FEATURES[selected];
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
      const cards = Array.from(el.querySelectorAll('article'));
      const left = el.getBoundingClientRect().left;
      const firstVisible = cards.findIndex(card => card.getBoundingClientRect().right > left + 40);
      setPosition(Math.max(0, firstVisible));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el); el.addEventListener('scroll', measure, { passive: true }); measure();
    return () => { observer.disconnect(); el.removeEventListener('scroll', measure); };
  }, []);
  useEffect(() => {
    if (!modalOpen) return;
    const main = document.getElementById('root');
    const wasInert = main?.inert;
    const overflow = document.body.style.overflow;
    if (main) main.inert = true;
    document.body.style.overflow = 'hidden';
    return () => { if (main) main.inert = wasInert ?? false; document.body.style.overflow = overflow; };
  }, [modalOpen]);
  const scroll = (direction: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * ((el.querySelector('article')?.clientWidth || el.clientWidth) + 24), behavior: effects && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
  };
  const browseDetail = (direction: number) => {
    if (selected === null) return;
    const next = Math.max(0, Math.min(LANDING_FEATURES.length - 1, selected + direction));
    // Move focus before the clicked boundary button becomes disabled.
    if (next === 0) nextDetail.current?.focus();
    else if (next === LANDING_FEATURES.length - 1) previousDetail.current?.focus();
    setSelected(next);
  };
  return <>
    <div className="gallery-controls"><p>Choose a tool. Keep the same topic.</p><div><span className="gallery-position" aria-label={`First visible tool: ${position + 1} of ${LANDING_FEATURES.length}`}>{String(position + 1).padStart(2, '0')}<span> / {String(LANDING_FEATURES.length).padStart(2, '0')}</span></span><button type="button" aria-label="Previous tools" disabled={edges.start} onClick={() => scroll(-1)}><ArrowLeft size={18}/></button><button type="button" aria-label="Next tools" disabled={edges.end} onClick={() => scroll(1)}><ArrowRight size={18}/></button></div></div>
    <div className="tool-gallery" ref={track} aria-label="Study tools" role="region" tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); scroll(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: 'instant' });
      }
    }}>
      {LANDING_FEATURES.map((feature, index) => {
        const Icon = icons[index];
        return <article className="tool-card" key={feature.href} data-float>
          <div className="tool-card-top"><span>{String(index + 1).padStart(2, '0')} / {feature.loop}</span><Icon size={24} strokeWidth={1.5} aria-hidden/></div>
          <ToolPreview href={feature.href}/>
          <h3>{feature.title}</h3><p>{feature.desc}</p>
          <div className="tool-card-actions"><Link to={feature.href} aria-label={`Open ${feature.title}`}>Open tool <ArrowUpRight size={17}/></Link><button type="button" aria-label={`About ${feature.title}`} onClick={() => setSelected(index)}><Plus size={20}/></button></div>
        </article>;
      })}
    </div>
    {item && <AccessibleModal titleId="tool-detail-title" descriptionId="tool-detail-description" onClose={() => setSelected(null)} overlayClassName={`landing-modal-backdrop ${effects ? 'with-effects' : ''}`} className="landing-tool-modal">
      <button type="button" className="modal-close" aria-label="Close tool details" onClick={() => setSelected(null)}><X size={20}/></button>
      <p className="section-kicker">VertexED / {item.loop}</p>
      <div className="tool-detail-layout" key={item.href}>
        <div className="tool-detail-sample"><ToolPreview href={item.href}/><span className="landing-fineprint">Example only. No account progress is recorded.</span></div>
        <div className="tool-detail-copy"><h2 id="tool-detail-title">{item.title}</h2><p id="tool-detail-description">{item.side}</p>
          <Link className="landing-primary" to={item.href}>Open {item.title} <ArrowUpRight size={18}/></Link>
        </div>
      </div>
      <div className="tool-detail-navigation"><button ref={previousDetail} type="button" aria-label="Previous tool detail" disabled={selected === 0} onClick={() => browseDetail(-1)}><ArrowLeft size={18}/> Previous</button><span role="status">{(selected ?? 0) + 1} / {LANDING_FEATURES.length}</span><button ref={nextDetail} type="button" aria-label="Next tool detail" disabled={selected === LANDING_FEATURES.length - 1} onClick={() => browseDetail(1)}>Next <ArrowRight size={18}/></button></div>
      <p className="landing-fineprint">Study tools require an account. AI-generated content needs checking against your course materials.</p>
    </AccessibleModal>}
  </>;
}
