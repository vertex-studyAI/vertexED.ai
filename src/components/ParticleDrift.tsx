import { useEffect, useRef } from 'react';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';

type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };

export default function ParticleDrift() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useAppPreferences();

  useEffect(() => {
    if (settings.reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    const count = 42;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 2.2,
        a: 0.08 + Math.random() * 0.22,
      }));
    };

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8;
        if (p.y > h + 8) p.y = -8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(var(--primary-h, 199) 70% 60% / ${p.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    seed();
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [settings.reducedMotion]);

  if (settings.reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="particle-drift-canvas pointer-events-none fixed inset-0 z-[1]"
      aria-hidden
    />
  );
}
