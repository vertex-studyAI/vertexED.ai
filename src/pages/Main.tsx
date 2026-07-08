import NeumorphicCard from "@/components/NeumorphicCard";
import DotGrid from "@/components/DotGrid";

import { Link } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import { Helmet } from "react-helmet-async";
import { Settings as SettingsIcon } from "lucide-react";

type Tile = {
  title: string;
  to: string;
  info: string;
  icon?: React.ReactNode;
};

export default function Main() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tilesRef = useRef(
    new Map<
      HTMLElement,
      {
        targetRotX: number;
        targetRotY: number;
        rotX: number;
        rotY: number;
        rafId?: number;
        bounds: DOMRect | null;
      }
    >()
  );

  const tiles: Tile[] = [
    { title: "Study Zone", to: "/study-zone", info: "All-in-1 workspace: calculators, activity logs, and focused-session helpers.", icon: studyIcon() },
    { title: "AI Chatbot", to: "/chatbot", info: "A discussion-first agent for explanations, research prompts and step-by-step help.", icon: chatIcon() },
    { title: "Study Planner", to: "/planner", info: "Adaptive schedule builder that fits practice around life and priorities.", icon: plannerIcon() },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Rubric-aware feedback with clear, actionable steps to raise your grade.", icon: reviewIcon() },
    { title: "Paper Maker", to: "/paper-maker", info: "Board-aligned practice papers with authentic phrasing and mark schemes.", icon: paperIcon() },
    { title: "Note Taker + Flashcards", to: "/notetaker", info: "Capture lectures, auto-summarise and turn notes into flashcards & quizzes.", icon: notesIcon() },
    { title: "Archives Subjects", to: "/archives", info: "Browse subject-wise archived papers, curated by topic and difficulty.", icon: archiveIcon() },
    // keep settings separate (rendered as small control in header)
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tileEls = Array.from(document.querySelectorAll<HTMLElement>(".tile"));

    // helper lerp
    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    tileEls.forEach((el) => {
      const state = {
        targetRotX: 0,
        targetRotY: 0,
        rotX: 0,
        rotY: 0,
        rafId: undefined as number | undefined,
        bounds: el.getBoundingClientRect(),
      };
      tilesRef.current.set(el, state);

      const updateBounds = () => (state.bounds = el.getBoundingClientRect());
      window.addEventListener("resize", updateBounds);

      const onMove = (e: MouseEvent) => {
        const b = state.bounds || el.getBoundingClientRect();
        const x = e.clientX - b.left;
        const y = e.clientY - b.top;
        const halfW = b.width / 2;
        const halfH = b.height / 2;

        // amount to tilt: -max..+max degrees based on pointer offset
        const maxTilt = 6; // degrees (subtle)
        const rotY = ((x - halfW) / halfW) * maxTilt; // pointer left/right -> rotateY
        const rotX = ((halfH - y) / halfH) * maxTilt; // pointer up/down -> rotateX (inverse)
        state.targetRotX = rotX;
        state.targetRotY = rotY;
      };

      const step = () => {
        // smooth towards target
        state.rotX = lerp(state.rotX, state.targetRotX, 0.14);
        state.rotY = lerp(state.rotY, state.targetRotY, 0.14);

        // apply transform — keep modest translateZ for depth
        el.style.transform = `perspective(900px) translateZ(6px) rotateX(${state.rotX.toFixed(3)}deg) rotateY(${state.rotY.toFixed(
          3
        )}deg)`;

        // shadow follow (optional element .tile-shadow)
        const shadow = el.closest(".tile-wrapper")?.querySelector(".tile-shadow") as HTMLElement | null;
        if (shadow) {
          const sx = -state.rotY * 2;
          const sy = state.rotX * 2 + 8;
          shadow.style.boxShadow = `${sx}px ${sy}px 30px rgba(0,0,0,0.2)`;
        }

        state.rafId = requestAnimationFrame(step);
      };

      const onEnter = () => {
        el.style.willChange = "transform";
        el.style.transition = "transform 220ms cubic-bezier(.22,.9,.3,1)";
        updateBounds();
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        // start animation loop if not running
        if (!state.rafId) state.rafId = requestAnimationFrame(step);
      };

      const onLeave = () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        // gently reset targets to zero
        state.targetRotX = 0;
        state.targetRotY = 0;

        // let the loop run for a short while to ease back to zero, then cancel
        const resetCheck = () => {
          state.rotX = lerp(state.rotX, 0, 0.14);
          state.rotY = lerp(state.rotY, 0, 0.14);
          el.style.transform = `perspective(900px) translateZ(0px) rotateX(${state.rotX.toFixed(3)}deg) rotateY(${state.rotY.toFixed(3)}deg)`;
          const nearlyDone = Math.abs(state.rotX) < 0.02 && Math.abs(state.rotY) < 0.02;
          if (!nearlyDone) {
            state.rafId = requestAnimationFrame(resetCheck);
          } else {
            if (state.rafId) cancelAnimationFrame(state.rafId);
            state.rafId = undefined;
            el.style.transform = "";
            el.style.willChange = "";
            el.style.transition = "";
            const shadow = el.closest(".tile-wrapper")?.querySelector(".tile-shadow") as HTMLElement | null;
            if (shadow) shadow.style.boxShadow = `0 12px 40px rgba(0,0,0,0.25)`;
          }
        };
        state.rafId = requestAnimationFrame(resetCheck);
      };

      el.addEventListener("mouseenter", onEnter);

      // cleanup for this element when effect tears down
      const cleanup = () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("resize", updateBounds);
        if (state.rafId) cancelAnimationFrame(state.rafId);
        tilesRef.current.delete(el);
      };

      // store cleanup on the element dataset so we can call it later in a loop
      (el as any).__tiltCleanup = cleanup;
    });

    // overall cleanup on unmount
    return () => {
      tilesRef.current.forEach((_, el) => {
        const cleanup = (el as any).__tiltCleanup;
        if (typeof cleanup === "function") cleanup();
      });
      tilesRef.current.clear();
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard — VertexED Study Tools</title>
        <meta name="description" content="Choose from Study Zone, AI Chatbot, Planner, Paper Maker, Answer Reviewer, and Notetaker — all in one dashboard." />
        <link rel="canonical" href="https://www.vertexed.app/main" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Dot Grid Background */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        <DotGrid
          dotSize={3}
          gap={25}
          baseColor="#3a3a4a"
          activeColor="#4A9BB8"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
          style={{ opacity: 0.5 }}
        />
      </div>



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

          <div className="w-full md:w-1/3 text-slate-300 flex items-start justify-end gap-3">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-lg shadow-black/10">
              <h4 className="font-semibold mb-1">Quick tips</h4>
              <div className="text-xs text-slate-400">
                Hover a tile to preview its depth. Use Study Zone for deep sessions, Paper Maker for board-specific practice, and the
                Answer Reviewer to sharpen exam technique.
              </div>
            </div>

            {/* Settings (separate small control) */}
            <button
              aria-label="Settings"
              title="Settings"
              className="ml-3 p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/15 hover:bg-white/15 hover:border-white/25 transition flex items-center justify-center"
              onClick={() => window.location.assign("/user-settings")}
            >
              <SettingsIcon size={16} color="white" />
            </button>
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div ref={containerRef} className="glass-panel p-6 md:p-8 relative">
            {/* Responsive grid: 1 col on mobile, 2 cols on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiles.map((t) => (
                <Link to={t.to} key={t.title} className="group block tile-wrapper" aria-label={`${t.title} — ${t.info}`}>
                  <div className="tile-shadow h-full rounded-xl transition-all duration-400" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
                    <div
                      className="tile h-56 md:h-64 w-full"
                      role="button"
                      tabIndex={0}
                      aria-hidden={false}
                      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                    >
                      <NeumorphicCard
                        className="h-full p-6 glass-tile-translucent flex flex-col justify-between transition-all duration-400 group-hover:border-white/25 group-hover:bg-white/10"
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-semibold shadow-lg shadow-black/10" aria-hidden>
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
                          <span className="text-xs text-slate-500">Quick open</span>
                          <span className="text-sm text-white/70 font-medium group-hover:text-white transition-colors">Open →</span>
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

          <Link to="/study-zone" className="inline-block px-8 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 text-white font-semibold shadow-lg shadow-black/10 hover:bg-white/20 hover:border-white/35 hover:scale-105 transition-all duration-300">
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
