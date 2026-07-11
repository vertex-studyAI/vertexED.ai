import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import LiquidGlass from '@/components/LiquidGlass';

type Span = 1 | 2 | 3;

type Props = {
  children: ReactNode;
  className?: string;
  span?: Span;
  variant?: 'hero' | 'panel' | 'card' | 'tile';
  id?: string;
  style?: CSSProperties;
};

export default function PortalWidget({
  children,
  className,
  span = 1,
  variant = 'panel',
  id,
  style,
}: Props) {
  return (
    <LiquidGlass
      id={id}
      variant={variant}
      className={cn('portal-widget', `portal-span-${span}`, className)}
      style={style}
    >
      <div className="portal-widget-body p-5 md:p-6">{children}</div>
    </LiquidGlass>
  );
}
