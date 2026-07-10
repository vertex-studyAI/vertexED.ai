import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import RichMarkdown from "@/components/RichMarkdown";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";
import FeatureShowcase from "@/components/features/FeatureShowcase";
import {
  MATH_DEMO_LINES,
  PLATFORM_FEATURES,
  PROBLEM_INSIGHTS,
  STUDY_LOOP,
} from "@/content/features";

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

type FlipWordsProps = { words: string[]; interval?: number; className?: string };
const FlipWords: React.FC<FlipWordsProps> = ({ words, interval = 2800, className }) => {
  const [idx, setIdx] = React.useState(0);
  const [phase, setPhase] = React.useState<"in" | "out">("in");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => {
      setPhase("out");
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setPhase("in");
      }, 280);
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
            { y: 56, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.15,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 86%", toggleActions: "play none none reverse" },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".reveal-card, .feature-strip").forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              delay: (i % 4) * 0.06,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".lando-line").forEach((line) => {
          gsap.fromTo(
            line,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: { trigger: line, start: "top 90%", toggleActions: "play none none reverse" },
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
        description="VertexED brings planning, practice, notes, and AI feedback into one calm study space — built for students who want to learn deeply and perform on exam day."
        canonical="https://www.vertexed.app/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "VertexED", url: "https://www.vertexed.app/" },
          { "@context": "https://schema.org", "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app", logo: "https://www.vertexed.app/logo.png" },
        ]}
      />

      <section className="hero-section glass-card px-6 md:px-10 pt-20 md:pt-28 pb-20 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <p className="glass-chip mb-8 mx-auto w-fit lando-line">For students who care about the work</p>

          <h1 className="text-[clamp(2.5rem,8vw,4.75rem)] font-bold text-foreground leading-[1.02] tracking-tight lando-line">
            <TypeAnimation
              sequence={[900, "Learn deeply.", 2000, "Practice deliberately.", 2000, "Perform on exam day."]}
              speed={40}
              wrapper="span"
              cursor
              repeat={Infinity}
            />
          </h1>

          <p className="mt-6 text-xl md:text-2xl font-medium text-muted-foreground lando-line">
            <FlipWords
              words={[
                "One workspace. Zero tab chaos.",
                "Feedback that reads like a teacher.",
                "Math that renders like your textbook.",
                "Built around how memory actually works.",
              ]}
            />
          </p>

          <p className="mt-10 text-lg md:text-xl text-foreground/88 leading-relaxed max-w-2xl mx-auto lando-line">
            VertexED is a study environment — not a chatbot stapled to a PDF viewer. Planner, notes, mock papers,
            spaced repetition, and an AI layer that explains before it answers. Everything connects: you plan a session,
            work in Study Zone, generate a paper, submit an answer, and see exactly what to fix next.
          </p>

          <div className="flex gap-4 justify-center mt-12 flex-wrap lando-line">
            <Link to="/signup" className="btn-solid text-lg">Start free</Link>
            <Link to="/about" className="btn-glass text-lg">Meet the team</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-28 reveal-section">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3 text-center">The toolkit</p>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-center leading-tight mb-4">
          Everything you need.<br className="hidden sm:block" /> Nothing you don&apos;t.
        </h2>
        <p className="text-center text-muted-foreground text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Six tools, one loop. Each does a specific job — the full walkthrough with real session examples lives on the features page.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-12">
          {STUDY_LOOP.map((item, i) => (
            <div key={item.step} className="feat-loop-step text-center sm:text-left">
              <span className="feat-loop-index mx-auto sm:mx-0">{i + 1}</span>
              <p className="font-semibold text-foreground text-sm">{item.step}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {PLATFORM_FEATURES.slice(0, 3).map((f, i) => (
            <FeatureShowcase key={f.id} feature={f} index={i} compact />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/features" className="btn-glass">See all six tools in depth →</Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-28 reveal-section">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-3">Math should look like math</h2>
        <p className="text-center text-muted-foreground text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          Integrals, derivatives, and roots render across the app — no LaTeX typing required.
          We parse the notation you already write and display it the way your textbook does.
        </p>
        <div className="grid gap-4">
          {MATH_DEMO_LINES.map((ex) => (
            <div key={ex} className="glass-tile p-6 reveal-card text-left">
              <RichMarkdown className="prose-base">{ex}</RichMarkdown>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-28 reveal-section text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight lando-line">
          Studying broke somewhere along the way.
        </h2>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed lando-line">
          It is rarely motivation that fails — it is structure. Tools scatter attention, reward passive reading,
          and almost never tell you whether tonight&apos;s session moved the needle. We built VertexED because
          we lived that gap during exam season and wanted one place that actually helped.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROBLEM_INSIGHTS.map((p) => (
          <article key={p.title} className="glass-tile p-8 reveal-card text-left h-full">
            <p className="text-4xl font-bold text-primary mb-2 tabular-nums">{p.stat}</p>
            <h3 className="text-xl font-semibold text-foreground mb-3">{p.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{p.text}</p>
          </article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto mt-24 px-6 reveal-section">
        <div className="glass-panel p-10 md:p-12 text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">How we think about learning</h2>
          <p className="text-lg leading-relaxed text-foreground/90 mb-5">
            Education was never the problem — access to the right structure was. VertexED connects planning to
            practice to review in one loop: set a goal, work in Study Zone, generate papers aligned to your syllabus,
            and get feedback that names what to fix — not a vague &ldquo;good effort.&rdquo;
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            We care as much about curiosity as scores. A Sunday afternoon session should feel purposeful: you know
            what to do, you can see progress, and the material stays with you past the week of the test.
          </p>
          <ul className="space-y-3 text-foreground/90">
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Active recall in notes, flashcards, and quizzes</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> Mock papers that respect mark schemes</li>
            <li className="flex gap-3"><span className="text-primary font-bold">→</span> An AI layer that explains, not just answers</li>
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-28 reveal-section">
        <div className="glass-panel p-10 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built by students, used by students</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Three co-founders who wanted one workspace instead of twelve tabs. We still use VertexED during
            exam season — that keeps us honest about what actually helps when the clock matters.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {founders.map((f) => (
              <div key={f.name} className="glass-tile p-6 reveal-card">
                <p className="font-semibold text-foreground">{f.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.role}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-glass">Read our story</Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-28 mb-20 text-center reveal-section">
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
