import { cn } from '@/lib/utils';

type ContentSkeletonProps = {
  lines?: number;
  className?: string;
};

export function ContentSkeleton({ lines = 3, className }: ContentSkeletonProps) {
  return (
    <div className={cn('animate-pulse space-y-3', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-white/10"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6', className)}
      aria-hidden
    >
      <div className="mb-4 h-6 w-1/3 rounded-lg bg-white/10" />
      <ContentSkeleton lines={4} />
    </div>
  );
}

export function TileGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
