import { useEffect, useState } from "react";

export default function OptionalAppEnhancements() {
const [telemetryReady, setTelemetryReady] = useState(false);
useEffect(() => {
	// Avoid prefetching on constrained networks or touch-only devices to improve mobile TTI.
	const isFinePointer = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(hover:hover) and (pointer:fine)').matches : true;
	const connection = (navigator as any).connection;
	const saveData = !!connection?.saveData;
	const slow = ['slow-2g','2g','3g'].includes(connection?.effectiveType || '');
	if (!isFinePointer || saveData || slow) return;

	const idle = (cb: () => void) => {
		return typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(cb, { timeout: 3000 }) : setTimeout(cb, 1200);
	};
	const cancel = (id: any) => {
		return typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(id) : clearTimeout(id);
	};

	let waitingForLoad = false;
	const start = () => {
		// Prefetch is optional. A stale or unavailable chunk must not create an unhandled rejection.
		void Promise.allSettled([
			import("@/pages/Login"),
			import("@/pages/Signup"),
			import("@/pages/About"),
			import("@/pages/Main"),
			import("@/pages/StudyPlanner"),
		]);
	};
	const warm = () => {
		if (document.readyState === 'complete') {
			start();
		} else {
			waitingForLoad = true;
			window.addEventListener('load', start, { once: true });
		}
	};
	const id = idle(warm);
	return () => {
		cancel(id);
		if (waitingForLoad) window.removeEventListener('load', start);
	};
}, []);

useEffect(() => {
  // Telemetry is valuable, but it is not part of the rendered experience.
  // Mount it after interaction is possible so it cannot affect FCP or INP.
  let timer: number | undefined;
  const start = () => {
    timer = window.setTimeout(() => setTelemetryReady(true), 4000);
  };
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }
  return () => {
    window.removeEventListener('load', start);
    if (timer !== undefined) window.clearTimeout(timer);
  };
}, []);


  return telemetryReady ? <DeferredTelemetry /> : null;
}

function DeferredTelemetry() {
  const [Telemetry, setTelemetry] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      import('@vercel/speed-insights/react'),
      import('@vercel/analytics/react'),
    ]).then(([speed, analytics]) => {
      if (!active) return;
      setTelemetry(() => () => <><speed.SpeedInsights /><analytics.Analytics /></>);
    }).catch(() => {
      // Optional telemetry must fail open when a vendor chunk is unavailable.
    });
    return () => { active = false; };
  }, []);

  return Telemetry ? <Telemetry /> : null;
}
