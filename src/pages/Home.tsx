import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";
import ProblemFlipCard from "@/components/landing/ProblemFlipCard";
import LandingFeatureRow from "@/components/landing/LandingFeatureRow";
import LandingStudyLoopStrip from "@/components/landing/LandingStudyLoopStrip";
import FloatingInsightDeck from "@/components/landing/FloatingInsightDeck";
import LiquidGlass from "@/components/LiquidGlass";
import { LANDING_FEATURES, LANDING_PROBLEMS } from "@/content/landing";

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const founders = [
  { name: "Ryan Gomez", role: "Co-founder · AI Product" },
  { name: "Pratyush Vel Shankar", role: "Co-founder · Vision" },
  { name: "Ritayush Dey", role: "Co-founder · Engineering" },
];

function bindTiltCards() {
  if (prefersReducedMotion()) return () => {};
  const canTilt = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (!canTilt) return () => {};

  const cleanups: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>(".tilt-card").forEach((el) => {
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let rafId = 0;
    let isActive = false;
    const maxTilt = 5;
    const settleThreshold = 0.02;

    const step = () => {
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;

      const settled =
        Math.abs(targetX - curX) < settleThreshold &&
        Math.abs(targetY - curY) < settleThreshold;

      if (!isActive && settled) {
        curX = 0;
        curY = 0;
        rafId = 0;
        el.style.transform = "";
        el.style.willChange = "";
        return;
      }

      el.style.transform = `perspective(900px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
      rafId = requestAnimationFrame(step);
    };

    const ensureAnimationFrame = () => {
      if (!rafId) rafId = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect();
      const nx = (e.clientX - b.left) / b.width - 0.5;
      const ny = (e.clientY - b.top) / b.height - 0.5;
      targetY = nx * maxTilt * 2;
      targetX = -ny * maxTilt * 2;
      ensureAnimationFrame();
    };

    const onLeave = () => {
      isActive = false;
      targetX = 0;
      targetY = 0;
      el.removeEventListener("mousemove", onMove);
      ensureAnimationFrame();
    };

    const onEnter = () => {
      isActive = true;
      el.style.willChange = "transform";
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      ensureAnimationFrame();
    };

    const teardown = () => {
      isActive = false;
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      el.style.transform = "";
      el.style.willChange = "";
    };

    el.addEventListener("mouseenter", onEnter);
    cleanups.push(teardown);
  });

  return () => cleanups.forEach((fn) => fn());
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const gsapCleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/main", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;

    const tiltCleanup = bindTiltCards();
    let cleanup = () => {};
    const idle = (cb: () => void) =>
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);
    const cancelIdle = (id: number) =>
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    const idleId = idle(async () => {
      try {
        const [{ default: gsap }, ScrollTriggerModule] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        const ScrollTrigger = (ScrollTriggerModule as { default?: unknown }).default ?? ScrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger as object);

        gsap.utils.toArray<HTMLElement>(".cinematic-section").forEach((section) => {
          gsap.fromTo(
            section,
            { y: 72, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, i) => {
          gsap.fromTo(
            row,
            { x: i % 2 === 0 ? -64 : 64, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: row, start: "top 88%", toggleActions: "play none none reverse" },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".problem-card-container").forEach((card, i) => {
          gsap.fromTo(
            card,
            { scale: 0.88, opacity: 0, y: 48 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay: i * 0.08,
              ease: "back.out(1.4)",
              scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none reverse" },
            },
          );
        });

        cleanup = () => {
          try {
            const ST = ScrollTrigger as { getAll?: () => Array<{ kill?: () => void }> };
            ST.getAll?.().forEach((t) => t.kill?.());
          } catch {}
        };
        gsapCleanupRef.current = cleanup;
      } catch {}
    });

    return () => {
      cancelIdle(idleId);
      tiltCleanup();
      try { gsapCleanupRef.current(); } catch {}
      cleanup();
    };
  }, []);

  return (
    <>
      <SEO
        title="AI Study Planner & Exam Practice Tools | VertexED"
        description="VertexED connects revision planning, focused study, exam-style practice, rubric feedback, notes, flashcards, quizzes, and AI support in one study workflow."
        keywords="AI study planner, MYP study guides, IGCSE paper generator, IB practice papers, revision planner, study tools for students"
        canonical="https://www.vertexed.app/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "VertexED", url: "https://www.vertexed.app/" },
          { "@context": "https://schema.org", "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app", logo: "https://www.vertexed.app/logo.png" },
        ]}
      />

      <LiquidGlass as="section" variant="hero" className="hero-section px-6 md:px-10 pt-16 md:pt-24 pb-16 md:pb-20 text-center cinematic-section">
        <div className="max-w-5xl mx-auto">
          <p className="glass-chip mb-8 mx-auto w-fit">One system for your next exam</p>

          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-bold text-foreground leading-[1.05] tracking-tight">
            <TypeAnimation
              sequence={[
                800,
                "Know what to study.",
                1800,
                "Practise like the exam.",
                1800,
                "Turn feedback into marks.",
                1800,
                "Remember it on test day.",
              ]}
              speed={42}
              wrapper="span"
              cursor
              repeat={Infinity}
            />
          </h1>

          <p className="mt-8 text-xl md:text-2xl font-medium text-foreground/90 max-w-3xl mx-auto leading-snug">
            VertexED connects your plan, focused study, exam-style practice, rubric feedback, and retrieval into one loop —
            so every session answers two questions: what do I do now, and what do I do next?
          </p>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Build the week. Run the session. Sit the paper. Find the lost marks. Revisit the weak topics before they fade.
            One workspace that keeps the next move clear.
          </p>

          <div className="flex gap-4 justify-center mt-12 flex-wrap">
            <Link to="/signup" className="btn-solid text-lg">Start studying free</Link>
            <Link to="/features" className="btn-glass text-lg">See the system</Link>
          </div>
        </div>
      </LiquidGlass>

      <LandingStudyLoopStrip />

      <FloatingInsightDeck />

      <section className="max-w-6xl mx-auto px-6 py-16 cinematic-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-3">
          Studying is not the hard part. Knowing what works is.
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          The real problem is fragmentation: plans that do not drive practice, feedback that does not change revision,
          and notes that never get tested. VertexED is built to close those gaps.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_PROBLEMS.map((p, i) => (
            <ProblemFlipCard key={p.title} problem={p} index={i} />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 cinematic-section">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3 text-center">The VertexED loop</p>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-center leading-tight mb-4">
          Six tools. One clear next move.
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
          Everything in VertexED has one job: move you to the next useful action — from planning, to practice, to feedback, to recall.
        </p>
        <div className="space-y-20 md:space-y-28">
          {LANDING_FEATURES.map((f, i) => (
            <LandingFeatureRow key={f.title} feature={f} index={i} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/features" className="btn-glass">Explore every tool →</Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-8 px-6 cinematic-section">
        <div className="neu-card p-10 md:p-12 text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">A study loop that gets smarter after every attempt</h2>
          <p className="text-lg leading-relaxed text-foreground/90 mb-5">
            We built VertexED around a simple idea: the output of one study step should become the input to the next.
            A plan should become focused work. Practice should reveal gaps. Feedback should change the next attempt.
            Weak topics should come back through retrieval before the exam.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            That means less time deciding what to open and more time doing the work that matters. The goal is not to make studying effortless.
            It is to make progress visible, practice deliberate, and the next step obvious.
          </p>
          <ul className="space-y-3 text-foreground/90">
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Plan around real deadlines and the time you actually have</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Practise in exam-shaped formats and review against rubrics</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Turn weak topics into targeted retrieval instead of another forgotten to-do</li>
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-28 cinematic-section">
        <div className="neu-card p-10 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built by students who use it to study</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            We wanted one place that could carry a revision session from “what should I do?” to “what did I learn, and what comes next?”
            We still use VertexED during exam season, which keeps the product anchored to the moments where study tools actually have to work.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {founders.map((f) => (
              <div key={f.name} className="neu-card p-6">
                <p className="font-semibold text-foreground">{f.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.role}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-glass">Meet the team</Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 mb-16 text-center cinematic-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">Make the next study session count</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          VertexED is in private beta. Join the beta or use a team invite to try the full loop: plan one real week,
          practise one real paper, review the gaps, and come back to the topics that need another pass.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup" className="btn-solid text-lg">Join VertexED</Link>
          <Link to="/features" className="btn-glass text-lg">Explore the tools</Link>
        </div>
      </section>
    </>
  );
}
