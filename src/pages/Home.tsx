// src/pages/Home.tsx
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // refs
  const missionRef = useRef<HTMLDivElement | null>(null);
  const cursorSvgRef = useRef<SVGSVGElement | null>(null);

  // keep a ref for cleaning up tilt handlers
  const tiltHandlersRef = useRef<Array<() => void>>([]);

  // Idle timeout for cursor fade
  const cursorIdleTimeoutRef = useRef<number | null>(null);

  // content arrays
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
  const toggleFlip = (index: number) => setFlipped((prev) => { const updated = [...prev]; updated[index] = !updated[index]; return updated; });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const featureSideText = [
    "This is your go to place for those late nights, early mornings, at the library or simply anywhere you are doing independent learning.",
    "Not just another bot, it learns and adapts to you; your strengths, passions and limitations and moreover your progress.",
    "Better organize your sessions and activities so you end up with more done and less energy spent so you can focus on what really matters; life.",
    "Like a teacher built in, constantly finding limitations you would never find and providing the ways to become even closer to perfection",
    "It's like having infinite practice papers ready to go. Non Stop practice based on material which already exists.",
    "This is just the beginning! more features are on their way as you read this."
  ];

  // -------------------
  // ROUTE WARM + GSAP lazy setup (kept)
  // -------------------
  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => navigate("/main", { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== "undefined"
        ? // @ts-ignore
          requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);
    const cancelIdle = (id: any) =>
      // @ts-ignore
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    let cleanup: () => void = () => {};
    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      // Fade-up elements
      const elements = gsap.utils.toArray<HTMLElement>(".fade-up");
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0, scale: 0.995 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.04,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // feature rows: slide from left/right + subtle rotation
      const featureRows = gsap.utils.toArray<HTMLElement>(".feature-row");
      featureRows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0, rotateX: 2 },
          {
            x: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.95,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: row,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    };

    const idleId = idle(run);
    return () => {
      cancelIdle(idleId);
      cleanup();
    };
  }, []);

  // -------------------
  // TILT helper (kept)
  // -------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    tiltHandlersRef.current = [];
    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));
    els.forEach((el) => {
      let rect = el.getBoundingClientRect();
      let tx = 0, ty = 0, tz = 0;
      let cx = 0, cy = 0, cz = 0;
      let raf = 0;
      const opts = { maxTilt: 3.2, perspective: 1000, translateZ: 6, ease: 0.12 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        ty = ((x - halfW) / halfW) * opts.maxTilt;
        tx = ((halfH - y) / halfH) * opts.maxTilt;
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        tz = (ang / 90) * 1.6;
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
      el.addEventListener("mouseenter", () => (el.style.transition = ""));

      tiltHandlersRef.current.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      tiltHandlersRef.current.forEach(fn => fn());
      tiltHandlersRef.current = [];
    };
  }, []);

  // -------------------
  // Mission tilt (kept)
  // -------------------
  useEffect(() => {
    const el = missionRef.current;
    if (!el || typeof window === "undefined") return;
    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    let rect = el.getBoundingClientRect();
    let tX = 0, tY = 0, tZ = 0, cX = 0, cY = 0, cZ = 0;
    let raf = 0;
    const opts = { maxTilt: 2.6, perspective: 1200, translateZ: 6, ease: 0.08 };

    const onMove = (e: MouseEvent) => {
      rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      tY = ((x - halfW) / halfW) * opts.maxTilt;
      tX = ((halfH - y) / halfH) * opts.maxTilt;
      const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
      tZ = (ang / 90) * 1.0;
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

  // -------------------
  // FLUID CURSOR (2D topographic splash)
  // Implementation notes:
  // - Uses an SVG with several circles and an SVG filter to create a 'smoothed' topographic blob.
  // - Circles move based on smoothed mouse velocity; when mouse is idle blob fades.
  // - Active elements tighten the blob (class 'cursor-active' added).
  // -------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const svg = cursorSvgRef.current;
    if (!svg) return;

    const circles = Array.from(svg.querySelectorAll<SVGCircleElement>(".cursor-part"));
    const container = svg; // use svg bounding box for positioning math

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let px = mouseX, py = mouseY; // smoothed pointer
    let vx = 0, vy = 0;
    let lastMoveTs = performance.now();
    let raf = 0;

    // parameters you can tune:
    const lerp = 0.14; // smoothing for position
    const decay = 0.92; // velocity decay
    const idleDelay = 700; // ms before blob fades
    const baseRadius = 48; // base radius for main circle
    const speedScale = 0.6; // how much speed affects spread

    const interactiveSelector = "a, button, input, textarea, .tilt-card, .glass-card, .glass-tile";

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTs);
      lastMoveTs = now;

      const nx = e.clientX;
      const ny = e.clientY;

      // velocity (simple)
      vx = (nx - mouseX) / dt * 16; // scaled to typical RAF ticks
      vy = (ny - mouseY) / dt * 16;

      mouseX = nx;
      mouseY = ny;

      // show blob if idle
      svg.classList.remove("cursor-hidden");
      if (cursorIdleTimeoutRef.current) {
        window.clearTimeout(cursorIdleTimeoutRef.current);
        cursorIdleTimeoutRef.current = null;
      }
      cursorIdleTimeoutRef.current = window.setTimeout(() => {
        svg.classList.add("cursor-hidden");
      }, idleDelay);
    };

    const onDown = () => {
      svg.classList.add("cursor-press");
    };
    const onUp = () => svg.classList.remove("cursor-press");

    // when hovering interactive elements, tighten blob
    const onDocMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const hit = t.closest(interactiveSelector);
      if (hit) svg.classList.add("cursor-active"); else svg.classList.remove("cursor-active");
    };

    const render = () => {
      // smooth pointer position
      px += (mouseX - px) * lerp;
      py += (mouseY - py) * lerp;

      // smooth velocity
      vx *= decay;
      vy *= decay;

      // speed magnitude
      const speed = Math.sqrt(vx * vx + vy * vy);

      // map to looseness/rotation
      const spread = Math.min(1.8, 1 + speed * speedScale);
      const rotate = Math.atan2(vy, vx) * (180 / Math.PI);

      // position main group
      const g = svg.querySelector<SVGGElement>("#cursor-group");
      if (g) {
        g.setAttribute("transform", `translate(${px}, ${py}) rotate(${rotate}) scale(${1})`);
      }

      // update separate parts to create topographic offset
      circles.forEach((c, idx) => {
        const offset = (idx - (circles.length - 1) / 2) * 18 * spread; // spacing
        const tx = offset * Math.cos((idx * 25 + rotate) * (Math.PI / 180));
        const ty = offset * Math.sin((idx * 25 + rotate) * (Math.PI / 180));
        const r = Math.max(8, baseRadius - idx * 8 + speed * 6); // radius influenced by speed
        c.setAttribute("cx", String(tx));
        c.setAttribute("cy", String(ty));
        c.setAttribute("r", String(r));
      });

      raf = requestAnimationFrame(render);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mousemove", onDocMove, { passive: true });
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    // start hidden until user moves
    svg.classList.add("cursor-hidden");
    raf = requestAnimationFrame(render);

    return () => {
      if (cursorIdleTimeoutRef.current) {
        window.clearTimeout(cursorIdleTimeoutRef.current);
        cursorIdleTimeoutRef.current = null;
      }
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", onDocMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // -------------------
  // Heading & highlight appearance with IntersectionObserver
  // - .lift-up: wraps a span that will translate up and get a small type-scale
  // - .highlight-sweep: creates a sweep highlight behind text
  // -------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll<HTMLElement>(".lift-up").forEach(el => obs.observe(el));
    document.querySelectorAll<HTMLElement>(".highlight-sweep").forEach(el => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  // -------------------
  // Subcomponents
  // -------------------
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    // Liquid glass flashcard front/back
    return (
      <div
        key={i}
        onClick={() => toggleFlip(i)}
        className="group relative h-56 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-[1.03] perspective tilt-card fade-up"
        aria-label={`Problem ${i + 1}`}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 transform"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — inverted (light) with liquid-glass sheen */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold rounded-2xl problem-front"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg,#ffffff,#f3f7fb)",
              color: "#04263b",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 24px rgba(2,6,23,0.08)",
              border: "1px solid rgba(2,6,23,0.06)",
              overflow: "hidden",
            }}
          >
            {/* subtle animated sheen */}
            <div className="sheen" aria-hidden />
            <span style={{ fontFeatureSettings: "'tnum' 1", zIndex: 2 }}>{p.stat}</span>
            <span className="text-sm italic" style={{ color: "rgba(4,38,59,0.6)", zIndex: 2 }}>Click to find out</span>
          </div>

          {/* Back — dark/glass feel */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed rounded-2xl"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg, rgba(8,12,20,0.9), rgba(12,16,22,0.86))",
              color: "#e6eef6",
              boxShadow: "0 6px 30px rgba(2,6,23,0.36)",
              border: "1px solid rgba(255,255,255,0.03)",
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
        className={`feature-row flex flex-col md:flex-row items-center gap-10 fade-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
      >
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card planner-card">
          <h4 className="text-xl font-bold mb-3 lift-up">
            <span className="lift-inner">{f.title}</span>
          </h4>
          <p>{f.desc}</p>
          <div className="mt-4 text-sm text-slate-500 highlight-sweep">
            <span className="hs-inner">{i % 2 === 0 ? "The all in 1 hub for your study sessions with all the tools one could ask for." : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}</span>
          </div>
        </div>
        <Link
          to="/features"
          className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left"
        >
          <div className="lift-up">
            <span className="lift-inner">{i % 2 === 0 ? "Explore tools & workflows →" : "See how we keep you on track →"}</span>
          </div>
          <div className="mt-4 text-slate-400">{featureSideText[i]}</div>
        </Link>
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

      {/* Inline CSS for cursor, headings, highlights, and cards */}
      <style>{`
        /* ---------- cursor topographic SVG styling ---------- */
        .cursor-svg {
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1400;
          mix-blend-mode: screen;
          transition: opacity 280ms ease;
        }
        .cursor-svg.cursor-hidden { opacity: 0; }
        .cursor-svg .cursor-shape { transform-origin: center; }
        .cursor-svg.cursor-active .flood { opacity: 1; }
        .cursor-svg .flood { opacity: 0.8; transition: opacity 320ms ease; }

        /* press feedback */
        .cursor-svg.cursor-press { filter: saturate(1.05) blur(0.6px); }

        /* ---------- lift-up headings ---------- */
        .lift-up { display: inline-block; overflow: visible; }
        .lift-inner {
          display: inline-block;
          transform: translateY(6px) scale(1);
          transition: transform 520ms cubic-bezier(.2,.9,.28,1), letter-spacing 420ms;
          will-change: transform;
        }
        .lift-up.in-view .lift-inner {
          transform: translateY(0) scale(1.03);
          letter-spacing: 0.6px;
        }

        /* ---------- highlight sweep ---------- */
        .highlight-sweep { position: relative; display: inline-block; overflow: visible; }
        .hs-inner {
          position: relative;
          z-index: 2;
          padding: 0.06rem 0.16rem;
        }
        .highlight-sweep::before {
          content: "";
          position: absolute;
          left: -6%;
          top: 30%;
          width: 0%;
          height: 42%;
          background: linear-gradient(90deg, rgba(99,102,241,0.18), rgba(14,165,233,0.12));
          transform-origin: left center;
          transform: skewX(-8deg);
          z-index: 1;
          filter: blur(8px);
          transition: width 700ms cubic-bezier(.2,.9,.28,1), opacity 400ms;
          opacity: 0;
        }
        .highlight-sweep.in-view::before {
          width: 112%;
          opacity: 1;
        }

        /* ---------- ProblemCard sheen ---------- */
        .problem-front { position: relative; overflow: hidden; }
        .problem-front .sheen {
          position: absolute;
          left: -40%;
          top: -30%;
          width: 120%;
          height: 60%;
          background: linear-gradient(120deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02));
          transform: rotate(-18deg);
          opacity: 0.0;
          transition: transform 900ms cubic-bezier(.2,.9,.28,1), opacity 650ms;
          pointer-events: none;
        }
        .group:hover .problem-front .sheen { transform: translateX(42%) rotate(-18deg); opacity: 0.9; }

        /* Liquid glass extra feel on .glass-card / .glass-tile (if reused) */
        .glass-card, .glass-tile {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          backdrop-filter: blur(6px) saturate(110%);
          border: 1px solid rgba(255,255,255,0.04);
        }

        /* scribbles */
        .scribble {
          position: absolute;
          pointer-events: none;
          opacity: 0.12;
          transform: translateZ(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .lift-inner, .highlight-sweep::before, .problem-front .sheen { transition: none !important; }
          .cursor-svg { display: none !important; }
        }
      `}</style>

      {/* ---------- Topographic cursor (SVG) ---------- */}
      <svg
        ref={cursorSvgRef}
        className="cursor-svg"
        aria-hidden
        viewBox={`0 0 ${window?.innerWidth || 1200} ${window?.innerHeight || 800}`}
      >
        <defs>
          {/* smooth filter to unify circles */}
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 22 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>

          {/* subtle color flood for better topographic look */}
          <radialGradient id="topoGrad" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#63b3ff" stopOpacity="0.28" />
            <stop offset="40%" stopColor="#60a5fa" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
          </radialGradient>
        </defs>

        <g id="cursor-group" className="cursor-shape" filter="url(#goo)" transform={`translate(${(window?.innerWidth||1200)/2}, ${(window?.innerHeight||800)/2})`}>
          {/* multiple circles layered create contour/topo effect */}
          <circle className="cursor-part" cx="0" cy="0" r="48" fill="url(#topoGrad)" />
          <circle className="cursor-part" cx="0" cy="0" r="36" fill="url(#topoGrad)" opacity="0.88" />
          <circle className="cursor-part" cx="0" cy="0" r="26" fill="url(#topoGrad)" opacity="0.78" />
          <circle className="cursor-part flood" cx="0" cy="0" r="80" fill="#0ea5e980" opacity="0.65" />
        </g>
      </svg>

      {/* subtle scribbles (absolute decorative SVGs) */}
      <svg className="scribble" style={{ left: 24, top: 120, width: 120, height: 60 }} viewBox="0 0 200 60" aria-hidden>
        <path d="M4 30 C40 5 80 55 140 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="scribble" style={{ right: 36, top: 420, width: 160, height: 80 }} viewBox="0 0 260 80" aria-hidden>
        <path d="M10 50 C60 10 120 70 240 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* HERO */}
      <section className="glass-card px-6 pt-24 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 fade-up">
            <div className="relative w-full h-[6.75rem] md:h-[9.25rem] flex items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-semibold text-white leading-tight text-center">
                <span className="lift-up"><span className="lift-inner">AI study tools for students.</span></span>
              </h1>
            </div>
          </div>

          <p className="text-lg text-slate-200 mb-10 fade-up highlight-sweep">
            <span className="hs-inner">An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods like active recall, spaced repetition, and retrieval practice.</span>
          </p>

          <div className="flex gap-4 justify-center fade-up">
            <Link
              to="/main"
              className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-400 ease-in-out shadow-xl hover:scale-105 ring-1 ring-white/10"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-transform duration-400 ease-in-out shadow-md hover:scale-105"
              aria-label="Learn more about VertexED on the About page"
            >
              Learn more about VertexED
            </Link>
          </div>
        </div>
      </section>

      {/* Subtle resources link */}
      <div className="max-w-3xl mx-auto px-6 mt-3">
        <div className="text-xs text-slate-400 text-center">
          Looking for how-to guides? <Link to="/resources" className="underline">Explore resources</Link>
        </div>
      </div>

      {/* Storytelling */}
      <section className="mt-12 md:mt-15 text-center px-6 fade-up">
        <div className="w-full mx-auto h-[4.8rem] md:h-auto flex items-center justify-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
            <TypeAnimation
              sequence={[1200, "We hate the way we study.", 1400, "We hate cramming.", 1400, "We hate wasted time.", 1400, "We hate inefficient tools."]}
              speed={40}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </h2>
        </div>
        <p className="text-lg text-slate-200 mb-12">Who wouldn’t?</p>
      </section>

      {/* Why is this a problem? */}
      <section className="max-w-6xl mx-auto px-6 mt-28 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center lift-up"><span className="lift-inner">Why is this a problem?</span></h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => (
            <ProblemCard key={i} p={p} i={i} />
          ))}
        </div>

        {/* mission text with lifted headings + highlights */}
        <div className="max-w-4xl mx-auto mt-14 px-6 text-center">
          <div ref={missionRef} className="glass-card text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-transform duration-300">
            <p className="text-lg md:text-xl leading-relaxed highlight-sweep">
              <span className="hs-inner">Studying has become harder than ever. With too much information to know what to do with, resources that rarely construct measurable progress, and tools that sometimes make things worse, students need a learning space that adapts to them and encourages continuous improvement.</span>
            </p>

            <ul className="text-left mt-6 space-y-3">
              <li className="font-semibold">• Improve the way you approach learning</li>
              <li className="font-semibold">• Improve your performance on exams</li>
              <li className="font-semibold">• Improve comprehension and long-term retention</li>
            </ul>

            <p className="text-lg md:text-xl mt-6 leading-relaxed highlight-sweep">
              <span className="hs-inner">We focus equally on progress and curiosity: building tools that help you connect ideas, practice deliberately, and grow at your own pace.</span>
            </p>

            <p className="text-lg md:text-xl mt-6 leading-relaxed font-semibold lift-up">
              <span className="lift-inner">Our aim is not only to raise scores using evidence-based techniques, but to create an environment where learning becomes rewarding and sustainable.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center fade-up">
          <Link to="/features" className="hover:underline">Explore Our Features</Link>
        </h3>
        <div className="text-center mb-8">
          <Link
            to="/features"
            className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300"
          >
            See full features
          </Link>
        </div>

        <div className="space-y-20">
          {features.map((f, i) => (
            <FeatureRow key={i} f={f} i={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 lift-up">
          <span className="lift-inner">Ready to get started?<br />We guarantee a change!</span>
        </h3>
        <button
          onClick={scrollToTop}
          className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out"
        >
          Back to Top
        </button>
      </section>

      {/* Closing */}
      <section className="mt-16 text-center px-6">
        <p className="text-lg text-slate-200">Learning was never difficult, it just needed a new perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.</p>
      </section>

      {/* Contact Us (Formspree) */}
      <section className="mt-12 px-6 mb-12">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-xl">
          <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
          <p className="text-slate-400 mb-4">Have a question? Fill out the form and we'll get back to you.</p>

          <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4">
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
