import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'hero' | 'panel' | 'card' | 'tile';

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  as?: 'div' | 'section' | 'article';
};

export default function LiquidGlass({
  children,
  className,
  variant = 'card',
  as: Tag = 'div',
  style,
  ...rest
}: Props) {
  return (
    <Tag
      className={cn('liquid-glass-dispersive', `liquid-glass-${variant}`, className)}
      style={style}
      {...rest}
    >
      <div className="liquid-glass-content">{children}</div>
    </Tag>
  );
}
