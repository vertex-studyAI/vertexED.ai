import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import FeatureShowcase from "@/components/features/FeatureShowcase";
import RichMarkdown from "@/components/RichMarkdown";
import {
  MATH_DEMO_LINES,
  PLATFORM_FEATURES,
  STUDY_LOOP,
  SUPPORTED_BOARDS,
} from "@/content/features";

const prefersReducedMotion = () =>
  typeof window === "undefined" || !window.matchMedia
    ? true
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Features() {
  const [activeId, setActiveId] = useState(PLATFORM_FEATURES[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;

    let cleanup = () => {};
    const idle = (cb: () => void) =>
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 1500 })
        : (setTimeout(cb, 400) as unknown as number);
    const cancel = (id: number) =>
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    const id = idle(async () => {
      try {
        const [{ default: gsap }, mod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        const ScrollTrigger = (mod as { default?: unknown }).default ?? mod;
        gsap.registerPlugin(ScrollTrigger as object);

        gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 56, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.05,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" },
            },
          );
        });

        PLATFORM_FEATURES.forEach((f) => {
          const el = document.getElementById(f.id);
          if (!el) return;
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: () => setActiveId(f.id),
            onEnterBack: () => setActiveId(f.id),
          });
        });

        cleanup = () => {
          try {
            (ScrollTrigger as { getAll?: () => Array<{ kill?: () => void }> }).getAll?.().forEach((t) => t.kill?.());
          } catch {}
        };
      } catch {}
    });

    return () => {
      cancel(id);
      cleanup();
    };
  }, []);

  return (
    <>
      <SEO
        title="Features · VertexED"
        description="Study Zone, Apex, Planner, Paper Maker, Answer Reviewer, and Notes — how each tool fits into one study loop."
        canonical="https://www.vertexed.app/features"
      />
      <Helmet>
        <meta name="robots" content="index, follow" />
      </Helmet>

      <section className="feat-hero px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-24 reveal-section">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-5">How VertexED works</p>
          <h1 className="text-[clamp(2.25rem,7vw,4.5rem)] font-bold text-foreground leading-[1.05] tracking-tight max-w-4xl">
            Six tools.
            <br />
            <span className="text-muted-foreground">One study loop.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-foreground/88 leading-relaxed max-w-2xl">
            Nothing here exists to fill a pricing page. Each tool does a specific job in the cycle:
            plan your week, focus without tab chaos, practise with real papers, review with honest feedback,
            and remember what you learned. Below is how they connect — with examples from actual revision weeks.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-solid">Start free</Link>
            <Link to="/" className="btn-glass">Back home</Link>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-16 reveal-section">
        <div className="max-w-6xl mx-auto glass-panel p-8 md:p-10">
          <h2 className="text-sm uppercase tracking-[0.18em] text-primary mb-6">The loop</h2>
          <div className="feat-loop-grid">
            {STUDY_LOOP.map((item, i) => (
              <div key={item.step} className="feat-loop-step">
                <span className="feat-loop-index">{i + 1}</span>
                <p className="font-semibold text-foreground">{item.step}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-8 reveal-section">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
          {SUPPORTED_BOARDS.map((b) => (
            <span key={b} className="glass-chip text-xs">{b}</span>
          ))}
          <span className="glass-chip text-xs text-muted-foreground">Unaffiliated with exam boards</span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
        <div className="feat-layout">
          <nav className="feat-sidebar hidden lg:block" aria-label="Feature sections">
            <div className="feat-sidebar-inner glass-tile p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 px-2">Jump to</p>
              <ul className="space-y-1">
                {PLATFORM_FEATURES.map((f, i) => (
                  <li key={f.id}>
                    <a
                      href={`#${f.id}`}
                      className={`feat-sidebar-link ${activeId === f.id ? "is-active" : ""}`}
                    >
                      <span className="tabular-nums text-primary/50">{String(i + 1).padStart(2, "0")}</span>
                      <span>{f.title.split(" · ")[0]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="feat-main space-y-16 md:space-y-24">
            {PLATFORM_FEATURES.map((f, i) => (
              <FeatureShowcase key={f.id} feature={f} index={i} />
            ))}
          </div>
        </div>
      </div>

      <section className="px-4 md:px-6 pb-16 reveal-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">Math in context</h2>
          <p className="text-center text-muted-foreground mb-8 leading-relaxed">
            Notation renders across tools — no LaTeX typing on your end.
          </p>
          <div className="grid gap-3">
            {MATH_DEMO_LINES.map((line) => (
              <div key={line} className="glass-tile p-5">
                <RichMarkdown className="prose-base">{line}</RichMarkdown>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-24 reveal-section">
        <div className="max-w-3xl mx-auto glass-panel p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Run one full loop this week</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Plan one block in the calendar. Sit a mock from Paper Maker. Send one answer to the reviewer.
            Turn one page of notes into five flashcards. See if the workflow clicks — that's the whole point.
          </p>
          <Link to="/signup" className="btn-solid text-lg">Create account</Link>
        </div>
      </section>
    </>
  );
}
