import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import AccessibleModal from '@/components/AccessibleModal';
import EncryptedText from './EncryptedText';
import StudyField from './StudyField';
import '@/styles/study-gallery.css';

const examples = [
  { title: 'Keep the structure visible.', subject: 'Mathematics / IB AA calculus', kind: 'Worked method', question: 'Differentiate f(x) = x(3x² + 1)⁵e⁻ˣ, then factor the result.', hint: 'There are three multiplied factors. Differentiate each locally before combining the product-rule terms.', answer: 'f′(x) = e⁻ˣ(3x² + 1)⁴[(3x² + 1)(1 − x) + 30x²]. Keeping the common factors visible makes the chain-rule contribution and possible stationary points easier to inspect.', transfer: 'Which factors can never be zero for real x, and what equation is left for the stationary points?', next: '/paper-maker', action: 'Create more practice', symbol: 'f′' },
  { title: 'Resolve before you substitute.', subject: 'Physics / Circular motion', kind: 'Derivation', question: 'A mass moves in a vertical circle. With θ measured from the downward vertical, derive its radial and tangential equations.', hint: 'Draw an inward radial axis and a tangent in the direction of increasing θ. Resolve weight only after the axes are fixed.', answer: 'The inward radial component of weight is −mg cos θ, so T − mg cos θ = mv²/r. The tangential component is −mg sin θ, so m dv/dt = −mg sin θ. One equation tracks the changing direction; the other tracks the changing speed.', transfer: 'Use the equations to explain why the greatest tension cannot be identified from position alone without considering speed.', next: '/answer-reviewer', action: 'Review your derivation', symbol: 'ΣF' },
  { title: 'Explain the connection.', subject: 'Biology / Cell transport', kind: 'Retrieval check', question: 'Why might a plant lose water when surrounded by a very concentrated salt solution?', hint: 'Compare water potential inside and outside the cell. Name the membrane involved.', answer: 'The concentrated solution has a lower water potential. Water moves out of cells by osmosis through partially permeable membranes, reducing turgor. The plant can wilt.', transfer: 'Explain why watering a plant is not always enough if salts have built up in the soil.', next: '/answer-reviewer', action: 'Review your own answer', symbol: 'H₂O' },
  { title: 'Make the evidence count.', subject: 'History / Source analysis', kind: 'Argument practice', question: 'A speech promises rapid economic recovery. Does it prove that recovery happened?', hint: 'Separate a source’s purpose from evidence about the outcome.', answer: 'No. The speech can show what its author wanted an audience to believe, but the claim needs corroboration. Compare it with economic data and independent accounts from the relevant period.', transfer: 'Write one sentence explaining what the speech is useful for, and one explaining a limitation.', next: '/study-notebook', action: 'Open your study notebook', symbol: 'Aa' },
  { title: 'Separate position from rate.', subject: 'Chemistry / Equilibrium', kind: 'Concept distinction', question: 'For N₂O₄(g) ⇌ 2NO₂(g), what changes when pressure increases at constant temperature?', hint: 'Count the gas particles on each side, then ask whether pressure or temperature controls Kc.', answer: 'The equilibrium position shifts towards N₂O₄ because that side has fewer gas particles. The equilibrium composition changes, but Kc does not change because the temperature is constant.', transfer: 'Explain why adding a catalyst changes the time taken to reach equilibrium but not the equilibrium composition.', next: '/chatbot', action: 'Ask Apex a follow-up', symbol: 'Kc' },
  { title: 'Test the intervention.', subject: 'Economics / Market failure', kind: 'Model and evaluate', question: 'Demand is P = 120 − 2Q and supply is P = 20 + Q. Is a price ceiling at P = 60 binding?', hint: 'Find the market equilibrium first. A ceiling only changes the outcome if it is below the equilibrium price.', answer: 'Equilibrium gives Q = 100/3 and P = 160/3. Since 60 is above the equilibrium price, the ceiling is not binding and creates no shortage in this model.', transfer: 'Derive the ceiling price that would create a shortage of 15 units, then name one limitation of the linear model.', next: '/paper-maker', action: 'Create an economics set', symbol: 'P∩Q' },
];

