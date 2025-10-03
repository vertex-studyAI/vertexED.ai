import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";

export default function Main() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRefs = useRef<Map<HTMLElement, number>>(new Map());

  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "All-in-1 workspace: calculators, activity logs, and focused-session helpers." },
    { title: "AI Chatbot", to: "/chatbot", info: "A discussion-first agent for explanations, research prompts and step-by-step help." },
    { title: "Study Planner", to: "/planner", info: "Adaptive schedule builder that fits practice around life and priorities." },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Rubric-aware feedback with clear, actionable steps to raise your grade." },
    { title: "Paper Maker", to: "/paper-maker", info: "Board-aligned practice papers with authentic phrasing and mark schemes." },
    { title: "Note Taker + Flashcards", to: "/notetaker", info: "Capture lectures, auto-summarise and turn notes into flashcards & quizzes." },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Fade-up for headings / intro (same behavior as Home)
    const fadeUps = gsap.utils.toArray<HTMLElement>(".fade-up");
    fadeUps.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 70, opacity: 0, scale: 0.995 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          stagger: 0.03,
        }
      );
    });

    // Feature rows slide in left/right (consistent with Home)
    const rows = gsap.utils.toArray<HTMLElement>(".feature-row");
    rows.forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: i % 2 === 0 ? -80 : 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
          },
        }
      );
    });

    // Per-tile tilt & hover using mousemove -> lightweight requestAnimationFrame
    const tilesEls = gsap.utils.toArray<HTMLElement>(".tile");
    tilesEls.forEach((el) => {
      let bounds = el.getBoundingClientRect();

      const onMove = (e: MouseEvent) => {
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const halfW = bounds.width / 2;
        const halfH = bounds.height / 2;
        const rotY = ((x - halfW) / halfW) * 4; // softer rotation
        const rotX = ((halfH - y) / halfH) * 4;

        const prev = rafRefs.current.get(el);
        if (prev) cancelAnimationFrame(prev);
        const id = requestAnimationFrame(() => {
          // subtle 3d transform + translateZ for depth
          el.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
          (el.querySelector(".tile-shadow") as HTMLElement | null)?.style.setProperty(
            "box-shadow",
            `${-rotY * 2}px ${rotX * 2}px 28px rgba(2,6,23,0.45)`
          );
        });
        rafRefs.current.set(el, id);
      };

      const onEnter = () => {
        el.style.transition = "transform 0.12s ease-out";
        el.style.willChange = "transform";
        bounds = el.getBoundingClientRect();
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        el.classList.add("tile-hovering");
      };

      const onLeave = () => {
        const prev = rafRefs.current.get(el);
        if (prev) cancelAnimationFrame(prev);
        el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
        (el.querySelector(".tile-shadow") as HTMLElement | null)?.style.setProperty(
          "box-shadow",
          `0 18px 50px rgba(12,18,40,0.55)`
        );
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.classList.remove("tile-hovering");
      };

      el.addEventListener("mouseenter", onEnter);

      // update bounds on resize
      const onResize = () => {
        bounds = el.getBoundingClientRect();
      };
      window.addEventListener("resize", onResize);

      // cleanup
      return () => {
        el.removeEventListener("mouseenter", onEnter);
        window.removeEventListener("resize", onResize);
      };
    });

    // cleanup when component unmounts
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      // cancel RAFs
      rafRefs.current.forEach((id) => cancelAnimationFrame(id));
      rafRefs.current.clear();
    };
  }, []);

  return (
    <>
      {/* Intro — inline with existing layout/backdrop (no header/meta) */}
      <section className="fade-up px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              <TypeAnimation
                sequence={[700, "Welcome to Vertex AI", 1200, "Pick a tool and get into flow."]}
                wrapper="span"
                cursor={false}
              />
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

      {/* The unified rectangle containing all tiles (fits into existing backdrop) */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div
            ref={containerRef}
            className="relative rounded-3xl overflow-hidden border border-slate-700 bg-gradient-to-br from-slate-900/65 to-slate-800/60 shadow-2xl p-6 md:p-8"
          >
            {/* grid makes the tiles read as one rectangular block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tiles.map((t, i) => (
                <Link to={t.to} key={t.title} className="group block">
                  <div className="tile-shadow h-full rounded-xl transition-all duration-400" style={{ boxShadow: "0 18px 50px rgba(12,18,40,0.55)" }}>
                    <div className="tile h-56 md:h-64 w-full" aria-hidden={false}>
                      <NeumorphicCard
                        className="h-full p-6 rounded-xl flex flex-col justify-between bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700 shadow-none transition-all duration-400 group-hover:border-indigo-400"
                        title={t.title}
                        info={t.info}
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-sm">
                              {t.title
                                .split(" ")
                                .map((s) => s[0])
                                .slice(0, 2)
                                .join("")}
                            </div>

                            <div>
                              <h3 className="text-2xl font-semibold text-slate-100">{t.title}</h3>
                              <p className="text-xs text-slate-400 mt-1">{t.info}</p>
                            </div>
                          </div>
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

            {/* subtle decorative outline */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 transition-all duration-500" />
          </div>
        </div>
      </section>

      {/* Footer CTA area (keeps styling consistent with Home) */}
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
