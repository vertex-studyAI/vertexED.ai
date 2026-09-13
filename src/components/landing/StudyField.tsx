import { useEffect, useRef } from 'react';

/** Small, software-rendered neural-style field. No model, data graph or GPU dependency. */
export default function StudyField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; const host = canvas?.parentElement; const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;
    canvas.width = 112; canvas.height = 64;
    const pixels = context.createImageData(112, 64);
    const preference = matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (forced-colors: active), (pointer: coarse)');
    let frame = 0; let until = 0; let previous = 0; let offset = 0;
    const clear = () => { cancelAnimationFrame(frame); frame = 0; context.clearRect(0, 0, 112, 64); };
    const draw = (time: number) => {
      frame = 0;
      if (preference.matches || document.hidden || time > until) { clear(); return; }
      if (time - previous > 70) {
        previous = time;
        for (let y = 0; y < 64; y++) for (let x = 0; x < 112; x++) {
          const u = x / 15, v = y / 15, phase = time / 2600 + offset;
          const warp = Math.sin(u + Math.sin(v + phase)) + Math.cos(v * 1.8 + Math.cos(u - phase));
          const ridge = Math.pow(Math.max(0, 1 - Math.abs(Math.sin(warp * 2.5))), 5);
          const i = (y * 112 + x) * 4;
          pixels.data[i] = 72; pixels.data[i + 1] = 132; pixels.data[i + 2] = 255;
          pixels.data[i + 3] = ridge * 85 * Math.min(1, (until - time) / 400);
        }
        context.putImageData(pixels, 0, 0);
      }
      frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => { if (preference.matches || event.pointerType !== 'mouse') return; offset = event.clientX / 1000; until = performance.now() + 1800; if (!frame) frame = requestAnimationFrame(draw); };
    host.addEventListener('pointermove', move, { passive: true }); host.addEventListener('pointerleave', clear); window.addEventListener('blur', clear); document.addEventListener('visibilitychange', clear); preference.addEventListener('change', clear);
    return () => { clear(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', clear); window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear); preference.removeEventListener('change', clear); };
  }, []);
  return <canvas ref={ref} className="study-field" aria-hidden="true" />;
}
