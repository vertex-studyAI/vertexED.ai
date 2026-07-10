import { lazy, Suspense, useMemo } from 'react';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';

const FluidCursor = lazy(() => import('@/components/FluidCursor'));

export default function FluidCursorLayer() {
  const { settings } = useAppPreferences();

  const enabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (settings.reducedMotion) return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, [settings.reducedMotion]);

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <FluidCursor
        className="pointer-events-none fixed inset-0 z-[2]"
        transparent
        simResolution={128}
        dyeResolution={1024}
        splatRadius={0.22}
        splatForce={5200}
        colorUpdateSpeed={12}
      />
    </Suspense>
  );
}
