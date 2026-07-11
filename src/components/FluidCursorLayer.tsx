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
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [settings.reducedMotion]);

  if (!enabled) return null;

  const subtle = !isDark;

  return (
    <Suspense fallback={null}>
      <FluidCursor
        className={`pointer-events-none fixed inset-0 z-[2] ${subtle ? 'fluid-cursor-subtle' : ''}`}
        transparent
        simResolution={subtle ? 96 : 120}
        dyeResolution={subtle ? 480 : 800}
        splatRadius={subtle ? 0.06 : 0.12}
        splatForce={subtle ? 900 : 2800}
        densityDissipation={subtle ? 7 : 4.5}
        velocityDissipation={subtle ? 4.5 : 2.8}
        colorUpdateSpeed={subtle ? 5 : 9}
        curl={subtle ? 1.2 : 2.2}
      />
    </Suspense>
  );
}
