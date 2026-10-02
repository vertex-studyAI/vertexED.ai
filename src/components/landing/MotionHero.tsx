import { lazy, Suspense, useState } from 'react';
import { ArrowDown, Pause, Play, SlidersHorizontal } from 'lucide-react';
import { sceneStyles } from './motionShaders';
import ShaderCanvas from './ShaderCanvas';
import SplineStudyScene from './SplineStudyScene';
import { splineSceneUrl } from './splineSceneUrl';
const StudyGlobe = lazy(() => import('./StudyGlobe'));
const ParticleWord = lazy(() => import('./ParticleWord'));

export default function MotionHero({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  const [style, setStyle] = useState(0);
  const [strength, setStrength] = useState(1);
  const [pulse, setPulse] = useState(0);
  const [turn, setTurn] = useState(0);
  const splineUrl = splineSceneUrl(import.meta.env.VITE_LANDING_SPLINE_URL);
  return <div className="motion-hero" data-motion={enabled ? 'on' : 'off'}>
    <div className="motion-hero-window">
      {style < sceneStyles.length ? <ShaderCanvas mode={style} enabled={enabled} strength={strength} pulse={pulse} /> : <Suspense fallback={<div className="motion-scene-loading">Opening the scene…</div>}>
        {style === 17 ? <StudyGlobe enabled={enabled} /> : style === 18 ? <ParticleWord enabled={enabled} /> : style === 20 && splineUrl ? <SplineStudyScene src={splineUrl} /> : <div className="motion-sculpture"><div style={{ transform: `rotateY(${turn}deg) rotateX(12deg)` }}><i /><i /><i /><span>One idea.<br /><em>Another attempt.</em></span></div><label>Turn the study sculpture<input type="range" min="-65" max="65" value={turn} onChange={event => setTurn(Number(event.target.value))} /></label></div>}
      </Suspense>}
      <div className="motion-hero-caption"><span>THE REVISION TRACE</span><span>Follow the idea <ArrowDown size={14} aria-hidden /></span></div>
      <div className="motion-meteors" key={pulse} aria-hidden="true"><i /><i /><i /></div>
    </div>
    <div className="motion-hero-toolbar">
      <div><span className="motion-status-dot" /> A little space to think.</div>
      <div className="motion-hero-actions"><button type="button" onClick={onToggle} aria-pressed={enabled}>{enabled ? <Pause size={14} /> : <Play size={14} />} Motion {enabled ? 'on' : 'off'}</button><details><summary><SlidersHorizontal size={14} aria-hidden /> Appearance</summary><div className="motion-settings"><label htmlFor="hero-scene-style">Visual treatment</label><select id="hero-scene-style" value={style} onChange={event => setStyle(Number(event.target.value))}>{[...sceneStyles, 'Concept globe', 'Word particles', 'Study sculpture', ...(splineUrl ? ['Interactive scene'] : [])].map((name, index) => <option key={name} value={index}>{name}</option>)}</select><label htmlFor="hero-scene-light">Light intensity</label><input id="hero-scene-light" type="range" min="0.5" max="1.5" step="0.1" value={strength} onChange={event => setStrength(Number(event.target.value))} /><button type="button" disabled={!enabled} onClick={() => setPulse(value => value + 1)}><Play size={14} aria-hidden /> Replay light movement</button><p>Appearance only. Your study work is unchanged.</p></div></details></div>
    </div>
  </div>;
}
