import { useState, type CSSProperties } from 'react';

export default function AnswerCompare() {
  const [amount, setAmount] = useState(50);
  const [both, setBoth] = useState(true);
  return <div className="answer-compare">
    <div className="compare-heading"><span>Biology / Cell transport</span><button type="button" aria-pressed={both} onClick={() => setBoth(!both)}>{both ? 'Use slider' : 'Read both answers'}</button></div>
    <div className="compare-sheets" data-both={both} style={{ '--reveal': `${amount}%` } as CSSProperties}>
      <article className="compare-original"><span className="section-kicker">First attempt</span><h3>What explains the movement?</h3><p>Water enters the root hair cell by osmosis.</p><div className="compare-note">The process is named. The explanation is still missing.</div></article>
      <article className="compare-revised"><span className="section-kicker">After review</span><h3>Connect the two ideas.</h3><p>Water moves from <mark>higher to lower water potential</mark> through a <mark>partially permeable membrane</mark>.</p><div className="compare-note">Describe the direction. Name the membrane.</div></article>
      {!both && <div className="compare-divider" aria-hidden><span>↔</span></div>}
    </div>
    {!both && <label className="compare-range">Reveal the revised answer<input type="range" min="0" max="100" value={amount} onChange={event => setAmount(Number(event.target.value))} aria-valuetext={`${amount}% of the revised answer revealed`} /></label>}
    <p className="landing-fineprint">Illustrative revision, not a marked student submission. Check explanations against your course materials.</p>
  </div>;
}
