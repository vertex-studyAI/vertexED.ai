import { lazy, Suspense, useEffect, useState } from 'react';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';

const FluidCursor = lazy(() => import('@/components/FluidCursor'));

export default function FluidCursorLayer() {
  const { settings, isDark } = useAppPreferences();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (settings.reducedMotion) {
      setEnabled(false);
      return;
    }
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(mq.matches);
    // WebGL is intentionally deferred until the page is interactive. It keeps
    // the exact same effect, without competing with first paint or input.
    const timer = window.setTimeout(sync, 3000);
    mq.addEventListener('change', sync);
    return () => {
      window.clearTimeout(timer);
      mq.removeEventListener('change', sync);
    };
  }, [settings.reducedMotion]);

  if (!enabled) return null;

  const subtle = !isDark;

  return (
    <Suspense fallback={null}>
      <FluidCursor
        className={`pointer-events-none fixed inset-0 z-[2] ${subtle ? 'fluid-cursor-subtle' : ''}`}
        transparent
        simResolution={subtle ? 56 : 72}
        dyeResolution={subtle ? 256 : 384}
        splatRadius={subtle ? 0.06 : 0.1}
        splatForce={subtle ? 800 : 1800}
        densityDissipation={subtle ? 7 : 4.5}
        velocityDissipation={subtle ? 4.5 : 2.8}
        colorUpdateSpeed={subtle ? 5 : 9}
        curl={subtle ? 1.2 : 2.2}
      />
    </Suspense>
  );
}
