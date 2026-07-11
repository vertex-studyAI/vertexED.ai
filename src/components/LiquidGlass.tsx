import type { ReactNode, CSSProperties, HTMLAttributes } from 'react';
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
  const mergedStyle = {
    '--lg-x': 'var(--pointer-x, 50%)',
    '--lg-y': 'var(--pointer-y, 40%)',
    ...style,
  } as CSSProperties;

  return (
    <Tag
      className={cn('liquid-glass-dispersive', `liquid-glass-${variant}`, className)}
      style={mergedStyle}
      {...rest}
    >
      <span className="liquid-caustic liquid-caustic-a" aria-hidden />
      <span className="liquid-caustic liquid-caustic-b" aria-hidden />
      <span className="liquid-caustic liquid-caustic-c" aria-hidden />
      <span className="liquid-prism-ring" aria-hidden />
      <div className="liquid-glass-content">{children}</div>
    </Tag>
  );
}
