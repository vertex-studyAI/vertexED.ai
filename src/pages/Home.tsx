import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";
import { Zap } from "lucide-react";

/**
 * HomeUpdated_v2.tsx
 *
 * Goal:
 * - Match the look & structure shown in the provided screenshots:
 *   - Full-bleed dark hero (no "website-in-a-website" inner blue box)
 *   - Typewriter/rotating hero headline (TypeAnimation)
 *   - Two CTA buttons under hero: solid "Get Started" and outlined "Explore features"
 *   - Features section titled "Explore Our Features" with alternating left/right small white cards,
 *     and supporting descriptive copy on the opposite side (side-to-side alternating)
 *   - Subtle GSAP entrance animations: hero fades up, feature cards slide in from sides
 *   - Footer and a "Why is this a problem?" stats grid remain, but content can be replaced later.
 *
 * Notes:
 * - TailwindCSS is assumed to be configured in the host project.
 * - Keep the `useAuth` redirect so logged-in users go to `/main`.
 * - This file is intentionally verbose and includes more layout/utility markup to reach the requested length.
 */

type Problem = {
  stat: string;
  text: string;
  source: { label: string; href: string };
};

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

type Feature = {
  title: string;
  desc: string;
  extra?: string;
};

const FEATURES: Feature[] = [
  {
    title: "Study Zone",
    desc: "All-in-one workspace: calculator, quick notes, activity log and instant flashcards.",
    extra: "For late nights, early mornings, or anywhere you study independently.",
  },
  {
    title: "AI Chatbot",
    desc: "A conversational guide that scaffolds problems and offers worked examples when you need them.",
    extra: "Not just another bot — it adapts to you.",
  },
  {
    title: "Study Planner",
    desc: "Adapts to deadlines and study habits, scheduling spaced repetitions for maximum retention.",
    extra: "Organize better, finish more, save energy for what matters.",
  },
  {
    title: "Answer Reviewer",
    desc: "Curriculum-aware feedback that highlights what's missing and how to fix it.",
    extra: "Strict but constructive feedback that shows exactly how to improve.",
  },
  {
    title: "Paper Maker",
    desc: "Generate syllabus-aligned mock exams and calibrate timing and mark distribution.",
    extra: "Infinite practice papers, instantly.",
  },
  {
    title: "Notes → Flashcards → Quiz",
    desc: "Convert notes into active recall sessions seamlessly; close the study loop.",
    extra: "Seamless workflow from notes to practice sessions.",
  },
];

