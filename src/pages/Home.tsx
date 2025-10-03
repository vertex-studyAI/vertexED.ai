import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";
import { Zap } from "lucide-react";

/**
 * Home_updated.tsx
 *
 * Changes from previous iteration:
 * - Removed the large inner "blue box" card so the hero reads as full-bleed over the page background.
 * - Added your requested explanatory paragraph under the hero.
 * - Fixed contrast issues (white text on white backgrounds) by ensuring dark text appears on light cards
 *   and white text only appears on dark backgrounds.
 * - Kept GSAP scroll micro-animations but made them subtler to match the clean product look.
 *
 * Notes:
 * - Drop this into your project and wire the real `useAuth` hook. Tailwind is assumed.
 */

type Problem = { stat: string; text: string; source: { label: string; href: string } };

const PROBLEMS: Problem[] = [
  { stat: "39%", text: "of students report struggling to find trustworthy or relevant learning resources when researching topics or exam preparation.", source: { label: "ACT Research", href: "https://leadershipblog.act.org/2024/09/students-college-information-sources.html" } },
  { stat: "~66%", text: "report low engagement or that classroom content often feels irrelevant, affecting motivation to study effectively.", source: { label: "eSchoolNews", href: "https://www.eschoolnews.com/featured/2022/08/29/students-desperately-need-to-see-relevance-in-their-learning/" } },
  { stat: "~60%", text: "show high levels of academic procrastination, delaying study and reducing final performance.", source: { label: "PubMed Review", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11353834/" } },
  { stat: "81%", text: "changed study habits after the pandemic — many now use multiple digital tools and workflows.", source: { label: "McGraw Hill", href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html" } },
  { stat: "Study-backed", text: "Strategic study techniques (spacing, retrieval practice) reliably improve exam scores more than simply increasing hours.", source: { label: "Stanford Insights", href: "https://news.stanford.edu/stories/2017/05/studying-strategically-equals-improved-exam-scores" } },
  { stat: "Many", text: "use 3+ apps to study — fragmentation kills focus and adds friction to learning.", source: { label: "McGraw Hill", href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html" } },
];

const FEATURES = [
  { title: "Study Zone", desc: "All-in-one workspace: calculator, quick notes, activity log and instant flashcards." },
  { title: "AI Chatbot", desc: "A conversational guide that scaffolds problems and offers worked examples when you need them." },
  { title: "Study Planner", desc: "Adapts to deadlines and study habits, scheduling spaced repetitions for maximum retention." },
  { title: "Answer Reviewer", desc: "Curriculum-aware feedback that highlights what's missing and how to fix it." },
  { title: "Paper Maker", desc: "Generate syllabus-aligned mock exams and calibrate timing and mark distribution." },
  { title: "Notes → Flashcards → Quiz", desc: "Convert notes into active recall sessions seamlessly; close the study loop." },
];

export default function HomeUpdated(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // subtle hero entrance for headings and buttons
    gsap.fromTo(
      ".hero-anim",
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" }
    );

    // subtle fade-up for sections
    gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, delay: i * 0.05, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } }
      );
    });
  }, []);

  const [flipped, setFlipped] = useState<boolean[]>(PROBLEMS.map(() => false));
  const toggleFlip = (i: number) => setFlipped((p) => p.map((v, idx) => (idx === i ? !v : v)));

  return (
    <>
      <Helmet>
        <title>VertexED — Tools that lift learning</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/8 w-10 h-10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white/90" />
            </div>
            <div className="font-semibold">VertexED</div>
          </div>

          <nav className="flex items-center gap-6 text-sm text-white/80">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/features" className="hover:text-white">Features</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/signup" className="ml-4 px-3 py-2 rounded-full bg-white text-slate-900">Get started</Link>
          </nav>
        </header>

        {/* HERO - full width (no inner blue box) */}
        <section className="relative overflow-hidden py-28">
          <div className="max-w-5xl mx-auto text-center px-6">
            <h1 className="hero-anim text-5xl md:text-6xl font-normal leading-tight tracking-tight mb-6">
              <TypeAnimation
                sequence={["Tools that actually lift learning", 1600, "Plan smarter, revise deeper", 1600, "Practice with purpose", 1600]}
                speed={45}
                wrapper="span"
                repeat={Infinity}
              />
            </h1>

            <p className="hero-anim max-w-3xl mx-auto text-lg text-slate-200 mb-6">An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, and reviewer — built on evidence-based study techniques.</p>

            <div className="hero-anim flex gap-4 justify-center">
              <Link to="/signup" className="px-8 py-4 rounded-full bg-white text-slate-900 shadow-md">Get Started</Link>
              <Link to="/features" className="px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/6">Explore features</Link>
            </div>

            {/* User-requested paragraph added below hero */}
            <div className="mt-10 max-w-3xl mx-auto text-slate-200 text-base leading-relaxed">
              <p>
                Studying has become harder than ever. With too much information to know what to do with, resources which never seem to construct real progress, tools which just seem to make problems worse and the lack of a space which not only adapts to your learning, but constructs an environment where learning never stops is a problem we all face today.
              </p>

              <p className="mt-4">
                Marks aren't everything and we agree. But in today's world if learning requires people to score arbitrary marks on a piece of paper, we might as well take out 2 birds with 1 stone.
              </p>

              <p className="mt-4">
                We aim to not only improve your score on a paper with evidence based tools but also foster an environment for learning like no other.
              </p>
            </div>
          </div>
        </section>

        {/* Problems */}
        <section className="max-w-6xl mx-auto mt-12 px-6 fade-up">
          <h2 className="text-3xl font-semibold text-center mb-8 text-white">Why is this a problem?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="relative h-56 bg-white text-slate-900 rounded-2xl shadow-md p-6">
                <div className="flex flex-col h-full justify-center items-center text-center">
                  <div className="text-4xl font-bold mb-2">{p.stat}</div>
                  <div className="text-sm text-slate-600 italic">Click to expand</div>
                </div>

                {/* Back-text hidden until expansion - to keep UX simple we show on hover/tap */}
                <details className="absolute inset-0 p-6">
                  <summary className="sr-only">More</summary>
                  <div className="mt-2 bg-slate-50 p-3 rounded text-slate-800 text-sm">
                    {p.text}
                    <div className="mt-2 text-xs text-slate-500">Source: <a href={p.source.href} target="_blank" rel="noreferrer" className="underline">{p.source.label}</a></div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* Features summary - ensure contrast (dark text on white cards) */}
        <section className="max-w-6xl mx-auto mt-12 px-6 fade-up">
          <h3 className="text-3xl font-semibold text-center mb-8 text-white">What we build</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, idx) => (
              <article key={idx} className="rounded-2xl bg-white p-6 shadow hover:-translate-y-2 transition-transform">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-50 w-10 h-10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-slate-900">{f.title}</h4>
                    <p className="text-sm text-slate-700 mt-1">{f.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/features" className="px-10 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500">See full features</Link>
          </div>
        </section>

        <footer className="max-w-6xl mx-auto mt-20 text-center text-sm text-white/60 py-8">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
      </div>
    </>
  );
}
