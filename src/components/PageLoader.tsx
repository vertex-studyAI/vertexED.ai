import { useEffect, useState } from 'react';

const SLOW_LOAD_DELAY_MS = 8_000;

export default function PageLoader({ label = 'Loading' }: { label?: string }) {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsTakingLonger(true), SLOW_LOAD_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-6 text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <div className="relative h-12 w-12" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border border-border/60" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin motion-reduce:animate-none" />
      </div>
      <div className="text-center space-y-3 w-full max-w-xs">
        <p className="text-sm font-medium tracking-wide text-foreground/90 loader-reveal">{label}</p>
        {isTakingLonger && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is taking longer than usual. Check your connection; this page will keep trying to open.
          </p>
        )}
        <div className="space-y-2 loader-reveal-delay" aria-hidden="true">
          <div className="h-2 rounded-full skeleton-shimmer motion-reduce:[animation:none]" />
          <div
            className="h-2 w-4/5 mx-auto rounded-full skeleton-shimmer motion-reduce:[animation:none]"
            style={{ animationDelay: '0.1s' }}
          />
        </div>
      </div>
    </div>
  );
}
