// src/pages/Home.tsx
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

/**
 * Home — interactive page with:
 * - lightweight 2D fluid/topographic cursor (canvas)
 * - pop-in / highlight-once animations via IntersectionObserver
 * - tilt interactions for many elements (existing)
 * - liquid-glass look for cards + inverted flashcards
 *
 * Keep content unchanged. Paste this file over your existing Home.tsx.
 */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // refs
  const missionRef = useRef<HTMLDivElement | null>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tiltHandlersRef = useRef<Array<() => void>>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // state for flips
  const problems = [
    { stat: "65%", text: "of students report struggling to find relevant resources despite studying for long hours." },
    { stat: "70%", text: "say note-taking takes up more time than actual learning, making revision less effective." },
    { stat: "80%", text: "feel that current test papers lack rigor and fail to prepare them for real exams." },
    { stat: "60%", text: "admit procrastination is easier because studying feels overwhelming and tedious." },
    { stat: "75%", text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient." },
    { stat: "50%", text: "wish there was a single platform that combines planning, practice, and AI-powered help in one place." },
  ];

  const features = [
    { title: "Study Zone", desc: "All-in-one tool for your calculators, activity logs, and more. A space designed for clarity where everything you need to study lives in one place." },
    { title: "AI Chatbot", desc: "Your personal academic companion. Ask questions, get explanations, and engage in real discussions to deepen your understanding of any subject." },
    { title: "Study Planner", desc: "Never miss a beat. Our planner adapts to your schedule, deadlines, and pace — making your study plan smarter, not harder." },
    { title: "Answer Reviewer", desc: "Not just a reviewer, but a mentor. Receive strict yet constructive feedback on your answers, showing you exactly how to improve." },
    { title: "IB/IGCSE Paper Maker", desc: "Create syllabus-aligned test papers instantly. No fluff, no generic questions — just rigorous practice that actually helps you prepare." },
    { title: "Notes + Flashcards + Quiz", desc: "From notes to flashcards to quizzes, all in one seamless workflow. Perfect for late-night revision or quick practice sessions." },
  ];

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));
  const toggleFlip = (i: number) => setFlipped(prev => { const c = [...prev]; c[i] = !c[i]; return c; });

  // keep search engines happy & warm main chunk
  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => navigate("/main", { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // intersection observer to trigger pop-in/hightlight-once & span pop-up text switch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const opts = { threshold: 0.12 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          // add pop-in
          el.classList.add("pop-in");
          // text highlight: find .highlight-clip child and animate
          const hl = el.querySelector<HTMLElement>(".highlight-clip .hl-inner");
          if (hl && !hl.dataset.animated) {
            hl.dataset.animated = "1";
            hl.classList.add("hl-pop");
          }
          // span pop swap effect - look for .swap-span
          const swap = el.querySelector<HTMLElement>(".swap-span");
          if (swap && !swap.dataset.popped) {
            swap.dataset.popped = "1";
            swap.classList.add("swap-pop");
          }
          observer.unobserve(el); // only once
        }
      });
    }, opts);
    observerRef.current = observer;

    document.querySelectorAll<HTMLElement>(".pop-up").forEach(el => observer.observe(el));
    return () => { observer.disconnect(); observerRef.current = null; };
  }, []);

  // GSAP-ish animations replacement: simple, lightweight CSS + intersection above triggers
  // Tilt handlers for interactive cards (existing logic improved)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));
    const handlers: Array<() => void> = [];

    els.forEach(el => {
      let rect = el.getBoundingClientRect();
      let tx = 0, ty = 0, tz = 0;
      let cx = 0, cy = 0, cz = 0;
      let raf = 0;
      const opts = { maxTilt: 4, perspective: 900, translateZ: 8, ease: 0.14 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        ty = ((x - halfW) / halfW) * opts.maxTilt;
        tx = ((halfH - y) / halfH) * opts.maxTilt;
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        tz = (ang / 90) * 1.8;
        if (!raf) raf = requestAnimationFrame(update);
      };

      const update = () => {
        cx += (tx - cx) * opts.ease;
        cy += (ty - cy) * opts.ease;
        cz += (tz - cz) * opts.ease;
        el.style.transform = `perspective(${opts.perspective}px) rotateX(${cx}deg) rotateY(${cy}deg) rotateZ(${cz}deg) translateZ(${opts.translateZ}px)`;
        raf = 0;
      };

      const onLeave = () => {
        tx = ty = tz = 0;
        if (raf) cancelAnimationFrame(raf);
        el.style.transition = "transform 420ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
        setTimeout(() => { el.style.transition = ""; }, 450);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mouseenter", () => { el.style.transition = ""; });

      handlers.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    tiltHandlersRef.current = handlers;
    return () => { handlers.forEach(fn => fn()); tiltHandlersRef.current = []; };
  }, []);

  // mission small tilt
  useEffect(() => {
    const el = missionRef.current;
    if (!el || typeof window === "undefined") return;
    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    let rect = el.getBoundingClientRect();
    let tX = 0, tY = 0, tZ = 0, cX = 0, cY = 0, cZ = 0;
    let raf = 0;
    const opts = { maxTilt: 2.4, perspective: 1200, translateZ: 6, ease: 0.08 };

    const onMove = (e: MouseEvent) => {
      rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      tY = ((x - halfW) / halfW) * opts.maxTilt;
      tX = ((halfH - y) / halfH) * opts.maxTilt;
      const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
      tZ = (ang / 90) * 0.9;
      if (!raf) raf = requestAnimationFrame(update);
    };

    const update = () => {
      cX += (tX - cX) * opts.ease;
      cY += (tY - cY) * opts.ease;
      cZ += (tZ - cZ) * opts.ease;
      el.style.transform = `perspective(${opts.perspective}px) rotateX(${cX}deg) rotateY(${cY}deg) rotateZ(${cZ}deg) translateZ(${opts.translateZ}px)`;
      raf = 0;
    };

    const onLeave = () => {
      tX = tY = tZ = 0;
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = "transform 480ms cubic-bezier(0.22,1,0.36,1)";
      el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
      setTimeout(() => { el.style.transition = ""; }, 500);
    };

    const onResize = () => { rect = el.getBoundingClientRect(); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // lightweight topographic "fluid" cursor (2D canvas). Inspired by Inspira UI fluid cursor concept
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = cursorCanvasRef.current;
    if (!canvas) return;
    let ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let px = mouseX;
    let py = mouseY;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let lastTime = performance.now();

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // draw a layered "topographic" blob: radius based on speed, skew based on direction
    const render = (t: number) => {
      const dt = Math.max(1, t - lastTime);
      lastTime = t;

      // lerp position
      px += (mouseX - px) * 0.12;
      py += (mouseY - py) * 0.12;

      vx = (mouseX - px) / Math.max(1, dt) * 16;
      vy = (mouseY - py) / Math.max(1, dt) * 16;
      const speed = Math.min(120, Math.hypot(vx, vy));
      const angle = Math.atan2(vy, vx);

      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // background blending is handled with CSS mix-blend-mode: screen for a nice topographic effect.
      // draw concentric rings with offsets to create a layered shift based on angle
      const baseR = 56 + (speed * 0.45); // radius base changes with speed
      const layers = 5;
      for (let i = layers; i >= 1; i--) {
        const tFactor = i / layers;
        const r = baseR * (0.6 + 0.18 * i) * (1 - tFactor * 0.06);
        const offset = (1 - tFactor) * 12;
        // calculate jitter offset in cursor direction
        const ox = Math.cos(angle) * offset * (i / layers);
        const oy = Math.sin(angle) * offset * (i / layers);
        const alpha = 0.08 + (0.14 * (1 - tFactor)); // inner more opaque
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(99,102,241,${alpha})`;
        // draw a soft blob (ellipse) biased by angle
        ctx!.ellipse(px + ox, py + oy, r * (1 - (i * 0.03)), r * (0.7 - (i * 0.02)), angle + (i * 0.02), 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(render);
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    raf = requestAnimationFrame(render);
    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  // small accessibility: hide cursor canvas if reduced motion
  // (handled above via media query)

  // -------------------
  // Subcomponents
  // -------------------
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    return (
      <div
        key={i}
        onClick={() => toggleFlip(i)}
        className="group relative h-56 rounded-2xl shadow-xl cursor-pointer transition-transform duration-400 hover:scale-[1.03] perspective tilt-card pop-up"
        aria-label={`Problem card ${i + 1}`}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 transform"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — inverted light flashcard with liquid-glass gloss */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold rounded-2xl problem-card-front"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg,#ffffff,#f7fbff)",
              color: "#04263b",
              boxShadow: "0 6px 28px rgba(6,10,15,0.06)",
              border: "1px solid rgba(6,10,15,0.04)",
            }}
          >
            <span style={{ fontFeatureSettings: "'tnum' 1" }}>{p.stat}</span>
            <span className="text-sm italic" style={{ color: "rgba(4,38,59,0.62)" }}>Click to find out</span>
          </div>

          {/* Back — dark liquid-glass */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed rounded-2xl"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg, rgba(8,12,20,0.86), rgba(11,16,22,0.82))",
              color: "#e6eef6",
              border: "1px solid rgba(255,255,255,0.03)",
              backdropFilter: "blur(6px) saturate(110%)",
            }}
          >
            <div>
              <div>{p.text}</div>
              <div className="mt-3 text-xs italic" style={{ color: "rgba(226,236,246,0.65)" }}>Backed by research-backed principles: active recall, spaced repetition and retrieval practice.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FeatureRow({ f, i }: { f: { title: string; desc: string }; i: number }) {
    return (
      <div
        key={i}
        className={`feature-row flex flex-col md:flex-row items-center gap-10 pop-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
      >
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card">
          <h4 className="text-xl font-bold mb-3 pop-up swap-span">{f.title}</h4>
          <p className="pop-up highlight-clip" style={{ maxWidth: 640 }}>
            <span className="hl-inner">{f.desc}</span>
          </p>
          <div className="mt-4 text-sm text-slate-400">Built around proven learning techniques.</div>
        </div>
        <div className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left pop-up">
          {i % 2 === 0
            ? "The all in 1 hub for your study sessions with all the tools one could ask for."
            : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}
          <div className="mt-4 text-slate-400">{/* side text kept simple */}</div>
        </div>
      </div>
    );
  }

  // -------------------
  // Render
  // -------------------
  return (
    <>
      <SEO
        title="VertexED — AI Study Tools for Students - AI Based Methods"
        description="All-in-one AI study toolkit with planner, calendar, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription."
        canonical="https://www.vertexed.app/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VertexED — AI Study Toolkit",
          url: "https://www.vertexed.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.vertexed.app/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />

      {/* Inline styles (cursor + pop-in + highlight + liquid glass) */}
      <style>{`
        /* ----- POP-IN (global) ----- */
        .pop-up { opacity: 0; transform: translateY(14px) scale(0.995); transition: transform 520ms cubic-bezier(.2,.9,.3,1), opacity 420ms ease-out; will-change: transform, opacity; }
        .pop-in { opacity: 1; transform: translateY(0px) scale(1); }

        /* small stagger helper for children */
        .pop-up > * { transition-delay: 0ms; }
        .pop-in .hl-inner { transition-delay: 60ms; }

        /* highlight clip / hl-inner pop */
        .highlight-clip { display: inline-block; overflow: hidden; vertical-align: middle; }
        .hl-inner { display: inline-block; transform-origin: left center; transform: translateY(8px) scaleX(1); transition: transform 520ms cubic-bezier(.2,.9,.3,1), color 360ms; }
        .hl-pop { transform: translateY(0px); color: #DDEBFF; }

        /* swap-span pop (heading pop + small font / weight change) */
        .swap-span { display: inline-block; transition: transform 520ms cubic-bezier(.2,.9,.3,1), font-weight 220ms; transform: translateY(8px); }
        .swap-pop { transform: translateY(0px); font-weight: 700; }

        /* liquid glass basic tokens */
        .glass-tile {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
          backdrop-filter: blur(8px) saturate(110%);
        }
        .problem-card-front { /* subtle premium border already set inline */ }

        /* Cursor canvas */
        .cursor-canvas {
          position: fixed;
          left: 0;
          top: 0;
          pointer-events: none;
          z-index: 1400;
          width: 100%;
          height: 100%;
          mix-blend-mode: screen;
        }

        /* interactive state class (applied by JS via closest interactive) */
        .cursor-blob--active { opacity: 0.98 !important; transform-origin: center; }
        /* small accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .pop-up { transition: none !important; transform: none !important; opacity: 1 !important; }
          .cursor-canvas { display: none !important; }
        }
      `}</style>

      {/* Cursor canvas (2D topographic) */}
      <canvas ref={cursorCanvasRef} className="cursor-canvas" aria-hidden />

      {/* HERO */}
      <section className="glass-card px-6 pt-24 pb-16 text-center pop-up">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 pop-up">
            <div className="relative w-full h-[6.75rem] md:h-[9.25rem] flex items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-semibold text-white leading-tight text-center flex flex-col justify-center [--gap:0.4rem] md:[--gap:0.6rem] pop-up swap-span">
                <TypeAnimation
                  sequence={[
                    1200,
                    "AI study tools for students.",
                    1800,
                    "Focused learning. Real results.",
                    1800,
                    "Bold. Premium. Built for learners.",
                    1800,
                    "Study smarter, not longer.",
                  ]}
                  speed={45}
                  wrapper="span"
                  cursor={true}
                  repeat={Infinity}
                />
              </h1>
            </div>
          </div>

          <p className="text-lg text-slate-200 mb-10 pop-up highlight-clip">
            <span className="hl-inner">An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods like active recall, spaced repetition, and retrieval practice.</span>
          </p>

          <div className="flex gap-4 justify-center pop-up">
            <Link to="/main" className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-400 ease-in-out shadow-xl hover:scale-105 ring-1 ring-white/10 tilt-card">Get Started</Link>
            <Link to="/about" className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-transform duration-400 ease-in-out shadow-md hover:scale-105 tilt-card" aria-label="Learn more about VertexED on the About page">Learn more about VertexED</Link>
          </div>
        </div>
      </section>

      {/* Subtle resources link */}
      <div className="max-w-3xl mx-auto px-6 mt-3 pop-up">
        <div className="text-xs text-slate-400 text-center">
          Looking for how-to guides? <Link to="/resources" className="underline">Explore resources</Link>
        </div>
      </div>

      {/* storytelling */}
      <section className="mt-12 md:mt-15 text-center px-6 pop-up">
        <div className="w-full mx-auto h-[4.8rem] md:h-auto flex items-center justify-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight flex flex-col justify-center swap-span">
            <TypeAnimation
              sequence={[1200, "We hate the way we study.", 1400, "We hate cramming.", 1400, "We hate wasted time.", 1400, "We hate inefficient tools."]}
              speed={40}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </h2>
        </div>
        <p className="text-lg text-slate-200 mb-12 pop-up">Who wouldn’t?</p>
      </section>

      {/* why is this a problem */}
      <section className="max-w-6xl mx-auto px-6 mt-28 pop-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center swap-span">Why is this a problem?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => <ProblemCard key={i} p={p} i={i} />)}
        </div>
      </section>

      {/* mission */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center pop-up">
        <div ref={missionRef} className="glass-card text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-transform duration-300" aria-label="Mission panel">
          <p className="text-lg md:text-xl leading-relaxed pop-up">
            Studying has become harder than ever. With too much information to know what to do with, resources that rarely construct measurable progress, and tools that sometimes make things worse, students need a learning space that adapts to them and encourages continuous improvement.
          </p>

          <ul className="text-left mt-6 space-y-3 pop-up">
            <li className="font-semibold">• Improve the way you approach learning</li>
            <li className="font-semibold">• Improve your performance on exams</li>
            <li className="font-semibold">• Improve comprehension and long-term retention</li>
          </ul>

          <p className="text-lg md:text-xl mt-6 leading-relaxed pop-up">
            We focus equally on progress and curiosity: building tools that help you connect ideas, practice deliberately, and grow at your own pace.
          </p>

          <p className="text-lg md:text-xl mt-6 leading-relaxed font-semibold pop-up">
            Our aim is not only to raise scores using evidence-based techniques, but to create an environment where learning becomes rewarding and sustainable.
          </p>
        </div>
      </section>

      {/* features */}
      <section className="max-w-6xl mx-auto px-6 mt-28 pop-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center pop-up"><Link to="/features" className="hover:underline">Explore Our Features</Link></h3>
        <div className="text-center mb-8 pop-up"><Link to="/features" className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300">See full features</Link></div>
        <div className="space-y-20">
          {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6 pop-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 pop-up">
          Ready to get started?<br/>We guarantee a change!
        </h3>
        <button onClick={scrollToTop} className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out tilt-card">Back to Top</button>
      </section>

      {/* closing */}
      <section className="mt-16 text-center px-6 pop-up">
        <p className="text-lg text-slate-200">Learning was never difficult, it just needed a new perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.</p>
      </section>

      {/* contact */}
      <section className="mt-12 px-6 mb-12 pop-up">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-xl">
          <h3 className="text-2xl font-semibold mb-4 pop-up">Contact Us</h3>
          <p className="text-slate-400 mb-4 pop-up">Have a question? Fill out the form and we'll get back to you.</p>
          <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4 pop-up">
            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your email</span>
              <input name="email" type="email" placeholder="steve.jobs@gmail.com" required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500" />
              <div className="text-xs text-slate-500 mt-1">Example: steve.jobs@gmail.com</div>
            </label>
            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your message</span>
              <textarea name="message" rows={5} placeholder="Hi — I'm interested in learning more about VertexED..." required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"></textarea>
              <div className="text-xs text-slate-500 mt-1">Briefly tell us what you'd like help with.</div>
            </label>
            <div className="flex items-center justify-between">
              <button type="submit" className="px-6 py-3 rounded-full bg-white text-slate-900 shadow hover:scale-105 transition">Send</button>
              <p className="text-sm text-slate-400">We’ll reply as soon as we can.</p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
