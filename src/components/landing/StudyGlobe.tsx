import { useMemo, useState } from 'react';

/** A projected sphere of ideas, not a map of users or fabricated geographic reach. */
export default function StudyGlobe({ enabled }: { enabled: boolean }) {
  const [rotation, setRotation] = useState(25);
  const points = useMemo(() => Array.from({ length: 150 }, (_, i) => {
    const y = 1 - 2 * (i + .5) / 150;
    const radius = Math.sqrt(1 - y * y), angle = i * 2.39996 + rotation * Math.PI / 180;
    return { x: radius * Math.cos(angle), y, z: radius * Math.sin(angle) };
  }), [rotation]);
  return <div className="motion-globe">
    <svg viewBox="0 0 500 360" role="img" aria-label="An illustrative globe of connected ideas">
      <defs><radialGradient id="study-globe-light" cx="35%" cy="25%"><stop stopColor="#335fab" /><stop offset="1" stopColor="#071631" /></radialGradient></defs>
      <circle cx="250" cy="174" r="135" fill="url(#study-globe-light)" stroke="#8bb9ff" strokeOpacity=".5" />
      <ellipse cx="250" cy="174" rx="176" ry="54" fill="none" stroke="#719de5" opacity=".5" transform="rotate(-25 250 174)" />
      {points.map((p, i) => <circle key={i} cx={250 + p.x * 134} cy={174 + p.y * 134} r={p.z > 0 ? 2.1 : 1.1} fill="#b2d2ff" opacity={p.z > 0 ? .4 + p.z * .6 : .13} />)}
      {[12, 37, 72].map((index, i) => { const p = points[index]; return <path key={index} className={enabled ? 'motion-globe-arc' : ''} d={`M ${250 + p.x * 134} ${174 + p.y * 134} Q ${120 + i * 100} ${10 + i * 20} 345 180`} fill="none" stroke="#deedff" strokeWidth="1.5" />; })}
    </svg>
    <label>Rotate the concept globe<input type="range" min="0" max="360" value={rotation} onChange={event => setRotation(Number(event.target.value))} /></label>
  </div>;
}
