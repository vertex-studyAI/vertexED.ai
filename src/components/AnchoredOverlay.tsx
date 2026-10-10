import { type CSSProperties, type PropsWithChildren, type RefObject, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Interactive overlays escape card clipping, transforms and backdrop filters.
 * The overlay itself owns scrolling; decorative shells never own that job. */
export default function AnchoredOverlay({ anchorRef, overlayRef, children, className }: PropsWithChildren<{
  anchorRef: RefObject<HTMLElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  className: string;
}>) {
  const [style, setStyle] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden', top: 0, left: 0 });
  useLayoutEffect(() => {
    let frame = 0;
    const measure = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
      const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) - 8;
      const width = Math.min(rect.width, (viewport?.width ?? innerWidth) - 16);
      const top = Math.min(rect.bottom + 8, bottom - 80);
      setStyle({ position: 'fixed', left: Math.max(leftEdge, Math.min(rect.left, leftEdge + (viewport?.width ?? innerWidth) - 16 - width)), top, width, maxHeight: Math.min(560, Math.max(80, bottom - top)), visibility: rect.bottom > 0 && rect.top < bottom ? 'visible' : 'hidden' });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(schedule);
    if (anchorRef.current) observer.observe(anchorRef.current);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, [anchorRef]);
  return createPortal(<div ref={overlayRef} className={className} style={style}>{children}</div>, document.body);
}
