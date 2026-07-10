import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    const maxTilt = 5;

    const step = () => {
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;
      el.style.transform = `perspective(900px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
      rafId = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect();
      const nx = (e.clientX - b.left) / b.width - 0.5;
      const ny = (e.clientY - b.top) / b.height - 0.5;
      targetY = nx * maxTilt * 2;
      targetX = -ny * maxTilt * 2;
      if (!rafId) rafId = requestAnimationFrame(step);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      el.removeEventListener("mousemove", onMove);
    };

    const onEnter = () => {
      el.style.willChange = "transform";
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      if (!rafId) rafId = requestAnimationFrame(step);
    };

    const teardown = () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
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
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      import("@/pages/Main").catch(() => {}).finally(() => navigate("/main", { replace: true }));
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
        title="VertexED — Study tools built for marks and understanding"
        description="One workspace for planning, deliberate practice, rubric feedback, and spaced retrieval — built for students who want to score higher without sacrificing how they learn."
        canonical="https://www.vertexed.app/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "VertexED", url: "https://www.vertexed.app/" },
          { "@context": "https://schema.org", "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app", logo: "https://www.vertexed.app/logo.png" },
        ]}
      />

      <LiquidGlass as="section" variant="hero" className="hero-section px-6 md:px-10 pt-16 md:pt-24 pb-16 md:pb-20 text-center cinematic-section">
        <div className="max-w-5xl mx-auto">
          <p className="glass-chip mb-8 mx-auto w-fit">Built for exam season — and the weeks before it</p>

          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-bold text-foreground leading-[1.05] tracking-tight">
            <TypeAnimation
              sequence={[
                800,
                "Understand the concept.",
                1800,
                "Train for the mark scheme.",
                1800,
                "Walk in prepared.",
              ]}
              speed={42}
              wrapper="span"
              cursor
              repeat={Infinity}
            />
          </h1>

          <p className="mt-8 text-xl md:text-2xl font-medium text-foreground/90 max-w-3xl mx-auto leading-snug">
            Most study tools add features. Few help you maximise marks while actually learning the material.
          </p>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            VertexED is one loop — plan the week, run a focus block, practise under time, get rubric feedback,
            then retrieve it on schedule. Not twelve tabs. Not generic AI answers.
          </p>

          <div className="flex gap-4 justify-center mt-12 flex-wrap">
            <Link to="/signup" className="btn-solid text-lg">Start free</Link>
            <Link to="/features" className="btn-glass text-lg">How it works</Link>
          </div>
        </div>
      </LiquidGlass>

      <LandingStudyLoopStrip />

      <FloatingInsightDeck />

      <section className="max-w-6xl mx-auto px-6 py-16 cinematic-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-3">
          The problems students actually face
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Tap a card. These aren&apos;t marketing stats — they&apos;re the patterns we kept hearing during exam season.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_PROBLEMS.map((p, i) => (
            <ProblemFlipCard key={p.title} problem={p} index={i} />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 cinematic-section">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3 text-center">The toolkit</p>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-center leading-tight mb-4">
          Six tools. One revision loop.
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
          Each piece does a specific job — plan the week, focus, practise under time, review against rubrics, remember on schedule.
        </p>
        <div className="space-y-20 md:space-y-28">
          {LANDING_FEATURES.map((f, i) => (
            <LandingFeatureRow key={f.title} feature={f} index={i} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/features" className="btn-glass">Full feature walkthrough →</Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-8 px-6 cinematic-section">
        <div className="neu-card p-10 md:p-12 text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">How we think about learning</h2>
          <p className="text-lg leading-relaxed text-foreground/90 mb-5">
            Education was never the problem — access to the right structure was. VertexED connects planning to
            practice to review: set a goal, work in Study Zone, generate a paper aligned to your board,
            and get feedback that names what to fix — not a vague &ldquo;good effort.&rdquo;
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            We care as much about curiosity as scores. A Sunday session should feel purposeful: you know
            what to do, you can see progress, and the material stays with you past the week of the test.
          </p>
          <ul className="space-y-3 text-foreground/90">
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Active recall in notes, flashcards, and quizzes</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Mock papers that respect mark schemes</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> AI that explains your reasoning — not a substitute for it</li>
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-28 cinematic-section">
        <div className="neu-card p-10 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built by students, used by students</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Three co-founders who wanted one workspace instead of twelve tabs. We still use VertexED during
            exam season — that keeps us honest about what actually helps when the clock matters.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {founders.map((f) => (
              <div key={f.name} className="neu-card p-6">
                <p className="font-semibold text-foreground">{f.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.role}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-glass">Read our story</Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-20 mb-16 text-center cinematic-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">Ready when you are</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Waitlist if you&apos;re early. Invite code if someone on the team fast-tracked you.
          Either way — one focused session tonight tells you if this fits how you actually study.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup" className="btn-solid text-lg">Get started</Link>
          <a href="mailto:vertexed.25@gmail.com" className="btn-glass text-lg">Say hello</a>
        </div>
      </section>
    </>
  );
}
