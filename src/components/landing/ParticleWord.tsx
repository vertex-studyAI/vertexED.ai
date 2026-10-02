import { useEffect, useRef } from 'react';

export default function ParticleWord({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current, context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const mask = document.createElement('canvas'); mask.width = 640; mask.height = 200;
    const ink = mask.getContext('2d')!;
    ink.font = 'bold 120px Georgia'; ink.textAlign = 'center'; ink.fillText('Try again.', 320, 140);
    const pixels = ink.getImageData(0, 0, 640, 200).data;
    const dots: { x: number; y: number }[] = [];
    for (let y = 0; y < 200; y += 4) for (let x = 0; x < 640; x += 4) if (pixels[(y * 640 + x) * 4 + 3] > 100) dots.push({ x, y });
    canvas.width = 640; canvas.height = 200;
    let pointer = { x: -1000, y: -1000 }, frame = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const paint = () => {
      frame = 0; context.clearRect(0, 0, 640, 200); context.fillStyle = '#b7d3ff';
      dots.forEach(dot => {
        const dx = dot.x - pointer.x, dy = dot.y - pointer.y, distance = Math.hypot(dx, dy);
        const force = enabled && !reduced.matches ? Math.max(0, 1 - distance / 65) * 18 : 0;
        context.beginPath(); context.arc(dot.x + dx / Math.max(1, distance) * force, dot.y + dy / Math.max(1, distance) * force, 1.2, 0, Math.PI * 2); context.fill();
      });
    };
    const move = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); pointer = { x: (event.clientX - rect.left) * 640 / rect.width, y: (event.clientY - rect.top) * 200 / rect.height }; if (!frame) frame = requestAnimationFrame(paint); };
    const reset = () => { pointer = { x: -1000, y: -1000 }; cancelAnimationFrame(frame); paint(); };
    paint(); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', reset); reduced.addEventListener('change', reset);
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', reset);
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', reset); reduced.removeEventListener('change', reset); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', reset); };
  }, [enabled]);
  return <canvas className="motion-particle-word" ref={ref} role="img" aria-label="Try again, written in interactive blue particles" />;
}
