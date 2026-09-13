import { useId, useState } from 'react';

/** A real SVG-masked magnifier with an equivalent keyboard/touch control. */
export default function ConceptLens() {
  const maskId = useId().replace(/:/g, '');
  const [zoom, setZoom] = useState(false);
  const [point, setPoint] = useState({ x: 165, y: 150 });
  const graph = <><path d="M40 25V195H340" fill="none" stroke="currentColor" opacity=".3" /><path d="M50 40C75 125 150 165 330 170" fill="none" stroke="currentColor" strokeWidth="3" /></>;
  return <section className="vh-concept-lens" aria-labelledby="concept-lens-title">
    <div><p className="vh-kicker">Look closer / Original example</p><h2 id="concept-lens-title">A small detail.<br /><em>A clearer explanation.</em></h2><p>Move the lens across this illustrative cooling curve. Its slope is steeper at first, then becomes gentler. Describe that change before explaining it.</p><button type="button" className="vh-secondary" aria-pressed={zoom} onClick={() => { setPoint({ x: 165, y: 150 }); setZoom(!zoom); }}>{zoom ? 'Show the whole curve' : 'Inspect the slope'}</button></div>
    <figure className="vh-lens-figure"><svg viewBox="0 0 380 230" role="img" aria-label="Illustrative cooling curve, falling steeply at first and flattening later. No numerical scale is specified." onPointerMove={event => {
      if (event.pointerType !== 'mouse' || !zoom) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setPoint({ x: Math.max(65, Math.min(315, (event.clientX - rect.left) / rect.width * 380)), y: Math.max(65, Math.min(165, (event.clientY - rect.top) / rect.height * 230)) });
    }}>
      <defs><mask id={maskId}><rect width="380" height="230" fill="black" /><circle cx={point.x} cy={point.y} r="57" fill="white" /></mask></defs>
      {graph}<text x="245" y="216" fill="currentColor" fontSize="11">Time</text><text x="47" y="20" fill="currentColor" fontSize="11">Temperature</text>
      {zoom && <g mask={`url(#${maskId})`}><rect width="380" height="230" fill="var(--paper)" /><g transform={`translate(${point.x} ${point.y}) scale(1.65) translate(${-point.x} ${-point.y})`}>{graph}</g></g>}
      {zoom && <circle cx={point.x} cy={point.y} r="57" fill="none" stroke="currentColor" strokeWidth="2" />}
    </svg><figcaption>{zoom ? '1.65× detail. Move your pointer to explore, or use the button to return.' : 'An illustrative trend, not measured experimental data.'}</figcaption></figure>
  </section>;
}
