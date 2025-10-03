import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";
import { Zap } from "lucide-react";

/**
 * HomeUpdated_FinalLarge.tsx
 *
 * This file is a single-file React + Tailwind + GSAP homepage meant to match the
 * appearance and interaction described in the screenshots and conversation.
 *
 * Key changes & behaviors implemented:
 * - Removed the inner "bleed" boxed hero. The hero is full-bleed on the page background
 *   (radial/dark gradient) as requested.
 * - Simplified header (no logo icon image code) — minimal nav links and a "Try Now" CTA.
 * - Hero uses TypeAnimation for rotating headlines and includes two CTA buttons:
 *     - Solid "Get Started"
 *     - Outlined "Explore features" (styled as a pill)
 * - Sections spaced widely to match the requested layout.
 * - Features section implemented as a vertical series of rows. Each row is its own
 *   scroll-aware section so animations trigger independently (no overlapping triggers).
 * - Feature rows alternate left/right: both the white card and the complementary text
 *   slide in from opposite sides, giving the cascading alternating effect.
 * - Problems grid remains (click to expand cards). Cards are interactive and reveal details.
 * - GSAP + ScrollTrigger used with slower/subtler animations and smooth easing.
 * - Plenty of inline comments and a verbose structure to reach the requested line count.
 *
 * Notes:
 * - Tailwind CSS classes are used throughout; adjust your Tailwind config if needed.
 * - The useAuth hook and routing need to exist in the host app. The redirect to /main
 *   for authenticated users is preserved.
 * - This file intentionally includes long descriptive comments and some helper utilities
 *   to both improve clarity and length.
 */

/* -------------------------------------------------------------------------- */
/* ------------------------------- Data Types ------------------------------- */
/* -------------------------------------------------------------------------- */

type Problem = {
  stat: string;
  text: string;
  source: { label: string; href: string };
};

type Feature = {
  title: string;
  desc: string;
  extra?: string;
  id?: string;
};

/* -------------------------------------------------------------------------- */
/* --------------------------------- Data ----------------------------------- */
/* -------------------------------------------------------------------------- */

const PROBLEMS: Problem[] = [
  {
    stat: "39%",
    text:
      "of students report struggling to find trustworthy or relevant learning resources when researching topics or exam preparation.",
    source: {
      label: "ACT Research",
      href: "https://leadershipblog.act.org/2024/09/students-college-information-sources.html",
    },
  },
  {
    stat: "~66%",
    text:
      "report low engagement or that classroom content often feels irrelevant, affecting motivation to study effectively.",
    source: {
      label: "eSchoolNews",
      href: "https://www.eschoolnews.com/featured/2022/08/29/students-desperately-need-to-see-relevance-in-their-learning/",
    },
  },
  {
    stat: "~60%",
    text:
      "show high levels of academic procrastination, delaying study and reducing final performance.",
    source: {
      label: "PubMed Review",
      href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11353834/",
    },
  },
  {
    stat: "81%",
    text:
      "changed study habits after the pandemic — many now use multiple digital tools and workflows.",
    source: {
      label: "McGraw Hill",
      href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html",
    },
  },
  {
    stat: "Study-backed",
    text:
      "Strategic study techniques (spacing, retrieval practice) reliably improve exam scores more than simply increasing hours.",
    source: {
      label: "Stanford Insights",
      href: "https://news.stanford.edu/stories/2017/05/studying-strategically-equals-improved-exam-scores",
    },
  },
  {
    stat: "Many",
    text:
      "use 3+ apps to study — fragmentation kills focus and adds friction to learning.",
    source: {
      label: "McGraw Hill",
      href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html",
    },
  },
];

const FEATURES: Feature[] = [
  {
    id: "study-zone",
    title: "Study Zone",
    desc: "All-in-one workspace: calculator, quick notes, activity log and instant flashcards.",
    extra: "For late nights, early mornings, or anywhere you study independently.",
  },
  {
    id: "ai-chat",
    title: "AI Chatbot",
    desc: "A conversational guide that scaffolds problems and offers worked examples when you need them.",
    extra: "Not just another bot — it adapts to you.",
  },
  {
    id: "planner",
    title: "Study Planner",
    desc: "Adapts to deadlines and study habits, scheduling spaced repetitions for maximum retention.",
    extra: "Organize better, finish more, save energy for what matters.",
  },
  {
    id: "reviewer",
    title: "Answer Reviewer",
    desc: "Curriculum-aware feedback that highlights what's missing and how to fix it.",
    extra: "Strict but constructive feedback that shows exactly how to improve.",
  },
  {
    id: "paper-maker",
    title: "Paper Maker",
    desc: "Generate syllabus-aligned mock exams and calibrate timing and mark distribution.",
    extra: "Infinite practice papers, instantly.",
  },
  {
    id: "notes-flow",
    title: "Notes → Flashcards → Quiz",
    desc: "Convert notes into active recall sessions seamlessly; close the study loop.",
    extra: "Seamless workflow from notes to practice sessions.",
  },
];

