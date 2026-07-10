import React, { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import RichMarkdown from "@/components/RichMarkdown";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

type FlipWordsProps = { words: string[]; interval?: number; className?: string };
const FlipWords: React.FC<FlipWordsProps> = ({ words, interval = 2400, className }) => {
  const [idx, setIdx] = React.useState(0);
  const [phase, setPhase] = React.useState<"in" | "out">("in");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => {
      setPhase("out");
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setPhase("in");
      }, 260);
    }, interval);
    return () => window.clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={`flip-words inline-block ${className || ""}`} aria-live="polite">
      <span className={`fw-word fw-${phase}`}>{words[idx]}</span>
    </span>
  );
};

const founders = [
  { name: "Ryan Gomez", role: "Co-founder · AI Product" },
  { name: "Pratyush Vel Shankar", role: "Co-founder · Vision" },
  { name: "Ritayush Dey", role: "Co-founder · Engineering" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const missionRef = useRef<HTMLDivElement | null>(null);
  const gsapCleanupRef = useRef<() => void>(() => {});

  const problems = useMemo(
    () => [
      {
        stat: "65%",
        title: "Resources that don't connect",
        text: "Most students spend hours hunting through PDFs, YouTube playlists, and random problem sets — but still can't tell if they're actually getting closer to exam-ready. The information is there; the structure isn't.",
      },
      {
        stat: "70%",
        title: "Notes that never become recall",
        text: "Highlighting feels productive until you close the notebook and realise nothing stuck. Without deliberate retrieval practice, revision becomes passive re-reading — and exams punish that every time.",
      },
      {
        stat: "80%",
        title: "Practice that misses the mark",
        text: "Generic quizzes rarely mirror the phrasing, rigour, or mark schemes of real papers. Students train on the wrong shape of question — then wonder why the exam room feels unfamiliar.",
      },
    ],
    [],
  );

  const pillars = useMemo(
    () => [
      {
        title: "Study Zone",
        desc: "A single calm workspace for calculators, timers, activity logs, and deep-focus sessions. No tab-hopping, no context switching — just the tools you reach for when it's actually time to work.",
      },
      {
        title: "Apex",
        desc: "An academic companion that explains ideas in plain language first, then builds depth. Ask why a step works, not just what the answer is. It adapts to how you think, not how a textbook is organised.",
      },
      {
        title: "Exam prep",
        desc: "Paper Maker and Answer Reviewer mirror real mark schemes. Generate syllabus-aligned mocks, submit responses, and get feedback on structure and precision — the kind of detail that moves grades.",
      },
    ],
    [],
  );

  const mathExamples = useMemo(
    () => [
      "The area under f(x) from 0 to 2 is given by ∫_0^2 f(x) dx.",
      "For y = x^3, the derivative dy/dx = 3x^2.",
      "Quadratic roots: x = (-b ± √(b^2 - 4ac)) / 2a.",
    ],
    [],
  );

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

        gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
          gsap.fromTo(
            section,
            { y: 48, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((card, i) => {
          gsap.fromTo(
            card,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              delay: i * 0.08,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none reverse" },
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
      try { gsapCleanupRef.current(); } catch {}
      cleanup();
    };
  }, []);

  return (
    <>
      <SEO
        title="VertexED — Study tools that respect how you learn"
        description="VertexED brings planning, practice, notes, and AI feedback into one calm study space — built by students, for students who want to learn deeply and perform on exam day."
        canonical="https://www.vertexed.app/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VertexED",
            url: "https://www.vertexed.app/",
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "VertexED",
            url: "https://www.vertexed.app",
            logo: "https://www.vertexed.app/logo.png",
          },
        ]}
      />

      <section className="hero-section glass-card px-6 md:px-10 pt-16 md:pt-24 pb-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="glass-chip mb-6 mx-auto w-fit">Built at Oakridge · For students who care about the work</p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.08] tracking-tight">
            <TypeAnimation
              sequence={[
                1000,
                "Study with intention.",
                2200,
                "Practice with precision.",
                2200,
                "Remember what matters.",
              ]}
              speed={42}
              wrapper="span"
              cursor
              repeat={Infinity}
            />
          </h1>

          <p className="mt-5 text-xl md:text-2xl font-medium text-muted-foreground">
            <FlipWords
              words={[
                "Less noise. More understanding.",
                "Feedback that reads like a teacher.",
                "Math that actually looks like math.",
                "One place for the whole workflow.",
              ]}
            />
          </p>

          <p className="mt-8 text-lg md:text-xl text-foreground/85 leading-relaxed max-w-2xl mx-auto">
            VertexED is not another chatbot bolted onto a PDF viewer. It is a study environment —
            planner, notes, mock papers, and an AI companion — designed around how memory actually
            works: retrieval, spacing, and honest feedback when your answer is almost there but not quite.
          </p>

          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <Link to="/signup" className="btn-solid text-lg">
              Start free
            </Link>
            <Link to="/about" className="btn-glass text-lg">
              Meet the founders
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-20 reveal-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-3">
          Math should look like math
        </h2>
        <p className="text-center text-muted-foreground text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Integrals, derivatives, and roots render properly across the app — no LaTeX typing required.
          We parse the notation you already use and display it the way your textbook does.
        </p>
        <div className="grid gap-4">
          {mathExamples.map((ex) => (
            <div key={ex} className="glass-tile p-6 reveal-card text-left">
              <RichMarkdown className="prose-base">{ex}</RichMarkdown>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-24 reveal-section text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Studying broke somewhere along the way.
        </h2>
        <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          It is not that students lack motivation — it is that the tools scatter attention, reward
          passive reading, and rarely tell you whether tonight&apos;s session moved the needle. We built
          VertexED because we felt that gap every week during IB prep.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {problems.map((p) => (
          <article key={p.title} className="glass-tile p-8 reveal-card text-left h-full">
            <p className="text-4xl font-bold text-primary mb-2 tabular-nums">{p.stat}</p>
            <h3 className="text-xl font-semibold text-foreground mb-3">{p.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{p.text}</p>
          </article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto mt-20 px-6 reveal-section">
        <div ref={missionRef} className="glass-panel p-10 md:p-12 text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">What we are building toward</h2>
          <p className="text-lg leading-relaxed text-foreground/90 mb-5">
            Education was never the problem — access to the right structure was. VertexED connects
            planning to practice to review in one loop: you set a goal, work in Study Zone, generate
            papers aligned to your syllabus, and get feedback that names what to fix next — not a vague
            &ldquo;good effort.&rdquo;
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground mb-5">
            We care as much about curiosity as scores. The aim is an environment where a Sunday
            afternoon session feels purposeful: you know what to do, you can see progress, and the
            material stays with you past the week of the test.
          </p>
          <ul className="space-y-3 text-foreground/90">
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Active recall woven into notes, flashcards, and quizzes</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Mock papers that respect mark schemes, not generic trivia</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> An AI layer that explains, not just answers</li>
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-24 reveal-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">Three pillars</h2>
        <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Everything else in the product hangs off these — we would rather do a few things properly than list twenty that sound impressive.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <article key={p.title} className="glass-tile p-8 reveal-card">
              <h3 className="text-xl font-semibold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-24 reveal-section">
        <div className="glass-panel p-10 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">The people behind it</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Vertex started at Oakridge Codefest — three classmates who wanted one workspace instead of
            twelve tabs. We still use the product ourselves during exam season; that keeps us honest
            about what actually helps at 11pm on a Tuesday.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {founders.map((f) => (
              <div key={f.name} className="glass-tile p-6 reveal-card">
                <p className="font-semibold text-foreground">{f.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.role}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-glass">
            Read our story
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-24 mb-16 text-center reveal-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">Ready when you are</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          No credit card, no sales call. Create an account, set your board, and run one focused session.
          If it clicks, stay — if not, tell us what is missing.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup" className="btn-solid text-lg">Create account</Link>
          <a href="mailto:vertexed.25@gmail.com" className="btn-glass text-lg">Say hello</a>
        </div>
      </section>
    </>
  );
}
