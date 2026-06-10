import { useEffect, useRef } from "react";
import { env } from "@/lib/env";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusMode } from "@/contexts/FocusModeContext";

interface Props {
  density?: number;
  className?: string;
}

/**
 * Lightweight canvas particle field. Theme-aware, motion-aware, low CPU.
 * Used as an ambient texture layer behind the app.
 */
export default function ParticlesBg({ density = 36, className = "" }: Props) {
  if (!env.enableParticles) return null;
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const { focusMode } = useFocusMode();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || focusMode;
    let visible = true;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const count = Math.max(12, Math.floor((w * h) / 38000));
    const N = Math.min(count, density);
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.2,
    }));

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", onResize);

    const fill = theme === "light" ? "30, 64, 95" : "190, 230, 255";

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${fill},${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // light connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            const op = (1 - d2 / 14000) * 0.18;
            ctx.strokeStyle = `rgba(${fill},${op})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      if (!reduce && visible) {
        raf = requestAnimationFrame(draw);
      }
    };
    draw();

    const onVis = () => {
      visible = !document.hidden;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, theme, focusMode]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 particles-bg ${focusMode ? "opacity-15" : theme === "light" ? "opacity-65 mix-blend-multiply" : "opacity-55 mix-blend-screen"} ${className}`}
    />
  );
}