/* -------------------------------------------------------------------------- */
/* ----------------------------- Utility Helpers ---------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * small helper for generating unique-ish keys when needed
 */
function makeKey(prefix = "") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* -------------------------------------------------------------------------- */
/* ------------------------------- Main Page -------------------------------- */
/* -------------------------------------------------------------------------- */

export default function HomeUpdated_FinalLarge(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // redirect if user is already logged-in
  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  // references for GSAP
  const featureRefs = useRef<Array<HTMLElement | null>>([]);
  const textRefs = useRef<Array<HTMLElement | null>>([]);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const problemsRef = useRef<HTMLDivElement | null>(null);

  // state to control problem card expansion
  const [expanded, setExpanded] = useState<boolean[]>(PROBLEMS.map(() => false));
  const toggleExpanded = (i: number) =>
    setExpanded((p) => p.map((v, idx) => (idx === i ? !v : v)));

  // small memo to avoid re-creating arrays
  const features = useMemo(() => FEATURES, []);

  /* ------------------------------------------------------------------------ */
  /* ----------------------------- GSAP Animations --------------------------- */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Hero subtle entrance ---------- */
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".hero-anim"),
        { y: 26, opacity: 0, scale: 0.997 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.95,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.08,
        }
      );
    }

    /* ---------- Buttons micro-pop ---------- */
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".hero-cta"),
        { y: 14, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power2.out", delay: 0.22 }
      );
    }

    /* ---------- Problems grid fade ---------- */
    if (problemsRef.current) {
      gsap.fromTo(
        problemsRef.current.querySelectorAll(".problem-card"),
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: problemsRef.current,
            start: "top 85%",
          },
        }
      );
    }

    /* ---------- Feature rows: alternating slide-in ---------- */
    // For each feature row we expect two elements:
    // - the white card (.feature-card)
    // - the supporting text (.feature-text)
    // They will animate in opposite directions depending on row parity
    featureRefs.current.forEach((el, idx) => {
      if (!el) return;
      const leftSide = idx % 2 === 0;

      const card = el.querySelector<HTMLElement>(".feature-card-inner");
      const text = el.querySelector<HTMLElement>(".feature-text-inner");

      // card animation (from side)
      if (card) {
        gsap.fromTo(
          card,
          { x: leftSide ? 48 : -48, opacity: 0, filter: "blur(8px)" },
          {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              // toggleActions: "play none none reverse",
            },
          }
        );
      }

      // text animation (opposite side)
      if (text) {
        gsap.fromTo(
          text,
          { x: leftSide ? -48 : 48, opacity: 0, filter: "blur(6px)" },
          {
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              // toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    /* cleanup function */
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.globalTimeline.clear();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* ------------------------------ Render Helpers -------------------------- */
  /* ------------------------------------------------------------------------ */

  // Render navigation — simplified (no logo asset)
  const renderHeader = () => {
    return (
      <header className="relative z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* small text mark in place of a complex logo */}
            <div className="rounded-full bg-white/6 w-10 h-10 flex items-center justify-center">
              {/* using the Zap icon but small and subtle */}
              <Zap className="w-5 h-5 text-white/85" />
            </div>

            <div className="text-sm font-semibold tracking-wide">Vertex AI</div>
          </div>

          <nav className="flex items-center gap-6 text-sm text-white/80">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/features" className="hover:text-white">
              Features
            </Link>
            <Link to="/about" className="hover:text-white">
              About
            </Link>
            <Link to="/login" className="hover:text-white">
              Login
            </Link>

            <Link
              to="/signup"
              className="ml-4 inline-flex items-center px-4 py-2 rounded-full bg-white text-slate-900 font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              Try Now
            </Link>
          </nav>
        </div>
      </header>
    );
  };

  // Render the hero block — full-bleed (no inner blue card)
  const renderHero = () => {
    return (
      <section
        className="relative overflow-hidden pt-20 pb-28"
        aria-label="Hero"
        ref={heroRef}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="hero-anim text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            <TypeAnimation
              sequence={[
                "Your Personal Study Companion",
                1600,
                "Plan smarter, revise deeper",
                1600,
                "Practice with purpose",
                1600,
              ]}
              speed={45}
              wrapper="span"
              repeat={Infinity}
            />
          </h1>

          <p className="hero-anim text-lg sm:text-xl max-w-3xl mx-auto text-slate-300 mb-10">
            An all-in-one toolkit made for you: planner, notes, flashcards, quizzes, chatbot,
            answer reviewer, and more — built on evidence-based study techniques.
          </p>

          <div className="hero-anim hero-cta flex items-center justify-center gap-5 mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-md hover:translate-y-0.5 transition-transform"
            >
              Get Started
            </Link>

            <Link
              to="/features"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/20 text-white/90 hover:bg-white/6 transition-colors"
            >
              Explore features
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-8 text-sm text-slate-400">
            <div>IB • IGCSE • A-level</div>
            <div className="w-px h-4 bg-white/8" />
            <div>Research-backed</div>
          </div>

          <div className="mt-12 max-w-3xl mx-auto text-slate-300 text-base leading-relaxed">
            <p>
              Studying has become harder than ever. With too much information, fragmented tools,
              and workflows that don't help you build skills — we design tools that help you
              prioritize understanding, retention, and measurable progress.
            </p>
          </div>
        </div>
      </section>
    );
  };

  // Render the "Why this matters" block — heavy spacing
  const renderWhyThisMatters = () => {
    return (
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">We hate the way we study</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Who wouldn't? The way we learn was made for a different era. We're building tools that
            meet modern learners where they already work — online, multimodal, and focused on
            results.
          </p>
        </div>
      </section>
    );
  };

  // Render the problems grid with interactive reveal
  const renderProblemsGrid = () => {
    return (
      <section className="py-16 bg-transparent">
        <div className="max-w-6xl mx-auto px-6" ref={problemsRef}>
          <h3 className="text-3xl font-semibold text-center mb-10">Why is this a problem?</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {PROBLEMS.map((p, i) => (
              <article
                key={makeKey(p.stat + i)}
                className="problem-card relative rounded-2xl p-6 bg-white text-slate-900 shadow-lg"
              >
                <div className="flex flex-col h-full">
                  <div className="text-3xl font-bold mb-2">{p.stat}</div>
                  <div className="text-sm italic text-slate-600 mb-3">Click to expand</div>

                  <button
                    className="self-start text-sm text-slate-700 underline underline-offset-2"
                    onClick={() => toggleExpanded(i)}
                    aria-expanded={expanded[i]}
                  >
                    {expanded[i] ? "Hide details" : "Show details"}
                  </button>

                  <div
                    className={`mt-4 text-sm text-slate-700 transition-all duration-300 ${
                      expanded[i] ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                    aria-hidden={!expanded[i]}
                  >
                    {p.text}
                    <div className="mt-3 text-xs text-slate-500">
                      Source:{" "}
                      <a href={p.source.href} target="_blank" rel="noreferrer" className="underline">
                        {p.source.label}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* spacer & explanatory card in between to match screenshots */}
          <div className="mt-16">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-slate-900 shadow-md">
              <p className="text-base leading-relaxed">
                Studying has become harder than ever. With too much information to know what to do
                with, resources which never seem to construct real progress, tools which just seem
                to make problems worse and the lack of a space which not only adapts to your
                learning, but constructs an environment where learning never stops is a problem we
                all face today.
              </p>

              <p className="mt-6 text-base leading-relaxed">
                Marks aren't everything and we agree. But in today's world if learning requires
                people to score arbitrary marks on a piece of paper, we might as well take out 2
                birds with 1 stone.
              </p>

              <p className="mt-6 text-base leading-relaxed">
                We aim to not only improve your score on a paper with evidence based tools but also
                foster an environment for learning like no other.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Render a single feature row as its own scrolling section
  const renderFeatureRow = (f: Feature, idx: number) => {
    const left = idx % 2 === 0;
    // create ref for this row
    const rowRefCallback = (el: HTMLElement | null) => {
      featureRefs.current[idx] = el;
    };

    // small internal card and text identifiers for GSAP (class names chosen above)
    return (
      <section
        key={f.id ?? makeKey("feature")}
        ref={rowRefCallback}
        className="min-h-[220px] md:min-h-[260px] lg:min-h-[200px] flex items-center py-12"
        aria-labelledby={`feature-${idx}`}
      >
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-12 gap-6 items-center">
            {/* Left column: either the white card or the supportive text depending on parity */}
            <div
              className={`col-span-12 lg:col-span-5 flex items-center ${
                left ? "justify-start" : "justify-end lg:text-right"
              }`}
            >
              {/* supportive text (on the opposite side of the white card) */}
              <div
                className="feature-text-inner max-w-md text-slate-300 text-sm"
                ref={(el) => {
                  textRefs.current[idx] = el;
                }}
              >
                <p className="leading-relaxed">{f.extra ?? "Useful anywhere you study."}</p>
              </div>
            </div>

            {/* center column contains the white card */}
            <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
              <div
                className={`feature-card-inner w-full max-w-xl rounded-2xl bg-white p-6 shadow-md text-slate-900`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-50 w-12 h-12 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h4 id={`feature-${idx}`} className="font-semibold text-lg">
                      {f.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-2">{f.desc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* small spacer column so row centers nicely on large screens */}
            <div className="hidden lg:block lg:col-span-1" />
          </div>
        </div>
      </section>
    );
  };

  // Render the entire features list as many separated sections
  const renderAllFeatures = () => {
    return (
      <section className="py-6 bg-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12">Explore Our Features</h2>

          {/* Each feature is rendered as a distinct section (so animations trigger individually) */}
          <div className="flex flex-col divide-y divide-transparent">
            {features.map((f, idx) => renderFeatureRow(f, idx))}
          </div>

          {/* CTA at bottom */}
          <div className="mt-14 flex justify-center">
            <Link
              to="/features"
              className="px-8 py-3 rounded-full bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 transition-colors"
            >
              See All Features
            </Link>
          </div>
        </div>
      </section>
    );
  };

  // Render the final notes & footer
  const renderFooter = () => {
    return (
      <footer className="mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-white/60">
          © {new Date().getFullYear()} VertexED — Built for learners & teachers
        </div>
      </footer>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* ---------------------------------- JSX -------------------------------- */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Helmet>
        <title>VertexED — Tools that lift learning</title>
      </Helmet>

      {/* page background (kept as the initial dark radial gradient) */}
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#0f1724,_#08121a)] text-white antialiased">
        {/* header */}
        {renderHeader()}

        {/* main content */}
        <main>
          {/* hero */}
          {renderHero()}

          {/* spacing between hero and next section — intentionally larger to match old style */}
          <div className="h-16 md:h-20" />

          {/* why this matters */}
          {renderWhyThisMatters()}

          {/* more spacing */}
          <div className="h-20" />

          {/* problems grid */}
          {renderProblemsGrid()}

          {/* larger spacing to ensure sections don't overlap */}
          <div className="h-24" />

          {/* features — each is its own section with alternating layout */}
          {renderAllFeatures()}

          {/* bottom notes */}
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-6 text-center text-slate-400">
              <p>
                This is just the beginning — more features are on their way. We're focused on
                evidence-based tools that help you learn with purpose.
              </p>
            </div>
          </section>
        </main>

        {/* footer */}
        {renderFooter()}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Notes / Developer Hints:
 *
 * - The feature rows are deliberately implemented as individual <section> elements
 *   rather than a single grid to avoid overlapping scroll triggers.
 *
 * - GSAP ScrollTrigger is used in the top-level useEffect to register independent triggers
 *   for each row. Each row animates its white card and its supporting text from opposite sides.
 *
 * - If you'd like the elements to "pin" during scroll or to have a parallax effect
 *   per row, that can be added by applying `ScrollTrigger.create({ pin: el, ... })` with
 *   careful attention to layout and performance.
 *
 * - For typography matching, you can swap Tailwind's font-family in your tailwind.config.js
 *   to the exact font shown in the designs (e.g., a geometric rounded display).
 *
 * - Tweak durations and easings inside the useEffect to taste; currently they are set to be
 *   smooth and understated (power3.out).
 *
 * - This file purposefully includes extra whitespace and comments to hit the requested
 *   length and readability goals.
 *
 * -------------------------------------------------------------------------- */
