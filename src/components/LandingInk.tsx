import { useEffect, useRef } from 'react';
import { createFluid } from '@/lib/landingFluid.mjs';

/** Pointer-driven dye advection, behind content and disabled for touch input. */
export default function LandingInk({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.parentElement;
    if (!canvas || !root || !enabled) return;
    const queries = ['(prefers-reduced-motion: reduce)', '(prefers-reduced-transparency: reduce)', '(forced-colors: active)', '(hover: none), (pointer: coarse)'].map(query => matchMedia(query));
    const context = canvas.getContext('2d');
    if (!context) return;
    const fluid = createFluid(128, 80);
    canvas.width = fluid.width; canvas.height = fluid.height;
    const pixels = context.createImageData(fluid.width, fluid.height);
    let frame = 0, previous = 0, lastMove = 0;
    let last: { x: number; y: number } | null = null;
    const allowed = () => !document.hidden && !queries.some(query => query.matches);
    const clear = () => {
      cancelAnimationFrame(frame); frame = 0; last = null; fluid.clear();
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
    const draw = (time: number) => {
      frame = 0;
      if (!allowed() || time - lastMove > 2400) { clear(); return; }
      if (time - previous >= 32) {
        fluid.step(Math.min((time - previous) / 1000, .05)); previous = time;
        const fade = Math.min(1, (2400 - (time - lastMove)) / 500);
        const dark = document.documentElement.classList.contains('dark');
        fluid.dye.forEach((density: number, i: number) => {
          const core = Math.min(1, density / 1.5);
          pixels.data[i * 4] = dark ? 50 + core * 80 : 22;
          pixels.data[i * 4 + 1] = dark ? 115 + core * 75 : 85 + core * 35;
          pixels.data[i * 4 + 2] = 255;
          pixels.data[i * 4 + 3] = Math.min(170, density * 155) * fade;
        });
        context.putImageData(pixels, 0, 0);
      }
      frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      if (!allowed() || event.pointerType === 'touch') return;
      const x = event.clientX / innerWidth, y = event.clientY / innerHeight;
      if (last) {
        const dx = x - last.x, dy = y - last.y;
        const steps = Math.min(8, Math.max(1, Math.ceil(Math.hypot(dx * fluid.width, dy * fluid.height) / 2)));
        for (let step = 1; step <= steps; step++) fluid.splat(last.x + dx * step / steps, last.y + dy * step / steps, dx / steps, dy / steps);
      }
      last = { x, y }; lastMove = performance.now();
      if (!frame) { previous = lastMove; frame = requestAnimationFrame(draw); }
    };
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', clear);
    window.addEventListener('blur', clear); window.addEventListener('resize', clear);
    document.addEventListener('visibilitychange', clear);
    queries.forEach(query => query.addEventListener('change', clear));
    return () => {
      clear(); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', clear);
      window.removeEventListener('blur', clear); window.removeEventListener('resize', clear);
      document.removeEventListener('visibilitychange', clear);
      queries.forEach(query => query.removeEventListener('change', clear));
    };
  }, [enabled]);
  return <canvas className="landing-ink" ref={canvasRef} aria-hidden="true" />;
}
