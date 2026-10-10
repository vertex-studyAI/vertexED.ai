import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import EncryptedText from './EncryptedText';
import { landingExampleForVisit, rememberLandingExample } from '@/lib/landingExampleRotation.mjs';

const examples = [
  { subject: 'English', topic: 'Authorial choices', prompt: 'How does the image of a locked door shape the reader’s view of the narrator?', attempt: 'It makes the narrator seem trapped.', review: 'Connect one precise detail to the effect, then to the wider tension in the passage.', retry: 'Explain how the image changes what the reader expects will happen next.', application: 'Use the same method to compare how two writers create uncertainty.' },
  { subject: 'Physics', topic: 'Non-uniform circular motion', prompt: 'With θ measured from the downward vertical, why do mg cos θ and mg sin θ appear in different equations of motion?', attempt: 'The weight is split into radial and tangential components.', review: 'Choose the axes first. The inward radial equation is T − mg cos θ = mv²/r, while the tangential equation is m dv/dt = −mg sin θ.', retry: 'At the side of the circle, which weight component changes the speed and which changes the direction?', application: 'Use both equations to compare speed, radial acceleration and tension at the bottom, side and top.' },
  { subject: 'Mathematics', topic: 'Calculus', prompt: 'Differentiate f(x) = x(3x² + 1)⁵e⁻ˣ without expanding it.', attempt: 'Use the product rule, but keep the nested power visible.', review: 'Treat the expression as three factors. The middle factor contributes 30x(3x² + 1)⁴ through the chain rule.', retry: 'Factor the derivative so the product, chain and exponential contributions remain visible.', application: 'Use the factored derivative to decide which factors can produce real stationary points.' },
  { subject: 'History', topic: 'Source evaluation', prompt: 'How useful is this diary entry for studying life during rationing?', attempt: 'It is useful because it was written at the time.', review: 'Use its content and origin, then identify one limit on what it can represent.', retry: 'Explain how purpose changes the value of the evidence.', application: 'Combine it with a government poster to build a more balanced inference.' },
  { subject: 'Chemistry', topic: 'Reaction rates', prompt: 'Why does a warmer reaction often proceed faster?', attempt: 'The particles have more energy.', review: 'Connect energy to the fraction of collisions that can overcome activation energy.', retry: 'Explain how a catalyst speeds up a reaction differently.', application: 'Use rate and energy ideas to compare industrial operating conditions.' },
  { subject: 'Biology', topic: 'Gene expression', prompt: 'A point mutation changes one codon but not the amino acid. Explain why the phenotype may remain unchanged.', attempt: 'The genetic code is degenerate, so more than one codon can specify the same amino acid.', review: 'Connect the unchanged primary structure to folding and function, while acknowledging that RNA processing or expression can still be affected.', retry: 'What evidence would you need before calling the mutation neutral?', application: 'Compare this case with a missense mutation in an enzyme active site.' },
  { subject: 'Economics', topic: 'Market intervention', prompt: 'Demand is P = 120 − 2Q and supply is P = 20 + Q. Derive the equilibrium and analyse a price ceiling at P = 60.', attempt: 'Set demand equal to supply, then compare quantities demanded and supplied at the ceiling.', review: 'The equilibrium is Q = 100/3 and P = 160/3, so a ceiling at 60 is not binding. Its legal maximum is above equilibrium.', retry: 'Find a ceiling that creates a shortage of 15 units and show the working.', application: 'Explain why the size of a shortage alone does not measure the full welfare effect.' },
  { subject: 'Computer Science', topic: 'Algorithmic complexity', prompt: 'A nested loop halves its inner problem size each pass. Why is the total work not automatically O(n²)?', attempt: 'The inner loop length changes, so count the series instead of multiplying two worst-case bounds.', review: 'Write the actual sum and identify whether it is arithmetic, geometric or harmonic before simplifying.', retry: 'Compare Σ n/2ᵏ with Σ(n − k) and explain why their growth differs.', application: 'Use the same method to analyse divide-and-conquer work across recursion levels.' },
];

type RevisionHeroProps = { onExampleChange?: (index: number) => void; enabled?: boolean };

export default function RevisionHero({ onExampleChange, enabled = true }: RevisionHeroProps) {
  const [selected, setSelected] = useState(() => landingExampleForVisit(window, examples.length));
  const [stage, setStage] = useState(0);
  const example = examples[selected];
  useEffect(() => onExampleChange?.(selected), [onExampleChange, selected]);
  const selectExample = (index: number) => {
    setSelected(index);
    setStage(0);
    rememberLandingExample(window, index, examples.length);
  };
  const showNextQuestion = () => selectExample((selected + 1) % examples.length);
  return <div className="revision-hero-card" data-float aria-label="Example revision workspace">
    <header><span>VERTEXED / <EncryptedText key={selected} enabled={enabled} text={example.topic.toUpperCase()} /></span><span>Illustrative workspace</span></header>
    <div className="revision-hero-body">
      <nav aria-label="Example subjects">{examples.map((item, index) => <button type="button" key={item.subject} aria-pressed={selected === index} onClick={() => selectExample(index)}><span>0{index + 1}</span>{item.subject}</button>)}</nav>
      <div className="revision-hero-sheet"><p className="vh-kicker">{example.subject} / {example.topic}</p><h2>{example.prompt}</h2><div className="revision-hero-answer" key={`${selected}-${stage}`} aria-live="polite"><span>{['Your first attempt', 'Look for the connection', 'Try it without help'][stage]}</span><p>{[example.attempt, example.review, example.retry][stage]}</p></div><div className="revision-hero-stages" role="group" aria-label="Revision card stages">{['Attempt', 'Review', 'Retry'].map((name, index) => <button type="button" key={name} aria-pressed={stage === index} onClick={() => setStage(index)}>{name}</button>)}</div></div>
      <aside><span>Beyond the paper</span><h3>Carry the idea further.</h3><p>{example.application}</p><Link to="/study-zone">Explore the study tools <ArrowUpRight size={16} aria-hidden /></Link><small>Example only. No learner work or marks are saved.</small></aside>
    </div>
    <footer><span>Understand → Practise → Apply → Return</span><button type="button" className="revision-question-next" onClick={showNextQuestion}>Another question <RefreshCw size={14} aria-hidden /></button></footer>
  </div>;
}
