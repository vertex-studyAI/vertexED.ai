import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-white/40">{icon}</div>}
      <h3 className="text-base font-medium text-white/90">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-white/55">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
