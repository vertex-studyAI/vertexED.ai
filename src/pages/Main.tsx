import NeumorphicCard from "@/components/NeumorphicCard";

import { Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { Helmet } from "react-helmet-async";
import { Flame, Settings as SettingsIcon, Target, TrendingUp, Zap, Brain, FileText, MessageCircle, BookOpen, Route } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { buildEcosystemBrief, type EcosystemBrief } from "@/lib/studyEcosystem";
import { gradeLevelLabel, studyGoalLabel } from "@/lib/learnerProfile";
import { listStudyArtifactsDetailed, type StudyArtifact } from "@/lib/userContent";
import SavedWorkList from "@/components/SavedWorkList";
import EcosystemPanel from "@/components/EcosystemPanel";

type Tile = {
  title: string;
  to: string;
  info: string;
  icon?: React.ReactNode;
};

export default function Main() {
  const { user } = useAuth();
  const [brief, setBrief] = useState<EcosystemBrief | null>(null);
  const [recentArtifacts, setRecentArtifacts] = useState<StudyArtifact[]>([]);
  const [showWelcome, setShowWelcome] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("vertex_welcome") === "1",
  );
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
    { title: "Learning Hub", to: "/learning-hub", info: "Your connected study ecosystem — paths, subjects, and daily progress.", icon: hubIcon() },
    { title: "Study Zone", to: "/study-zone", info: "Your all-in-one desk — timers, notes, graphing, and more.", icon: studyIcon() },
    { title: "AI Chatbot", to: "/chatbot", info: "Stuck on something? Ask for explanations, steps, or ideas.", icon: chatIcon() },
    { title: "Study Planner", to: "/planner", info: "Build a schedule that actually fits around your life.", icon: plannerIcon() },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Get honest feedback and see exactly where to improve.", icon: reviewIcon() },
    { title: "Paper Maker", to: "/paper-maker", info: "Practice papers that sound like the real thing, with mark schemes.", icon: paperIcon() },
    { title: "AI Notes + Flashcards", to: "/notetaker", info: "Turn lectures into notes, flashcards, and quizzes.", icon: notesIcon() },
    { title: "Study Tools Hub", to: "/study-tools", info: "Formula sheets, study techniques, and quick tool links.", icon: toolsIcon() },
    { title: "Archives Subjects", to: "/archives", info: "Curated notes and exemplars, sorted by subject.", icon: archiveIcon() },
    // settings rendered in header
  ];

  useEffect(() => {
    const refresh = () => setBrief(buildEcosystemBrief(user));
    refresh();
    void listStudyArtifactsDetailed().then((r) => setRecentArtifacts(r.items.slice(0, 4)));
    window.addEventListener("focus", refresh);
    if (showWelcome) sessionStorage.removeItem("vertex_welcome");
    return () => window.removeEventListener("focus", refresh);
  }, [showWelcome, user]);

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

  const suggestions = brief?.suggestions ?? [];
  const goalLabel = brief ? studyGoalLabel(brief.profile.studyGoal) : null;
  const gradeLabel = brief ? gradeLevelLabel(brief.profile.gradeLevel) : null;
  const dueFlashcards = brief?.dueFlashcards ?? 0;
  const stats = brief?.stats ?? null;

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
        <div className="max-w-6xl mx-auto glass-panel p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-primary/80 mb-2">
              {brief ? `${brief.greeting}, ${brief.profile.displayName}` : "Welcome to Vertex AI"}
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              <TypeAnimation sequence={[700, "Your study ecosystem", 1200, "Learn. Practice. Review. Remember."]} wrapper="span" cursor={false} />
            </h1>
            <p className="mt-4 text-white/70 max-w-2xl leading-relaxed">
              Everything connects here — notes flow into flashcards, papers into reviews, and progress follows you across every tool.
            </p>
            {(goalLabel || gradeLabel) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {goalLabel && (
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                    {goalLabel}
                  </span>
                )}
                {gradeLabel && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/55">
                    {gradeLabel}
                  </span>
                )}
              </div>
            )}
            <p className="mt-3 text-xs text-white/45 max-w-xl">
              Study Zone for deep focus, Learning Hub for your path, Paper Maker and Answer Reviewer for exam prep.
            </p>
          </div>

          <button
            aria-label="Settings"
            title="Settings"
            className="shrink-0 p-3 rounded-2xl glass-tile hover:border-white/30 transition flex items-center justify-center"
            onClick={() => window.location.assign("/user-settings")}
          >
            <SettingsIcon size={18} color="white" />
          </button>
        </div>
      </section>

      {showWelcome && (
        <section className="px-6 pb-4 fade-up">
          <div className="max-w-6xl mx-auto rounded-xl border border-primary/25 bg-primary/10 px-5 py-4 text-sm text-white/90">
            <p className="font-medium text-primary">Welcome to Vertex — you&apos;re all set.</p>
            <p className="mt-1 text-white/70">
              Start with Study Zone for a focused session, or generate notes and a mock paper from the dashboard.
            </p>
          </div>
        </section>
      )}

      {stats && brief && (
        <section className="px-6 pb-8 fade-up">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard to="/study-zone" icon={<Flame className="h-5 w-5 text-orange-400" />} label="Study streak" value={`${stats.studyStreak} day${stats.studyStreak === 1 ? "" : "s"}`} />
            <StatCard to="/study-zone" icon={<Target className="h-5 w-5 text-primary" />} label="Habits done" value={`${stats.habitsDoneToday}/${stats.habitCount}`} />
            <StatCard to="/notetaker" icon={<Brain className="h-5 w-5 text-violet-400" />} label="Due flashcards" value={String(brief.dueFlashcards)} />
            <StatCard to="/planner" icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} label="Tasks today" value={String(brief.todayTasks.length)} />
          </div>
        </section>
      )}

      {brief && (
        <EcosystemPanel
          todayTasks={brief.todayTasks}
          recentActivity={brief.recentActivity}
          learningPath={brief.learningPath}
          dailyProgress={brief.dailyProgress}
        />
      )}

      <section className="px-6 pb-6 fade-up">
        <div className="max-w-6xl mx-auto">
          <div className="glass-panel p-4 md:p-5">
            <p className="text-xs uppercase tracking-widest text-white/45 mb-3">Quick actions</p>
            <div className="flex flex-wrap gap-2">
              <QuickAction to="/learning-hub" icon={<Route className="h-4 w-4" />} label="Learning Hub" />
              <QuickAction to="/study-zone?focus=timer" icon={<Zap className="h-4 w-4" />} label="Focus session" />
              <QuickAction to="/notetaker" icon={<Brain className="h-4 w-4" />} label={dueFlashcards > 0 ? `Review ${dueFlashcards} cards` : "AI Notes"} />
              <QuickAction to="/paper-maker" icon={<FileText className="h-4 w-4" />} label="Mock paper" />
              <QuickAction to="/chatbot" icon={<MessageCircle className="h-4 w-4" />} label="Ask AI" />
              <QuickAction to="/study-tools" icon={<BookOpen className="h-4 w-4" />} label="Formulas" />
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm text-white/65">
                {suggestions.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {recentArtifacts.length > 0 && (
        <section className="px-6 pb-8 fade-up">
          <div className="max-w-6xl mx-auto glass-panel p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-white">Recent saved work</h2>
              <Link to="/user-settings" className="text-xs text-primary hover:underline">
                View all →
              </Link>
            </div>
            <SavedWorkList
              items={recentArtifacts}
              compact
              variant="dashboard"
              onChanged={() => void listStudyArtifactsDetailed().then((r) => setRecentArtifacts(r.items.slice(0, 4)))}
            />
          </div>
        </section>
      )}

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
                      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                    >
                      <NeumorphicCard
                        className="h-full p-6 glass-tile-translucent flex flex-col justify-between transition-all duration-400 group-hover:border-white/25 group-hover:bg-white/10"
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-semibold" aria-hidden>
                              {t.icon}
                            </div>

                            <div>
                              <h3 className="text-2xl font-semibold text-slate-100">{t.title}</h3>
                              <p className="text-xs text-slate-400 mt-1">{t.info}</p>
                            </div>
                          </div>

                          {/* icon description for screen readers */}
                          <span className="sr-only">{t.title} — {t.info}</span>
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

      <section className="fade-up px-6 pb-12">
        <div className="max-w-6xl mx-auto text-center glass-panel p-8 md:p-10">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">Ready to get back into flow?</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Your ecosystem remembers where you left off — planner tasks, flashcards due, and saved work are one click away.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/learning-hub" className="btn-glass px-8">
              Open Learning Hub
            </Link>
            <Link to="/study-zone?focus=timer" className="rounded-full border border-white/20 bg-white/8 px-8 py-3 text-sm text-white/90 hover:bg-white/14 transition">
              Start focus session
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ----------------------------
// Small inline SVG icon helpers to provide clearer icons + descriptions
// ----------------------------
function hubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
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
function toolsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ to, icon, label, value }: { to?: string; icon: React.ReactNode; label: string; value: string }) {
  const inner = (
    <>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </>
  );
  if (to) {
    return (
      <Link to={to} className="glass-tile rounded-2xl border border-white/10 px-4 py-3 flex items-center gap-3 hover:border-white/25 hover:bg-white/8 transition">
        {inner}
      </Link>
    );
  }
  return (
    <div className="glass-tile rounded-2xl border border-white/10 px-4 py-3 flex items-center gap-3">
      {inner}
    </div>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-sm text-white/90 hover:bg-white/14 hover:border-white/25 transition"
    >
      {icon}
      {label}
    </Link>
  );
}
