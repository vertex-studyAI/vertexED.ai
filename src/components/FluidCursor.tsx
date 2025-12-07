// src/components/FluidCursor.tsx
import React, { useEffect, useRef } from "react";

/**
 * FluidCursor.tsx
 *
 * - Full-viewport fixed canvas.
 * - Lightweight particle/splat renderer using 2D canvas for safety (GPU friendly).
 * - Auto-disables on prefers-reduced-motion.
 * - Proper devicePixelRatio handling to avoid pointer bounding issues.
 * - Clean lifecycle and event cleanup.
 *
 * If you want the full GLSL fluid sim later, swap the 2D renderer for your shader pipeline,
 * but keep the same lifecycle/resize/pointer handling code below.
 */

type Pointer = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  down: boolean;
  color: string;
};

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointersRef = useRef<Pointer[]>([]);
  const particlesRef = useRef<Array<any>>([]);
  const lastTickRef = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect prefers-reduced-motion
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      canvas.style.display = "none";
      return;
    }

    // Setup canvas size to fully cover viewport and map pointer coordinates correctly
    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // clamp to 2 for safety
      const w = Math.max(1, Math.floor(window.innerWidth));
      const h = Math.max(1, Math.floor(window.innerHeight));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to CSS pixels
    }
    resize();

    // GPU-safety heuristics: if device has low memory or small screen, reduce particle budget
    const smallScreen = window.innerWidth < 900 || window.innerHeight < 600;
    const particleBudget = smallScreen ? 180 : 420; // cap particle count

    // pointer helpers
    function addPointer(x: number, y: number, down = true) {
      const ptr: Pointer = { x, y, prevX: x, prevY: y, vx: 0, vy: 0, down, color: randColor() };
      pointersRef.current = [ptr];
      // initial splat
      spawnSplat(x, y, ptr.color, 36);
    }

    function movePointer(x: number, y: number) {
      const ptr = pointersRef.current[0];
      if (!ptr) return;
      ptr.prevX = ptr.x;
      ptr.prevY = ptr.y;
      ptr.x = x;
      ptr.y = y;
      ptr.vx = (ptr.x - ptr.prevX);
      ptr.vy = (ptr.y - ptr.prevY);
      // create small splats proportional to velocity
      const speed = Math.hypot(ptr.vx, ptr.vy);
      if (speed > 0.5) spawnSplat(x, y, ptr.color, Math.min(60, 6 + speed * 6));
    }

    function upPointer() {
      const ptr = pointersRef.current[0];
      if (ptr) ptr.down = false;
      // on pointer up create a medium splat
      if (ptr) spawnSplat(ptr.x, ptr.y, ptr.color, 40);
      pointersRef.current = [];
    }

    function randColor() {
      // pastel hues
      const h = Math.floor(rand(180, 260));
      const s = Math.floor(rand(60, 75));
      const l = Math.floor(rand(45, 60));
      return `hsl(${h} ${s}% ${l}%)`;
    }

    // particles are small fading blobs — cheap
    function spawnSplat(x: number, y: number, color: string, size = 20) {
      const now = performance.now();
      const p = {
        x,
        y,
        vx: rand(-0.6, 0.6),
        vy: rand(-0.6, 0.6) - 0.2,
        life: 0,
        ttl: rand(560, 1100),
        size: size * rand(0.6, 1.4),
        color,
        birth: now,
      };
      particlesRef.current.push(p);
      // clamp to budget
      if (particlesRef.current.length > particleBudget) {
        particlesRef.current.splice(0, particlesRef.current.length - particleBudget);
      }
    }

    // animation
    function step(now: number) {
      if (!mountedRef.current) return;
      const dt = Math.min(32, now - (lastTickRef.current || now)) / 1000;
      lastTickRef.current = now;

      // clear with subtle fade so trails appear
      ctx.fillStyle = "rgba(6,10,15,0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // update particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt * 1000;
        p.vy += 0.9 * dt; // gravity-ish
        p.x += p.vx * (60 * dt);
        p.y += p.vy * (60 * dt);
        const age = p.life / p.ttl;
        const alpha = Math.max(0, 1 - age);
        const s = p.size * (1 + age * 0.6);
        // cheap radial gradient
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
        g.addColorStop(0, hexWithAlpha(p.color, Math.min(0.9, alpha)));
        g.addColorStop(0.6, hexWithAlpha(p.color, alpha * 0.35));
        g.addColorStop(1, hexWithAlpha(p.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();

        if (p.life > p.ttl) {
          // remove
          particles.splice(i, 1);
        }
      }

      // subtle cursor halo around pointer
      const ptr = pointersRef.current[0];
      if (ptr) {
        // draw a soft ring
        const ringR = 18 + Math.hypot(ptr.vx, ptr.vy) * 8;
        const ring = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, ringR);
        ring.addColorStop(0, hexWithAlpha(ptr.color, 0.12));
        ring.addColorStop(0.6, hexWithAlpha(ptr.color, 0.04));
        ring.addColorStop(1, hexWithAlpha(ptr.color, 0));
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(ptr.x, ptr.y, ringR, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    }

    // helpers
    function hexWithAlpha(hsl: string, a: number) {
      // canvas supports HSL strings with alpha in modern browsers via hsla() - but we already have HSL space
      // convert HSL string like "hsl(220 60% 50%)" to "hsla(..., a)" if possible
      if (hsl.startsWith("hsl(") && !hsl.startsWith("hsla(")) {
        return hsl.replace("hsl(", "hsla(").replace(")", `, ${a})`);
      }
      // fallback
      return `rgba(255,255,255,${a})`;
    }

    // pointer event handling - map coordinates to CSS pixels (canvas scaled via ctx.setTransform above)
    function clientToCanvas(evtX: number, evtY: number) {
      // CSS pixel coordinates match canvas' transform now, so no cross-scaling required
      return { x: evtX, y: evtY };
    }

    function onMouseDown(e: MouseEvent) {
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      addPointer(x, y, true);
    }
    function onMouseMove(e: MouseEvent) {
      const { x, y } = clientToCanvas(e.clientX, e.clientY);
      // start pointer if none active
      if (pointersRef.current.length === 0) {
        addPointer(x, y, true);
      } else {
        movePointer(x, y);
      }
    }
    function onMouseUp() {
      upPointer();
    }
    function onTouchStart(e: TouchEvent) {
      const t = e.changedTouches[0];
      if (!t) return;
      const { x, y } = clientToCanvas(t.clientX, t.clientY);
      addPointer(x, y, true);
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.changedTouches[0];
      if (!t) return;
      const { x, y } = clientToCanvas(t.clientX, t.clientY);
      movePointer(x, y);
    }
    function onTouchEnd() {
      upPointer();
    }

    // passive listeners where appropriate (performance)
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mousemove", throttle(onMouseMove, 12), { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", throttle(onTouchMove, 12), { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    // start RAF
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);

    // initial quiet splash (subtle)
    spawnSplat(window.innerWidth * 0.5, window.innerHeight * 0.25, randColor(), 60);
    spawnSplat(window.innerWidth * 0.7, window.innerHeight * 0.5, randColor(), 40);

    // cleanup
    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", throttle(onMouseMove, 12));
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", throttle(onTouchMove, 12));
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small throttle util (keeps event handler identity stable)
  function throttle<T extends (...args: any[]) => void>(fn: T, wait = 12) {
    let last = 0;
    return function (this: any, ...args: any[]) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        // @ts-ignore
        fn.apply(this, args);
      }
    } as T;
  }

  // Render canvas covering viewport (fixed). Use pointer-events none so it doesn't intercept clicks.
  return (
    <canvas
      ref={canvasRef}
      id="fluid-cursor-canvas"
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1400,
        mixBlendMode: "screen",
      }}
    />
  );
}