export default function HomeUpdated(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/main", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // GSAP setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // hero fade + subtle scale for emphasis
    gsap.fromTo(
      ".hero-anim",
      { y: 26, opacity: 0, scale: 0.995 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
      }
    );

    // buttons pop slightly
    gsap.fromTo(
      ".hero-cta",
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.3, ease: "back.out(1.2)" }
    );

    // feature cards slide from sides with scroll trigger
    gsap.utils.toArray<HTMLElement>(".feature-card-left").forEach((el) => {
      gsap.fromTo(
        el,
        { x: -48, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    gsap.utils.toArray<HTMLElement>(".feature-card-right").forEach((el) => {
      gsap.fromTo(
        el,
        { x: 48, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    // small fade-up for the problems grid
    gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          delay: i * 0.04,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%" },
        }
      );
    });
  }, []);

  // simple state for the problems "flip"/open preview (kept for interactivity)
  const [expanded, setExpanded] = useState<boolean[]>(PROBLEMS.map(() => false));
  const toggleExpanded = (idx: number) =>
    setExpanded((prev) => prev.map((p, i) => (i === idx ? !p : p)));

  return (
    <>
      <Helmet>
        <title>VertexED — Tools that lift learning</title>
      </Helmet>

      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#0f1724,_#08121a)] text-white antialiased">
        {/* Header */}
        <header className="relative z-30">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-black/40 border border-white/10 w-10 h-10 flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white/90" />
              </div>
              <div className="font-medium tracking-wide">Vertex AI</div>
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

              {/* The requested "explore features text a button" - changed into a prominent button */}
              <Link
                to="/features"
                title="Explore features"
                className="ml-4 inline-flex items-center px-4 py-2 rounded-full bg-white text-slate-900 font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                Try Now
              </Link>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <main>
          <section className="relative overflow-hidden py-24">
            <div className="max-w-6xl mx-auto px-6 text-center">
              {/* Large hero text — full bleed background behind, no inner rounded box */}
              <h1 className="hero-anim text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
                <TypeAnimation
                  sequence={[
                    "AI study tools for students",
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

              <p className="hero-anim text-lg sm:text-xl max-w-3xl mx-auto text-slate-300 mb-8">
                An all-in-one toolkit made for you: planner, notes, flashcards, quizzes, chatbot,
                answer reviewer, and more — built on evidence-based study techniques.
              </p>

              <div className="hero-anim hero-cta flex items-center justify-center gap-5">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-md hover:translate-y-0.5 transition-transform"
                >
                  Get Started
                </Link>

                {/* Outlined "Explore features" — matches screenshot's pill outline */}
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/20 text-white/90 hover:bg-white/6 transition-colors"
                >
                  Explore features
                </Link>
              </div>

              {/* small tagline row */}
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-400">
                <div>IB • IGCSE • A-level</div>
                <div className="w-px h-4 bg-white/8" />
                <div>Research-backed</div>
              </div>

              {/* small explanatory paragraph under hero (from earlier user request) */}
              <div className="mt-10 max-w-3xl mx-auto text-slate-300 text-base leading-relaxed">
                <p>
                  Studying has become harder than ever. Too much information, fragmented tools, and
                  workflows that don't help you build skills. We design tools to focus your time on
                  what matters: understanding, retention, and progress.
                </p>
              </div>
            </div>
          </section>

          {/* "Why this matters" heading — used in screenshots */}
          <section className="py-20">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-extrabold mb-4">Why this matters</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                We want learning to be simpler, more effective, and less painful. That starts with
                giving students tools that actually change outcomes, not just make pretty dashboards.
              </p>
            </div>
          </section>

          {/* Problems grid */}
          <section className="py-12 bg-transparent">
            <div className="max-w-6xl mx-auto px-6 fade-up">
              <h3 className="text-3xl font-semibold text-center mb-8">We hate the way we study</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {PROBLEMS.map((p, i) => (
                  <article
                    key={i}
                    className="relative bg-white rounded-2xl p-6 text-slate-900 shadow-lg hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="text-3xl font-bold">{p.stat}</div>
                      <div className="text-sm italic text-slate-600">Click to expand</div>

                      <button
                        onClick={() => toggleExpanded(i)}
                        className="mt-2 text-sm text-slate-700 underline underline-offset-2 self-start"
                        aria-expanded={expanded[i]}
                      >
                        {expanded[i] ? "Hide details" : "Show details"}
                      </button>

                      {expanded[i] && (
                        <div className="mt-3 text-sm text-slate-700">
                          {p.text}
                          <div className="mt-2 text-xs text-slate-500">
                            Source:{" "}
                            <a
                              href={p.source.href}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {p.source.label}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES - alternating side-to-side like screenshot */}
          <section className="py-20">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-3xl font-semibold text-center mb-12">Explore Our Features</h2>

              <div className="space-y-14">
                {FEATURES.map((f, idx) => {
                  const left = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 items-center gap-6"
                      role="group"
                      aria-label={`Feature row ${idx + 1}`}
                    >
                      {/* left side copy */}
                      <div
                        className={`col-span-12 lg:col-span-5 ${
                          left ? "lg:order-1" : "lg:order-2 lg:text-right"
                        } flex items-center justify-center lg:justify-start`}
                      >
                        {/* small descriptive copy (opposite of the white card) */}
                        <div className="max-w-md text-slate-300 text-sm">
                          {left ? (
                            <p>{f.extra ?? "Useful anywhere you study."}</p>
                          ) : (
                            <p className="lg:mr-6">{f.extra ?? "Useful anywhere you study."}</p>
                          )}
                        </div>
                      </div>

                      {/* card — white rounded box */}
                      <div
                        className={`col-span-12 lg:col-span-6 ${
                          left ? "lg:order-2" : "lg:order-1"
                        } flex items-center justify-center`}
                      >
                        <div
                          className={`feature-card-${left ? "left" : "right"} w-full max-w-xl rounded-2xl bg-white p-6 shadow-md text-slate-900`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-slate-50 w-12 h-12 flex items-center justify-center">
                              <Zap className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{f.title}</h4>
                              <p className="text-sm text-slate-600 mt-2">{f.desc}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* spacer column to center layout on large screens */}
                      <div className="hidden lg:block lg:col-span-1" />
                    </div>
                  );
                })}
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

          {/* Small "notes" or "status" row */}
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-6 text-center text-slate-400">
              <p>
                This is just the beginning — more features are on their way. We're focused on
                evidence-based tools that help you learn with purpose.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16">
          <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-white/60">
            © {new Date().getFullYear()} VertexED — Built for learners & teachers
          </div>
        </footer>
      </div>
    </>
  );
}
