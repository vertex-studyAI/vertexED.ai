import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import React, { useEffect, useRef, useCallback } from "react";
import { TypeAnimation } from "react-type-animation";
import { Helmet } from "react-helmet-async";

type Tile = {
  title: string;
  to: string;
  info: string;
  icon?: React.ReactNode;
};

export default function Main() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tilesRef = useRef(new Map<HTMLElement, {
    targetRotX: number;
    targetRotY: number;
    targetRotZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    rafId?: number;
    bounds: DOMRect | null;
    onMove?: (e: MouseEvent) => void;
    onEnter?: () => void;
    onLeave?: () => void;
  }>());

  const tiles: Tile[] = [
    { title: "Study Zone", to: "/study-zone", info: "All-in-1 workspace: calculators, activity logs, and focused-session helpers.", icon: studyIcon() },
    { title: "AI Chatbot", to: "/chatbot", info: "A discussion-first agent for explanations, research prompts and step-by-step help.", icon: chatIcon() },
    { title: "Study Planner", to: "/planner", info: "Adaptive schedule builder that fits practice around life and priorities.", icon: plannerIcon() },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Rubric-aware feedback with clear, actionable steps to raise your grade.", icon: reviewIcon() },
    { title: "Paper Maker", to: "/paper-maker", info: "Board-aligned practice papers with authentic phrasing and mark schemes.", icon: paperIcon() },
    { title: "Note Taker + Flashcards", to: "/notetaker", info: "Capture lectures, auto-summarise and turn notes into flashcards & quizzes.", icon: notesIcon() },
    // New routes the user asked for
    { title: "Archives Subjects", to: "/archives-subjects", info: "Browse subject-wise archived papers, curated by topic and difficulty.", icon: archiveIcon() },
    { title: "User Settings", to: "/user-settings", info: "Personalise your experience: themes, notifications, and account preferences.", icon: settingsIcon() },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cleanup: () => void = () => {};

    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== "undefined" ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 400);
    const cancelIdle = (id: any) =>
      // @ts-ignore
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      // subtle entrance animations for groups
      const fadeUps = gsap.utils.toArray<HTMLElement>(".fade-up");
      fadeUps.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0, scale: 0.995 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
            stagger: 0.04,
          }
        );
      });

      const rows = gsap.utils.toArray<HTMLElement>(".feature-row");
      rows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 88%" } }
        );
      });

      // tiles entrance with nicer stagger
      const tilesEls = gsap.utils.toArray<HTMLElement>(".tile-wrapper");
      gsap.fromTo(
        tilesEls,
        { y: 18, opacity: 0, scale: 0.995 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power2.out", stagger: 0.06, delay: 0.08 }
      );

      // Setup enhanced tilt for pointer devices
      const innerTiles = Array.from(document.querySelectorAll<HTMLElement>(".tile"));
      const canHover = window.matchMedia ? window.matchMedia('(hover:hover) and (pointer:fine)').matches : true;

      innerTiles.forEach((el) => {
        if (!canHover) return;
        const state = {
          targetRotX: 0,
          targetRotY: 0,
          targetRotZ: 0,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          rafId: undefined as number | undefined,
          bounds: el.getBoundingClientRect(),
        };
        tilesRef.current.set(el, state);

        // smoother motion: store target from mousemove, apply via rAF with lerp
        const onMove = (e: MouseEvent) => {
          const b = state.bounds || el.getBoundingClientRect();
          const x = e.clientX - b.left;
          const y = e.clientY - b.top;
          const halfW = b.width / 2;
          const halfH = b.height / 2;
          const rotY = ((x - halfW) / halfW) * 7; // bigger max angle
          const rotX = ((halfH - y) / halfH) * 7;
          const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
          const rotZ = (ang / 90) * 2.2;

          state.targetRotX = rotX;
          state.targetRotY = rotY;
          state.targetRotZ = rotZ;
        };

        const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

        const step = () => {
          // ease factor - higher = snappier
          state.rotX = lerp(state.rotX, state.targetRotX, 0.16);
          state.rotY = lerp(state.rotY, state.targetRotY, 0.16);
          state.rotZ = lerp(state.rotZ, state.targetRotZ, 0.12);

          el.style.transform = `perspective(1200px) rotateX(${state.rotX.toFixed(3)}deg) rotateY(${state.rotY.toFixed(3)}deg) rotateZ(${state.rotZ.toFixed(3)}deg) translateZ(8px)`;
          const shadow = (el.querySelector(".tile-shadow") as HTMLElement | null);
          if (shadow) {
            const sx = -state.rotY * 3;
            const sy = state.rotX * 3 + 6;
            shadow.style.setProperty("box-shadow", `${sx}px ${sy}px 48px rgba(2,6,23,0.45)`);
          }

          state.rafId = requestAnimationFrame(step);
        };

        const onEnter = () => {
          el.style.transition = "transform 180ms cubic-bezier(.22,.9,.3,1)";
          el.style.willChange = "transform";
          state.bounds = el.getBoundingClientRect();
          el.addEventListener("mousemove", onMove);
          el.addEventListener("mouseleave", onLeave);
          el.classList.add("tile-hovering");
          if (!state.rafId) state.rafId = requestAnimationFrame(step);
        };

        const onLeave = () => {
          const prev = state.rafId;
          if (prev) cancelAnimationFrame(prev);
          state.targetRotX = 0;
          state.targetRotY = 0;
          state.targetRotZ = 0;
          // smooth reset
          const resetLoop = () => {
            state.rotX = lerp(state.rotX, 0, 0.18);
            state.rotY = lerp(state.rotY, 0, 0.18);
            state.rotZ = lerp(state.rotZ, 0, 0.14);
            el.style.transform = `perspective(1200px) rotateX(${state.rotX.toFixed(3)}deg) rotateY(${state.rotY.toFixed(3)}deg) rotateZ(${state.rotZ.toFixed(3)}deg) translateZ(0px)`;
            const shadow = (el.querySelector(".tile-shadow") as HTMLElement | null);
            if (shadow) shadow.style.setProperty("box-shadow", `0 18px 50px rgba(12,18,40,0.55)`);
            const nearlyDone = Math.abs(state.rotX) < 0.02 && Math.abs(state.rotY) < 0.02 && Math.abs(state.rotZ) < 0.02;
            if (!nearlyDone) state.rafId = requestAnimationFrame(resetLoop);
            else {
              state.rotX = state.rotY = state.rotZ = 0;
              state.rafId = undefined;
            }
          };

          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
          el.classList.remove("tile-hovering");
          state.rafId = requestAnimationFrame(resetLoop);
        };

        el.addEventListener("mouseenter", onEnter);
        // keep references for cleanup
        const stored = tilesRef.current.get(el)!;
        stored.onMove = onMove;
        stored.onEnter = onEnter;
        stored.onLeave = onLeave;

        // update bounds on resize
        const onResize = () => (state.bounds = el.getBoundingClientRect());
        window.addEventListener("resize", onResize);

        // cleanup per tile
        const tileCleanup = () => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", onResize);
          if (state.rafId) cancelAnimationFrame(state.rafId);
        };

        // store cleanup to run later
        const prevCleanup = cleanup;
        cleanup = () => { tileCleanup(); prevCleanup(); };
      });

      // global cleanup
      const globalCleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        tilesRef.current.forEach((v, k) => {
          if (v.rafId) cancelAnimationFrame(v.rafId);
        });
        tilesRef.current.clear();
      };

      cleanup = () => { globalCleanup(); };
    };

    const id = idle(run);
    return () => { cancelIdle(id); cleanup(); };
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard — VertexED Study Tools</title>
        <meta name="description" content="Choose from Study Zone, AI Chatbot, Planner, Paper Maker, Answer Reviewer, and Notetaker — all in one dashboard." />
        <link rel="canonical" href="https://www.vertexed.app/main" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Intro */}
      <section className="fade-up px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              <TypeAnimation sequence={[700, "Welcome to Vertex AI", 1200, "Pick a tool and get into flow."]} wrapper="span" cursor={false} />
            </h1>
            <p className="mt-4 text-slate-300 max-w-2xl">
              Your dashboard — a single rectangle that groups all powerful study tools. Tap any tile to open a focused workspace
              designed around research-backed learning.
            </p>
          </div>

          <div className="w-full md:w-1/3 text-slate-300">
            <div className="p-4 rounded-2xl bg-white/5">
              <h4 className="font-semibold mb-1">Quick tips</h4>
              <div className="text-xs text-slate-400">
                Hover a tile to preview its depth. Use Study Zone for deep sessions, Paper Maker for board-specific practice, and the
                Answer Reviewer to sharpen exam technique.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div ref={containerRef} className="glass-card p-6 md:p-8 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiles.map((t) => (
                <Link to={t.to} key={t.title} className="group block tile-wrapper">
                  <div className="tile-shadow h-full rounded-xl transition-all duration-400" style={{ boxShadow: "0 18px 50px rgba(12,18,40,0.55)" }}>
                    <div className="tile h-56 md:h-64 w-full" aria-hidden={false} role="button" tabIndex={0} aria-label={`${t.title} — ${t.info}`}>
                      <NeumorphicCard
                        className="h-full p-6 glass-tile flex flex-col justify-between transition-all duration-400 group-hover:ring-indigo-400/40 group-hover:border-indigo-300/30"
                        title={t.title}
                        info={t.info}
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold shadow-sm" aria-hidden>
                              {t.icon}
                            </div>

                            <div>
                              <h3 className="text-2xl font-semibold text-slate-100">{t.title}</h3>
                              <p className="text-xs text-slate-400 mt-1">{t.info}</p>
                            </div>
                          </div>

                          {/* icon description for screen readers */}
                          <div className="sr-only">{t.title} icon — {t.info}</div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-slate-400">Quick open</span>
                          <span className="text-sm text-indigo-300 font-medium">Open →</span>
                        </div>
                      </NeumorphicCard>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 transition-all duration-500" />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="fade-up px-6 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to get back into flow?</h3>
          <p className="text-slate-300 mb-6">
            Use the dashboard to jump straight into focused work — all the tools you need, in one elegant rectangle.
          </p>

          <Link to="/study-zone" className="inline-block px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-md hover:scale-105 transition-transform duration-300">
            Start a session
          </Link>
        </div>
      </section>
    </>
  );
}

