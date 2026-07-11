export default function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 text-muted-foreground" role="status" aria-live="polite" aria-busy="true">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border border-border/60" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <div className="text-center space-y-3 w-full max-w-xs">
        <p className="text-sm font-medium tracking-wide text-foreground/90 loader-reveal">{label}</p>
        <div className="space-y-2 loader-reveal-delay">
          <div className="h-2 rounded-full skeleton-shimmer" />
          <div className="h-2 w-4/5 mx-auto rounded-full skeleton-shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>
    </div>
  );
}
