export default function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-5 text-muted-foreground">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border border-border/60" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium tracking-wide text-foreground/90 loader-reveal">{label}</p>
        <p className="text-xs text-muted-foreground loader-reveal-delay">Just a moment</p>
      </div>
    </div>
  );
}
