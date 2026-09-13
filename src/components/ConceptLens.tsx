import { useId, useState } from 'react';

/** A real SVG-masked magnifier with an equivalent keyboard/touch control. */
export default function ConceptLens() {
  const maskId = useId().replace(/:/g, '');
  const [zoom, setZoom] = useState(true);
  const [point, setPoint] = useState({ x: 165, y: 150 });
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const graph = <><path d="M40 25V195H340" fill="none" stroke="currentColor" opacity=".3" /><path d="M50 40C75 125 150 165 330 170" fill="none" stroke="currentColor" strokeWidth="3" /></>;
  return <section id="concept-lens" className="vh-concept-lens" aria-labelledby="concept-lens-title">
    <div><p className="vh-kicker">Look closer / Original example</p><h2 id="concept-lens-title">Notice the change.<br /><em>Explain the why.</em></h2><p>A graph is more than a shape to remember. Inspect this cooling curve, describe what changes and connect the pattern to energy transfer.</p><button type="button" className="vh-secondary" aria-pressed={zoom} onClick={() => { setPoint({ x: 165, y: 150 }); setZoom(!zoom); }}>{zoom ? 'Show the whole curve' : 'Inspect the slope'}</button>
      <fieldset className="vh-lens-practice"><legend>Try it: when is cooling fastest?</legend>
        <label htmlFor="cooling-answer">Choose a part of the curve</label>
        <select id="cooling-answer" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }}><option value="">Choose an answer</option><option value="start">Near the start</option><option value="end">Near the end</option><option value="same">The rate stays the same</option></select>
        <button type="button" className="vh-secondary" disabled={!answer} onClick={() => setChecked(true)}>Check reasoning</button>
        {checked && <p role="status">{answer === 'start' ? 'Yes. ' : 'Look again at the start. '}The steeper downward slope means a faster fall in temperature. Under unchanged conditions, a hotter object loses energy faster when its temperature difference from its surroundings is greater.</p>}
        <details><summary>Connect it to everyday life</summary><p>A hot drink usually cools faster at first, then more slowly as it approaches room temperature. This sketch has no numerical scale, so it cannot give a cooling rate in degrees per minute.</p></details>
        <small>Original practice example. Your answer stays on this page and is not saved.</small>
      </fieldset>
    </div>
    <figure className="vh-lens-figure"><svg viewBox="0 0 380 230" role="img" aria-label="Illustrative cooling curve, falling steeply at first and flattening later. No numerical scale is specified." onPointerMove={event => {
      if (event.pointerType !== 'mouse' || !zoom) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setPoint({ x: Math.max(65, Math.min(315, (event.clientX - rect.left) / rect.width * 380)), y: Math.max(65, Math.min(165, (event.clientY - rect.top) / rect.height * 230)) });
    }}>
      <defs><mask id={maskId}><rect width="380" height="230" fill="black" /><circle cx={point.x} cy={point.y} r="57" fill="white" /></mask></defs>
      {graph}<text x="245" y="216" fill="currentColor" fontSize="14">Time</text><text x="47" y="20" fill="currentColor" fontSize="14">Temperature</text>
      {zoom && <g mask={`url(#${maskId})`}><rect width="380" height="230" fill="var(--paper)" /><g transform={`translate(${point.x} ${point.y}) scale(1.65) translate(${-point.x} ${-point.y})`}>{graph}</g></g>}
      {zoom && <circle cx={point.x} cy={point.y} r="57" fill="none" stroke="currentColor" strokeWidth="2" />}
    </svg>{zoom && <label className="vh-lens-range">Explore from start to finish<input type="range" min="65" max="315" value={point.x} onChange={event => { const x = Number(event.target.value); setPoint({ x, y: x < 110 ? 110 : 155 }); }} /></label>}<figcaption>{zoom ? '1.65× detail. Move your pointer or use the slider to explore.' : 'An illustrative trend, not measured experimental data.'}</figcaption></figure>
  </section>;
}
