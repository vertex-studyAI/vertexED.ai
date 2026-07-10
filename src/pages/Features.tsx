import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import FeatureShowcase from "@/components/features/FeatureShowcase";
import RichMarkdown from "@/components/RichMarkdown";
import {
  BoardSpotlights,
  EcosystemExtras,
  FeatureFAQ,
  ScatterCompare,
  StudyLoopRail,
} from "@/components/features/FeatureSections";
import RevisionWeekTimeline from "@/components/features/FeatureSections";
import {
  MATH_DEMO_LINES,
  PLATFORM_FEATURES,
  SUPPORTED_BOARDS,
} from "@/content/features";

const prefersReducedMotion = () =>
  typeof window === "undefined" || !window.matchMedia
    ? true
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ALL_SECTIONS = [
  ...PLATFORM_FEATURES.map((f) => ({ id: f.id, label: f.title.split(" · ")[0] })),
  { id: "revision-week", label: "Revision week" },
  { id: "compare", label: "Compare" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "faq", label: "FAQ" },
];

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

        const trackIds = [
          ...PLATFORM_FEATURES.map((f) => f.id),
          "revision-week-heading",
          "compare-heading",
          "ecosystem-heading",
          "faq-heading",
        ];

        trackIds.forEach((sectionId) => {
          const el = document.getElementById(sectionId);
          if (!el) return;
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: () => setActiveId(sectionId.replace("-heading", "")),
            onEnterBack: () => setActiveId(sectionId.replace("-heading", "")),
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
        title="Features · VertexED — Full study ecosystem"
        description="Deep dive into Study Zone, Apex, Planner, Paper Maker, Answer Reviewer, Notes, Learning Hub, Archives, and how they connect in one revision loop."
        canonical="https://www.vertexed.app/features"
      />
      <Helmet>
        <meta name="robots" content="index, follow" />
      </Helmet>

      <section className="feat-hero px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-16 reveal-section">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.22em] text-primary mb-5">How VertexED works</p>
          <h1 className="text-[clamp(2.25rem,7vw,4.75rem)] font-bold text-foreground leading-[1.02] tracking-tight max-w-4xl">
            The full picture.
            <br />
            <span className="text-muted-foreground">Not the brochure version.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-foreground/88 leading-relaxed max-w-2xl">
            Six core tools, four supporting surfaces, one revision loop. Below: what each piece does,
            when to reach for it, what it is not trying to be, and how a real exam week flows through the system.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-solid">Start free</Link>
            <a href="#study-zone" className="btn-glass">Jump to tools</a>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 pb-12 reveal-section">
        <div className="max-w-6xl mx-auto glass-panel p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-primary mb-4">The loop — click a step</p>
          <StudyLoopRail />
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

      <BoardSpotlights />

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="feat-layout">
          <nav className="feat-sidebar hidden lg:block" aria-label="Feature sections">
            <div className="feat-sidebar-inner glass-tile p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 px-2">On this page</p>
              <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
                {ALL_SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`feat-sidebar-link ${activeId === s.id ? "is-active" : ""}`}
                      onClick={() => setActiveId(s.id)}
                    >
                      {PLATFORM_FEATURES.find((f) => f.id === s.id) && (
                        <span className="tabular-nums text-primary/50">{String(i + 1).padStart(2, "0")}</span>
                      )}
                      <span>{s.label}</span>
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

      <div id="revision-week">
        <RevisionWeekTimeline />
      </div>

      <div id="compare">
        <ScatterCompare />
      </div>

      <section className="px-4 md:px-6 pb-16 reveal-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">Math in context</h2>
          <p className="text-center text-muted-foreground mb-8 leading-relaxed">
            Notation renders across Apex, Answer Reviewer, and chat — no LaTeX typing on your end.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {MATH_DEMO_LINES.map((line) => (
              <div key={line} className="glass-tile p-5">
                <RichMarkdown className="prose-base">{line}</RichMarkdown>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="ecosystem">
        <EcosystemExtras />
      </div>

      <div id="faq">
        <FeatureFAQ />
      </div>

      <section className="px-4 md:px-6 pb-28 reveal-section">
        <div className="max-w-3xl mx-auto glass-panel p-10 md:p-14 text-center feat-cta-glow">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Run one full loop this week</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Monday: plan the week. Tuesday: 25-minute Study Zone block. Wednesday: stress-test an essay with Apex.
            Thursday: mock under time. Friday: read reviewer feedback and schedule retries.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            If that workflow clicks, you&apos;ll know. If something&apos;s missing, tell us — we build from exam weeks, not pitch decks.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/signup" className="btn-solid text-lg">Create account</Link>
            <Link to="/resources" className="btn-glass text-lg">Read the guides</Link>
          </div>
        </div>
      </section>
    </>
  );
}
