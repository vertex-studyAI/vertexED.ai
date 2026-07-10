import { cn } from '@/lib/utils';
import type { ExamBoard } from '@/types/curriculum';
import { boardShortLabel } from '@/lib/curriculum';

type BoardBadgeProps = {
  board: ExamBoard | null;
  className?: string;
  size?: 'sm' | 'md';
};

export default function BoardBadge({ board, className, size = 'sm' }: BoardBadgeProps) {
  const label = boardShortLabel(board);
  if (!label) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-primary/30 bg-primary/10 font-medium text-primary',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className,
      )}
    >
      {label}
    </span>
  );
}
