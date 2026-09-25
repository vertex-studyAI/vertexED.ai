import { useEffect, useRef } from 'react';

/** Small, software-rendered neural-style field. No model, data graph or GPU dependency. */
export default function StudyField({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; const host = canvas?.parentElement; const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;
    if (!enabled) { context.clearRect(0, 0, canvas.width, canvas.height); return; }
    canvas.width = 112; canvas.height = 64;
    const pixels = context.createImageData(112, 64);
    const hidePreference = matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0; let until = 0; let previous = 0; let offset = 0;
    const clear = () => { cancelAnimationFrame(frame); frame = 0; context.clearRect(0, 0, 112, 64); };
    const paint = (time: number, active: boolean) => {
      for (let y = 0; y < 64; y++) for (let x = 0; x < 112; x++) {
        const u = x / 15, v = y / 15, phase = time / 2600 + offset;
        const warp = Math.sin(u + Math.sin(v + phase)) + Math.cos(v * 1.8 + Math.cos(u - phase));
        const ridge = Math.pow(Math.max(0, 1 - Math.abs(Math.sin(warp * 2.5))), 5);
        const i = (y * 112 + x) * 4;
        pixels.data[i] = 32; pixels.data[i + 1] = 91; pixels.data[i + 2] = 216;
        pixels.data[i + 3] = ridge * (active ? 82 + 64 * Math.min(1, Math.max(0, (until - time) / 400)) : 82);
      }
      context.putImageData(pixels, 0, 0);
    };
    const settle = () => {
      cancelAnimationFrame(frame); frame = 0;
      if (hidePreference.matches) { clear(); return; }
      paint(performance.now(), false);
    };
    const draw = (time: number) => {
      frame = 0;
      if (hidePreference.matches || document.hidden) { clear(); return; }
      if (reduceMotion.matches) { settle(); return; }
      if (time > until) { settle(); return; }
      if (time - previous > 70) {
        previous = time;
        paint(time, true);
      }
      frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => { if (hidePreference.matches || reduceMotion.matches || event.pointerType !== 'mouse') return; offset = event.clientX / 1000; until = performance.now() + 1800; if (!frame) frame = requestAnimationFrame(draw); };
    settle();
    host.addEventListener('pointermove', move, { passive: true }); host.addEventListener('pointerleave', settle); window.addEventListener('blur', settle); document.addEventListener('visibilitychange', settle); hidePreference.addEventListener('change', settle); reduceMotion.addEventListener('change', settle);
    return () => { clear(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', settle); window.removeEventListener('blur', settle); document.removeEventListener('visibilitychange', settle); hidePreference.removeEventListener('change', settle); reduceMotion.removeEventListener('change', settle); };
  }, [enabled]);
  return <canvas ref={ref} className="study-field" aria-hidden="true" />;
}
