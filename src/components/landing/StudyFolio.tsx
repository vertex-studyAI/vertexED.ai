import { useState } from 'react';
import { ArrowDownRight, Check, CornerDownRight } from 'lucide-react';

const stages = [
  { name: 'Attempt', title: 'Start with what you know.', text: 'Water enters the root hair cell by osmosis.', note: 'A useful start. What makes the water move into the cell?' },
  { name: 'Review', title: 'Find the missing connection.', text: 'Water moves from higher to lower water potential through a partially permeable membrane.', note: 'Connect the direction of movement to the soil and the cell.' },
  { name: 'Retry', title: 'Explain it without your notes.', text: 'Why does water move from the soil into a root hair cell?', note: 'Close the explanation. Make another attempt in your own words.' },
] as const;

/** A local, explicitly illustrative sequence. Never writes learner progress. */
export default function StudyFolio() {
  const [active, setActive] = useState(0);
  const stage = stages[active];
  return <div className="study-folio" aria-label="Example revision sequence">
    <div className="folio-orbit" aria-hidden><i/><i/><i/></div>
    <div className="folio-stack" data-float>
      <div className="folio-sheet-back" aria-hidden/>
      <div className="folio-sheet">
        <div className="folio-meta"><span>BIOLOGY / CELL TRANSPORT</span><span>Example</span></div>
        <div className="folio-heading"><span className="folio-number">0{active + 1}</span><ArrowDownRight size={30} aria-hidden/></div>
        <div className="folio-content" key={active} aria-live="polite" aria-atomic="true"><h2>{stage.title}</h2><p>{stage.text}</p><div className="folio-annotation"><CornerDownRight size={20} aria-hidden/><p>{stage.note}</p></div></div>
        <div className="folio-stages" role="group" aria-label="Explore the example stages">{stages.map((entry, index) => <button key={entry.name} type="button" aria-pressed={active === index} onClick={() => setActive(index)}><span>{index < active ? <Check size={12} aria-hidden/> : index + 1}</span>{entry.name}</button>)}</div>
      </div>
    </div>
    <p className="folio-caption">One topic. A clearer next attempt.<br/><span>Illustration only. Nothing is saved.</span></p>
  </div>;
}
