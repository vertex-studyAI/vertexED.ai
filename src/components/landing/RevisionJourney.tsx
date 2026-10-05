import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowRight, RotateCcw } from 'lucide-react';
import VoiceOrb from './VoiceOrb';

const steps = [
  { name: 'Attempt', title: 'Start with what you know.', text: 'Write the method before looking at the answer. Give yourself something concrete to review.', note: 'Water moves out of the plant cell.', tag: 'An original biology example', href: '/paper-maker', action: 'Make a practice paper' },
  { name: 'Review', title: 'Find the missing connection.', text: 'Name the relationship your answer needs. Keep the first attempt beside the explanation.', note: 'Connect the movement to a lower water potential outside the cell.', tag: 'The gap in this explanation', href: '/answer-reviewer', action: 'Open Answer Reviewer' },
  { name: 'Retry', title: 'Try a different context.', text: 'Put the explanation away. Use the idea again, then decide what needs another look.', note: 'Why can salt in the soil make a plant wilt?', tag: 'A new question, the same idea', href: '/planner', action: 'Plan your next attempt' },
];

export default function RevisionJourney({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0, visible = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * .2 - rect.top) / Math.max(1, rect.height - innerHeight * .8)));
      const animate = enabled && !reduce.matches && innerWidth > 700;
      element.style.setProperty('--journey', String(animate ? progress : 0));
      if (animate && !manual && !element.contains(document.activeElement)) setStage(Math.min(2, Math.floor(progress * 3)));
      const clip = video.current;
      if (animate && clip && mediaReady && Number.isFinite(clip.duration) && !clip.seeking) {
        const target = Math.min(clip.duration - .04, progress * clip.duration);
        if (Math.abs(clip.currentTime - target) > .08) clip.currentTime = target;
      }
    };
    const scroll = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) update(); else { cancelAnimationFrame(frame); frame = 0; } });
    observer.observe(element); update();
    window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', update); reduce.addEventListener('change', update);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', update); reduce.removeEventListener('change', update); };
  }, [enabled, manual, mediaReady]);
  const item = steps[stage];
  return <>
    <section ref={root} className="motion-journey" id="revision-journey" aria-labelledby="motion-journey-title" data-motion={enabled ? 'on' : 'off'}>
      <div className="motion-journey-sticky">
        <header><p className="vh-kicker">One question. Three ways forward.</p><h2 id="motion-journey-title">Keep the idea.<br /><em>Change the attempt.<span className="motion-text-sparkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i></span></em></h2><p>Follow an illustrative revision trace. Scroll to move through it, or choose a stage. Nothing here is saved.</p></header>
        <div className="motion-journey-stage">
          <video className="motion-journey-video" ref={video} src="/media/revision-trace.webm" poster="/media/revision-trace-poster.svg" muted playsInline preload="metadata" aria-hidden="true" onLoadedMetadata={() => setMediaReady(true)} onError={() => setMediaReady(false)} />
          <div className="motion-orbit" role="group" aria-label="Revision journey stages">
            <svg viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="143" /><path key={stage} className="motion-beam" d={['M 200 57 Q 370 100 325 271', 'M 325 271 Q 200 395 76 271', 'M 76 271 Q 28 100 200 57'][stage]} /></svg>
            <div className="motion-orbit-centre"><span>ONE IDEA</span><strong>{String(stage + 1).padStart(2, '0')}</strong><span>{item.name}</span></div>
            {steps.map((step, index) => <button key={step.name} type="button" className={`motion-orbit-node motion-orbit-node-${index}`} aria-pressed={stage === index} onClick={() => { setManual(true); setStage(index); setReveal(false); }}><span>0{index + 1}</span>{step.name}</button>)}
          </div>
          <article className="motion-journey-sheet" data-float>
            <span>{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><blockquote key={stage}>{item.note}</blockquote>
            <div className="motion-reveal-card" data-revealed={reveal} onPointerMove={event => {
              if (!enabled || event.pointerType !== 'mouse') return;
              const bounds = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty('--reveal-x', `${event.clientX - bounds.left}px`);
              event.currentTarget.style.setProperty('--reveal-y', `${event.clientY - bounds.top}px`);
            }}><span>Make the relationship explicit.</span><span className="motion-reveal-ink" aria-hidden="true">Movement → water potential → membrane.</span><strong>Movement → water potential → membrane.</strong><button type="button" aria-expanded={reveal} onClick={() => setReveal(value => !value)}>{reveal ? 'Hide the connection' : 'Reveal the connection'}</button></div>
            <Link to={item.href}>{item.action} <ArrowRight size={16} aria-hidden /></Link>
          </article>
        </div>
        <div className="motion-journey-footer"><span>Example only. No marks or learner progress.</span>{manual && <button type="button" onClick={() => setManual(false)}><RotateCcw size={14} aria-hidden /> Follow scroll again</button>}</div>
      </div>
    </section>
    <section className="motion-tools" aria-labelledby="motion-tools-title" data-motion={enabled ? 'on' : 'off'}>
      <div className="motion-tools-intro"><p className="vh-kicker">The work between attempts</p><h2 id="motion-tools-title">Pick up the thread.</h2><p>Keep the source close, make room for a question and return to your next step.</p></div>
      <div className="motion-image-stream">{[
        { image: '/notes.png', label: 'Study Notebook', text: 'Keep the source beside your thinking.', href: '/study-notebook' },
        { image: '/mockpaper.png', label: 'Paper Maker', text: 'Put a topic into an original practice question.', href: '/paper-maker' },
        { image: '/studyplanner.png', label: 'Study Planner', text: 'Make space to come back to the difficult step.', href: '/planner' },
      ].map((tool, index) => <Link key={tool.label} to={tool.href} className="motion-image-card" data-float style={{ '--card-index': index } as CSSProperties}><div className="motion-image-art"><img src={tool.image} alt="" loading="lazy" /><span aria-hidden="true">0{index + 1}</span><div className="motion-image-ripple" /></div><h3>{tool.label}</h3><p>{tool.text}</p><span className="motion-image-link">Open tool <ArrowRight size={16} aria-hidden /></span></Link>)}</div>
      <div className="motion-image-badge" tabIndex={0} aria-label="Notes, practice and a planned return"><div aria-hidden="true"><img src="/notes.png" alt="" /><img src="/mockpaper.png" alt="" /><img src="/studyplanner.png" alt="" /></div><span>One connected study workspace.</span></div>
      <VoiceOrb enabled={enabled} />
    </section>
  </>;
}
