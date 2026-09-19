import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import EncryptedText from './EncryptedText';
import { landingExampleForVisit, rememberLandingExample } from '@/lib/landingExampleRotation.mjs';

const examples = [
  { subject: 'English', topic: 'Authorial choices', prompt: 'How does the image of a locked door shape the reader’s view of the narrator?', attempt: 'It makes the narrator seem trapped.', review: 'Connect one precise detail to the effect, then to the wider tension in the passage.', retry: 'Explain how the image changes what the reader expects will happen next.', application: 'Use the same method to compare how two writers create uncertainty.' },
  { subject: 'Physics', topic: 'Forces', prompt: 'A cyclist moves at constant speed. What can you infer about the forces?', attempt: 'The forward force equals the resistive forces.', review: 'State that the resultant force is zero and connect this to constant velocity.', retry: 'Predict what changes when the cyclist starts accelerating.', application: 'Apply the force balance to a lift travelling at constant speed.' },
  { subject: 'Mathematics', topic: 'Functions', prompt: 'A taxi charges a fixed £3 plus £2 per kilometre. Model the fare.', attempt: 'f(x) = 2x + 3', review: 'Define x, state the currency and explain why the starting value is 3.', retry: 'What changes if the starting charge becomes £4?', application: 'Compare two pricing plans and find the distance at which their costs are equal.' },
  { subject: 'History', topic: 'Source evaluation', prompt: 'How useful is this diary entry for studying life during rationing?', attempt: 'It is useful because it was written at the time.', review: 'Use its content and origin, then identify one limit on what it can represent.', retry: 'Explain how purpose changes the value of the evidence.', application: 'Combine it with a government poster to build a more balanced inference.' },
  { subject: 'Chemistry', topic: 'Reaction rates', prompt: 'Why does a warmer reaction often proceed faster?', attempt: 'The particles have more energy.', review: 'Connect energy to the fraction of collisions that can overcome activation energy.', retry: 'Explain how a catalyst speeds up a reaction differently.', application: 'Use rate and energy ideas to compare industrial operating conditions.' },
  { subject: 'Biology', topic: 'Cell transport', prompt: 'Why does water enter a root hair cell?', attempt: 'Water enters by osmosis.', review: 'Name the direction of net movement and the partially permeable membrane.', retry: 'Explain the movement from soil to cell using water potential.', application: 'Use the same idea to explain why salty soil can make water uptake harder.' },
];

type RevisionHeroProps = { onExampleChange?: (index: number) => void };

export default function RevisionHero({ onExampleChange }: RevisionHeroProps) {
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
    <header><span>VERTEXED / <EncryptedText key={selected} text={example.topic.toUpperCase()} /></span><span>Illustrative workspace</span></header>
    <div className="revision-hero-body">
      <nav aria-label="Example subjects">{examples.map((item, index) => <button type="button" key={item.subject} aria-pressed={selected === index} onClick={() => selectExample(index)}><span>0{index + 1}</span>{item.subject}</button>)}</nav>
      <div className="revision-hero-sheet"><p className="vh-kicker">{example.subject} / {example.topic}</p><h2>{example.prompt}</h2><div className="revision-hero-answer" key={`${selected}-${stage}`} aria-live="polite"><span>{['Your first attempt', 'Look for the connection', 'Try it without help'][stage]}</span><p>{[example.attempt, example.review, example.retry][stage]}</p></div><div className="revision-hero-stages" role="group" aria-label="Revision card stages">{['Attempt', 'Review', 'Retry'].map((name, index) => <button type="button" key={name} aria-pressed={stage === index} onClick={() => setStage(index)}>{name}</button>)}</div></div>
      <aside><span>Beyond the paper</span><h3>Carry the idea further.</h3><p>{example.application}</p><Link to="/study-zone">Explore the study tools <ArrowUpRight size={16} aria-hidden /></Link><small>Example only. No learner work or marks are saved.</small></aside>
    </div>
    <footer><span>Understand → Practise → Apply → Return</span><button type="button" className="revision-question-next" onClick={showNextQuestion}>Another question <RefreshCw size={14} aria-hidden /></button></footer>
  </div>;
}
