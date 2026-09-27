import { useState } from 'react';
import { splineSceneUrl } from './splineSceneUrl';

/** Optional user-supplied Spline embed. The local scene remains the default. */
export default function SplineStudyScene({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const safe = splineSceneUrl(src);
  if (!safe) return null;
  return <div className="motion-spline">{loaded ? <><iframe src={safe} title="Interactive VertexED study scene" sandbox="allow-scripts allow-same-origin" loading="lazy" referrerPolicy="no-referrer" /><button type="button" onClick={() => setLoaded(false)}>Close interactive scene</button></> : <div><p>Explore the study scene in three dimensions.</p><button type="button" onClick={() => setLoaded(true)}>Load interactive scene</button><small>Loads the scene from Spline.</small></div>}</div>;
}