export default function StudyGallery({ enabled = true }: { enabled?: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const workingRef = useRef<HTMLTextAreaElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [working, setWorking] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const lastTrail = useRef(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const clear = () => { clearTimeout(clearTimer.current); setTrail([]); };
    if (!enabled) clear();
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('blur', clear); document.addEventListener('visibilitychange', clear); query.addEventListener('change', clear);
    return () => { clearTimeout(clearTimer.current); window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear); query.removeEventListener('change', clear); };
  }, [enabled]);
  const item = selected === null ? null : examples[selected];
  const close = () => { setSelected(null); setWorking(''); setShowAnswer(false); };
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * .75, behavior: !enabled || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  return <section className="study-gallery" id="study-examples" aria-labelledby="study-gallery-title" data-reveal>
    <header onPointerMove={event => {
      if (!enabled || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (forced-colors: active)').matches) return;
      const now = performance.now();
      if (now - lastTrail.current < 140) return;
      lastTrail.current = now;
      const bounds = event.currentTarget.getBoundingClientRect();
      setTrail(previous => [...previous.slice(-3), { x: event.clientX - bounds.left, y: event.clientY - bounds.top, id: now }]);
      clearTimeout(clearTimer.current); clearTimer.current = setTimeout(() => setTrail([]), 800);
    }} onPointerLeave={() => setTrail([])}>
      <StudyField enabled={enabled} />
      <div className="study-gallery-trail" aria-hidden="true"><svg className="study-gallery-tail"><polyline points={trail.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>{trail.map(point => <img key={point.id} src="/companions/apex-paper-v3.png" alt="" style={{ left: point.x, top: point.y }} />)}</div>
      <p className="vh-kicker"><EncryptedText enabled={enabled} text="OPEN A QUESTION / FOLLOW THE REASONING" /></p>
      <h2 id="study-gallery-title">Less passive reading.<br /><em>More working it out.</em></h2>
      <p>Choose an original example. Try it, ask for a hint and compare your reasoning. Then take the idea into a different context.</p>
    </header>
    <div className="study-gallery-controls"><span>Original examples. No account required.</span><div><button type="button" aria-label="Previous study cards" onClick={() => scroll(-1)}><ArrowLeft /></button><button type="button" aria-label="Next study cards" onClick={() => scroll(1)}><ArrowRight /></button></div></div>
    <div ref={rail} className="study-gallery-rail" aria-label="Study example cards">{examples.map((example, index) => <button key={example.title} type="button" className="study-gallery-card" data-float onPointerEnter={event => {
      const box = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5; const y = (event.clientY - box.top) / box.height - .5;
      event.currentTarget.dataset.entry = Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'top' : 'bottom');
    }} onClick={() => { setSelected(index); setWorking(''); setShowAnswer(false); }}>
      <span className="study-gallery-card-top">0{index + 1} / {example.kind}</span><span className="study-gallery-symbol" aria-hidden="true">{example.symbol}</span><span className="study-gallery-subject">{example.subject}</span><strong>{example.title}</strong><span className="study-gallery-question">{example.question}</span><span className="study-gallery-open">Try this question <ArrowRight aria-hidden="true" /></span>
    </button>)}</div>
    {item && <AccessibleModal titleId="study-example-title" descriptionId="study-example-description" initialFocusRef={workingRef} onClose={close} overlayClassName="study-example-overlay" className="study-example-dialog">
      <button type="button" className="study-example-close" aria-label="Close study example" onClick={close}><X aria-hidden /></button>
      <p className="study-example-meta">{item.subject} / Original example</p><h2 id="study-example-title">{item.title}</h2><p>{item.question}</p>
      <p id="study-example-description" className="sr-only">Original practice example. Your working is temporary and clears when this dialog closes. Press Escape to close.</p>
      <label htmlFor="study-example-working">Your reasoning</label><textarea ref={workingRef} id="study-example-working" rows={4} value={working} maxLength={3000} onChange={event => setWorking(event.target.value)} placeholder="Try the first step before opening the explanation." />
      <details><summary>Give me a hint</summary><p>{item.hint}</p></details>
      <button className="study-example-action" type="button" onClick={() => setShowAnswer(value => !value)} aria-expanded={showAnswer}>{showAnswer ? 'Hide explanation' : 'Compare with the explanation'}</button>
      {showAnswer && <div className="study-example-answer"><p>{item.answer}</p><h3>Use it somewhere new</h3><p>{item.transfer}</p></div>}
      <Link className="study-example-next" to={item.next}>{item.action} <ArrowRight aria-hidden="true" /></Link><small>Practice only, not an official exam question or a marked assessment. Your working is temporary and clears when this example closes.</small>
    </AccessibleModal>}
  </section>;
}
