import { useState } from 'react';

export default function ComplexPlane() {
  const [x, setX] = useState(3), [y, setY] = useState(2);
  const [checked, setChecked] = useState(false);
  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const scale = Math.min(bounds.width, bounds.height) / 240;
    const left = bounds.left + (bounds.width - 240 * scale) / 2;
    const top = bounds.top + (bounds.height - 240 * scale) / 2;
    setX(Math.max(-5, Math.min(5, Math.round((e.clientX - left - 120 * scale) / (20 * scale) * 10) / 10)));
    setY(Math.max(-5, Math.min(5, Math.round((120 * scale - e.clientY + top) / (20 * scale) * 10) / 10)));
  };
  return <section className="learning-experiment" aria-label="Complex plane exploration">
    <h3>Move a complex number</h3><p>Drag the point or use the sliders. Exploration does not change your mastery record.</p>
    <svg viewBox="0 0 240 240" role="img" aria-label={'Complex plane: real ' + x + ', imaginary ' + y} style={{ touchAction: 'none' }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); move(e); }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e); }}>
      <path d="M20 120H220M120 20V220" stroke="currentColor" fill="none" />
      <text x="211" y="139">Re</text><text x="126" y="22">Im</text>
      <line x1="120" y1="120" x2={120 + x * 20} y2={120 - y * 20} stroke="hsl(var(--primary))" strokeWidth="3" />
      <circle cx={120 + x * 20} cy={120 - y * 20} r="7" fill="hsl(var(--primary))" />
    </svg>
    <label>Real part: {x}<input type="range" min="-5" max="5" step="0.1" value={x} onChange={e => setX(Number(e.target.value))} /></label>
    <label>Imaginary part: {y}<input type="range" min="-5" max="5" step="0.1" value={y} onChange={e => setY(Number(e.target.value))} /></label>
    <p>Modulus |z| = {Math.hypot(x, y).toFixed(2)} · Argument = {x === 0 && y === 0 ? 'undefined at zero' : (Math.atan2(y, x) * 180 / Math.PI).toFixed(1) + '°'}</p>
    <p>Keep the imaginary part fixed and change the sign of the real part. What stays the same?</p>
    <button onClick={() => setChecked(!checked)} aria-expanded={checked}>Check the relationship</button>
    {checked && <p>The modulus stays the same because x² + y² is unchanged. The argument generally changes: the point reflects across the imaginary axis.</p>}
  </section>;
}
