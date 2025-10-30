import React, { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { Link } from "react-router-dom";

// Hero-only component — drop into your page where the navbar and layout already exist.
// Uses Tailwind for layout and some small scoped CSS for animations.

export default function Hero() {
  const blobA = useRef<HTMLDivElement | null>(null);
  const blobB = useRef<HTMLDivElement | null>(null);
  const cursorCanvas = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [focusText, setFocusText] = useState("Study smarter, not longer.");

  // small local styles (scoped to this component by insertion)
  const styles = `
    .hero-blob { filter: blur(36px) saturate(1.05); opacity: 0.9; transform-origin: center; }
    .pulse-cta { animation: pulse 4.2s infinite; }
    @keyframes pulse { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
    .glow-text { background: linear-gradient(90deg, rgba(255,255,255,0.98), rgba(255,255,255,0.75)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  `;

  // animate background blobs with a smooth, lightweight RAF loop
  useEffect(() => {
    let raf = 0;
    let t = 0;
    setMounted(true);

    function loop() {
      t += 0.006; // slow progress
      if (blobA.current) {
        const x = Math.sin(t * 0.9) * 48; // px
        const y = Math.cos(t * 0.7) * 32;
        const rot = Math.sin(t * 0.4) * 8;
        blobA.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
      }
      if (blobB.current) {
        const x = Math.cos(t * 0.8) * 56;
        const y = Math.sin(t * 0.6) * 28;
        const rot = Math.cos(t * 0.33) * -6;
        blobB.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cursor-follow particle on a canvas — lightweight dots that ease toward cursor
  useEffect(() => {
    if (!mounted) return;
    const canvas = cursorCanvas.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = new Array(20).fill(null).map(() => ({ x: Math.random()*w, y: Math.random()*h, vx:0, vy:0, r: 2+Math.random()*2 }));
    const mouse = { x: w/2, y: h/2 };

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener("resize", resize);

    function onMove(e: MouseEvent) { mouse.x = e.clientX; mouse.y = e.clientY; }
    function onTouch(e: TouchEvent) { const t = e.touches[0]; if (t) { mouse.x = t.clientX; mouse.y = t.clientY; } }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true } as any);

    let raf = 0;
    function draw() {
      ctx.clearRect(0,0,w,h);
      for (let p of particles) {
        // pull toward mouse with easing
        const dx = mouse.x - p.x; const dy = mouse.y - p.y;
        p.vx += dx * 0.002; p.vy += dy * 0.002;
        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx; p.y += p.vy;

        // draw soft dot
        ctx.beginPath();
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
        grd.addColorStop(0, 'rgba(255,255,255,0.9)');
        grd.addColorStop(0.2, 'rgba(255,255,255,0.45)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - p.r*6, p.y - p.r*6, p.r*12, p.r*12);
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch as any);
    };
  }, [mounted]);

  // small interactive demo: type something to see the micro-answer bubble animate
  const [input, setInput] = useState("");
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!bubbleRef.current) return;
    bubbleRef.current.animate(
      [
        { transform: 'translateY(6px) scale(0.98)', opacity: 0 },
        { transform: 'translateY(0px) scale(1)', opacity: 1 }
      ],
      { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
    );
  }, [input]);

  return (
    <section className="relative isolate pt-24 pb-14 overflow-hidden">
      <style>{styles}</style>

      {/* canvas for subtle cursor particles */}
      <canvas ref={cursorCanvas} className="pointer-events-none fixed inset-0 -z-10" aria-hidden />

      {/* background blobs (large soft gradients) */}
      <div aria-hidden className="absolute -left-32 -top-40 w-[56rem] h-[56rem] rounded-full bg-gradient-to-tr from-[#ff7ab6] via-[#7c5cff] to-[#4dd0e1] hero-blob -z-20" ref={blobA} style={{ mixBlendMode: 'overlay' }} />
      <div aria-hidden className="absolute -right-36 bottom-8 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-[#ffd37a] via-[#ff7a7a] to-[#9b6bff] hero-blob -z-20" ref={blobB} style={{ mixBlendMode: 'overlay' }} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* left: headline + micro demo */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl leading-tight font-extrabold text-white mb-6">
              <span className="block">Make every session count.</span>
              <span className="block mt-2 text-3xl md:text-4xl font-semibold text-slate-100">
                <TypeAnimation
                  sequence={[800, 'Focus that actually lasts.', 1400, 'Plan. Practice. Master.', 1400, 'Built for learners who want results.']}
                  speed={40}
                  wrapper="span"
                  cursor={true}
                  repeat={Infinity}
                />
              </span>
            </h1>

            <p className="text-slate-300 max-w-xl mb-6">
              VertexED combines attention-first design with research-backed study techniques. Lightweight, fast and kind to your attention.
            </p>

            <div className="flex items-center gap-4">
              <Link to="/main" className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-lg transform-gpu hover:scale-[1.03] transition">Try it free</Link>
              <button onClick={() => setFocusText('Start a 10-minute focused session')} className="px-4 py-2 rounded-full bg-white/6 border border-white/6 text-white">10-min ritual</button>
            </div>

            {/* interactive micro-demo: tiny input that animates answer bubble */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <input
                aria-label="Try a quick prompt"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a study topic, e.g. "
                className="w-full rounded-lg p-3 bg-white/6 placeholder:text-slate-400 text-white focus:outline-none"
              />

              <div ref={bubbleRef} className="rounded-lg p-3 bg-gradient-to-r from-white/6 to-white/4 border border-white/8 text-slate-100">
                <div className="text-sm font-medium">Micro-answer</div>
                <div className="mt-2 text-sm text-slate-300">{input ? `Quick tip for “${input}”: try breaking it into 3 sub-ideas and recall them for 3 minutes.` : 'Type a topic to get a sample micro-answer.'}</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">Built around spaced repetition, active recall and deliberate practice.</div>
          </div>

          {/* right: floating study card with tilt (pointer events) */}
          <div className="relative z-10 flex items-center justify-center">
            <div
              className="w-full max-w-md rounded-3xl p-6 bg-gradient-to-br from-white/6 to-white/4 border border-white/8 shadow-2xl tilt-card"
              onMouseMove={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width/2;
                const y = e.clientY - rect.top - rect.height/2;
                const rx = (-y / rect.height) * 10;
                const ry = (x / rect.width) * 12;
                el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
              }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'; }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Next practice</div>
                  <div className="mt-2 font-bold text-2xl text-white">Algebra — Practice Paper</div>
                </div>
                <div className="text-xs text-slate-400">45 min</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-slate-300">Questions</div>
                  <div className="font-semibold text-white">18</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-slate-300">Accuracy</div>
                  <div className="font-semibold text-white">72%</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="flex-1 px-4 py-3 rounded-full bg-indigo-600/90 text-white font-semibold">Start</button>
                <button className="px-4 py-3 rounded-full bg-white/6 border border-white/8 text-white">Preview</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
