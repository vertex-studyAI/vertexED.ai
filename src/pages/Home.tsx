import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";
import { Zap, CheckCircle, Activity } from "lucide-react";

/**
 * Home.tsx
 *
 * Reworked landing page to match the visual style from Video 1 (hero-first, strong type animation)
 * while keeping content and orientation from your original file. Includes polished GSAP
 * scroll-triggered micro-animations and cleaner, more predictable card flips.
 *
 * Notes:
 * - Keep Tailwind available in your project.
 * - Reattach your actual useAuth hook; here we import it exactly as you provided.
 * - This file focuses on presentation and ships with accessible markup and clear animation hooks.
 */

type Problem = { stat: string; text: string; source: { label: string; href: string } };

const PROBLEMS: Problem[] = [
  {
    stat: "39%",
    text: "of students report struggling to find trustworthy or relevant learning resources when researching topics or exam preparation.",
    source: { label: "ACT Research", href: "https://leadershipblog.act.org/2024/09/students-college-information-sources.html" },
  },
  {
    stat: "~66%",
    text: "report low engagement or that classroom content often feels irrelevant, affecting motivation to study effectively.",
    source: { label: "eSchoolNews", href: "https://www.eschoolnews.com/featured/2022/08/29/students-desperately-need-to-see-relevance-in-their-learning/" },
  },
  {
    stat: "~60%",
    text: "show high levels of academic procrastination, delaying study and reducing final performance.",
    source: { label: "Literature review (PubMed)", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11353834/" },
  },
  {
    stat: "81%",
    text: "changed study habits after the pandemic — many now use multiple digital tools and workflows.",
    source: { label: "McGraw Hill Trends", href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html" },
  },
  {
    stat: "Study-backed",
    text: "Strategic study techniques (spacing, retrieval practice) reliably improve exam scores more than simply increasing hours.",
    source: { label: "Stanford Insights", href: "https://news.stanford.edu/stories/2017/05/studying-strategically-equals-improved-exam-scores" },
  },
  {
    stat: "Many",
    text: "use 3+ apps to study — fragmentation kills focus and adds friction to learning.",
    source: { label: "McGraw Hill Trends (summary)", href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html" },
  },
];

const FEATURES = [
  { title: "Study Zone", desc: "All-in-one workspace: calculator, quick notes, activity log and instant flashcards." },
  { title: "AI Chatbot", desc: "A conversational guide that scaffolds problems and offers worked examples when you need them." },
  { title: "Study Planner", desc: "Adapts to deadlines and study habits, scheduling spaced repetitions for maximum retention." },
  { title: "Answer Reviewer", desc: "Curriculum-aware feedback that highlights what's missing and how to fix it." },
  { title: "Paper Maker", desc: "Generate syllabus-aligned mock exams and calibrate timing and mark distribution." },
  { title: "Notes + Flashcards + Quiz", desc: "Convert notes into active recall sessions seamlessly." },
];

export default function Home(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance (gentle stagger)
    gsap.fromTo(
      ".hero-animate",
      { y: 36, opacity: 0, scale: 0.996 },
      { y: 0, opacity: 1, scale: 1, duration: 1.05, stagger: 0.14, ease: "power3.out" }
    );

    // Feature blocks: slide from sides with slight delay to create rhythm
    gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, i) => {
      gsap.fromTo(
        row,
        { x: i % 2 === 0 ? -64 : 64, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.0, delay: i * 0.06, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 92%" } }
      );
    });

    // Fade-up for sections
    gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el, idx) => {
      gsap.fromTo(
        el,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.05, delay: idx * 0.04, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }
      );
    });

    // small parallax on hero background if present
    const bg = document.querySelector(".hero-bg") as HTMLElement | null;
    if (bg) {
      gsap.to(bg, { y: -30, ease: "none", scrollTrigger: { scrub: 0.5 } });
    }
  }, []);

  const [flipped, setFlipped] = useState<boolean[]>(PROBLEMS.map(() => false));
  const toggleFlip = (i: number) => setFlipped((p) => p.map((v, idx) => (idx === i ? !v : v)));

  return (
    <>
      <Helmet>
        <title>VertexED — Tools that lift learning</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
        <header className="max-w-6xl mx-auto flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 w-10 h-10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white/90" />
            </div>
            <div className="text-white font-semibold">VertexED</div>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/login" className="text-white/80 hover:text-white">Login</Link>
            <Link to="/about" className="text-white/80 hover:text-white">About</Link>
            <Link to="/signup" className="px-3 py-2 rounded-full bg-white text-slate-900">Get started</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl shadow-xl max-w-6xl mx-auto py-20 px-8 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
          <div className="absolute inset-0 opacity-10 hero-bg" aria-hidden></div>

          <div className="max-w-3xl mx-auto">
            <h1 className="hero-animate text-5xl md:text-6xl font-normal text-white leading-tight mb-6 tracking-tight">
              <TypeAnimation
                sequence={["Tools that actually lift learning", 1800, "Plan smarter, revise deeper", 1800, "Practice with purpose", 1800]}
                speed={45}
                wrapper="span"
                repeat={Infinity}
              />
            </h1>

            <p className="hero-animate text-lg text-slate-200 mb-8">
              An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, and reviewer — built on evidence-based study techniques.
            </p>

            <div className="hero-animate flex gap-4 justify-center">
              <Link to="/signup" className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-300 shadow-lg">Get Started</Link>
              <Link to="/features" className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/6 transition-transform duration-300">Explore features</Link>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-xs text-white/70">
              <div>IB • IGCSE • A-level</div>
              <div className="px-2 py-1 rounded bg-white/6">Research-backed</div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="max-w-6xl mx-auto mt-16 fade-up">
          <h2 className="text-3xl font-semibold text-white text-center mb-8">Why this matters</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {PROBLEMS.map((p, i) => (
              <button
                type="button"
                onClick={() => toggleFlip(i)}
                key={i}
                className="group relative h-56 bg-white text-slate-900 rounded-2xl shadow-xl cursor-pointer transform transition-transform duration-400 hover:scale-105 perspective"
                aria-expanded={flipped[i]}
                aria-controls={`problem-${i}-back`}
              >
                <div className="absolute inset-0 p-6 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                  {/* Front */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold transition-opacity duration-300 ${flipped[i] ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <span>{p.stat}</span>
                    <span className="text-sm text-slate-500 italic group-hover:text-slate-700">Tap to reveal</span>
                  </div>

                  {/* Back */}
                  <div id={`problem-${i}-back`} className={`absolute inset-0 p-4 bg-slate-50 rounded-2xl text-slate-800 transition-opacity duration-300 ${flipped[i] ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="text-base leading-relaxed">{p.text}</div>
                    <div className="mt-3 text-xs text-slate-500">Source: <a href={p.source.href} target="_blank" rel="noreferrer" className="underline">{p.source.label}</a></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Features preview */}
        <section className="max-w-6xl mx-auto mt-16 fade-up px-4">
          <h3 className="text-3xl font-semibold text-white text-center mb-8">What we build</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, idx) => (
              <article key={idx} className="rounded-2xl bg-white p-6 shadow-lg transform transition-all duration-350 hover:-translate-y-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 w-10 h-10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{f.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/features" className="px-10 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300">See full features</Link>
          </div>
        </section>

        <footer className="max-w-6xl mx-auto mt-20 text-center text-sm text-white/60 py-8">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
      </div>
    </>
  );
}