// ----------------------------
// Small inline SVG icon helpers to provide clearer icons + descriptions
// ----------------------------
function studyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 19.5C4 18.67 4.67 18 5.5 18H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path d="M19 3H8.5C7.67 3 7 3.67 7 4.5V18.5C7 19.33 7.67 20 8.5 20H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
    </svg>
  );
}
function chatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function plannerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function reviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 15v4a1 1 0 0 1-1.447.894L15 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4H8a2 2 0 0 0-2 2v12l4-2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function paperIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function notesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 8V6a2 2 0 0 0-2-2H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6v12a2 2 0 0 0 2 2h12l4-4V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function archiveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function settingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.13a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.94 16l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.13c.7 0 1.32-.41 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.45 3.94A2 2 0 1 1 7.28 1.11l.06.06c.46.46 1 .75 1.64.85.56.08 1.06-.02 1.49-.33.44-.31 1-.31 1.44 0 .43.3.93.41 1.49.33.64-.1 1.18-.39 1.64-.85l.06-.06A2 2 0 1 1 20.06 4.45l-.06.06c-.3.44-.4 1-.33 1.49.1.64.39 1.18.85 1.64l.06.06A2 2 0 1 1 22.89 9.55l-.06.06c-.3.44-.4 1-.33 1.49.1.64.39 1.18.85 1.64z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
