import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";

/**
 * Home.tsx (improved)
 *
 * - Keeps your original layout and GSAP animations.
 * - Hero headline is NOT bold (font-normal) per request.
 * - Focuses on problem-first narrative, includes sources for key stats.
 * - Explicit 3 major goals and a short section explaining how VertexED stands out.
 *
 * At the bottom of this file the original Home component (unchanged) is preserved
 * inside a comment block so you can reference/restore it if you want.
 */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // General fade-up
      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.3,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });

      // Feature rows
      gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -120 : 120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 90%" },
          }
        );
      });

      // Hero stagger animation
      gsap.fromTo(
        ".hero-animate",
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Problems cards (with sources)
  const problems = [
    {
      stat: "39%",
      text: "of students report struggling to find trustworthy or relevant learning resources when researching topics or exam preparation.",
      source: { label: "ACT Research", href: "https://leadershipblog.act.org/2024/09/students-college-information-sources.html" },
    },
    {
      stat: "~66%",
      text: "report low engagement or that classroom content often feels irrelevant, affecting motivation to study effectively.",
      source: { label: "eSchoolNews reporting", href: "https://www.eschoolnews.com/featured/2022/08/29/students-desperately-need-to-see-relevance-in-their-learning/" },
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
      source: { label: "Stanford // strategic study insights", href: "https://news.stanford.edu/stories/2017/05/studying-strategically-equals-improved-exam-scores" },
    },
    {
      stat: "Many",
      text: "use 3+ apps to study — fragmentation kills focus and adds friction to learning.",
      source: { label: "McGraw Hill Trends (summary)", href: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html" },
    },
  ];

  // Short features preview for home
  const features = [
    { title: "Study Zone", desc: "All-in-one tool for calculators, logs, and more. Everything in one place." },
    { title: "AI Chatbot", desc: "Your personal academic companion — adaptive and conversational." },
    { title: "Study Planner", desc: "Adapts to your schedule, deadlines, and pace. Study smarter, not harder." },
    { title: "Answer Reviewer", desc: "Strict but constructive feedback that shows exactly how to improve." },
    { title: "IB/IGCSE Paper Maker", desc: "Instant syllabus-aligned test papers for rigorous practice." },
    { title: "Notes with Flashcards and Quiz", desc: "Seamless workflow from notes to practice sessions." },
  ];

  const featureSideText = [
    "For late nights, early mornings, at the library or anywhere you learn independently.",
    "Not just another bot. It learns from you — your strengths, passions, and limitations.",
    "Organize better, finish more, and save energy for what matters: life.",
    "Like a teacher built in, spotting weaknesses and giving you the tools to improve.",
    "Infinite practice papers, instantly. Non-stop prep with real material.",
    "This is just the beginning — more features are on their way.",
  ];

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));
  const toggleFlip = (i: number) =>
    setFlipped((prev) => {
      const copy = [...prev];
      copy[i] = !copy[i];
      return copy;
    });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <Helmet>
        <title>AI Study Tools for Students | VertexED</title>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-28 bg-gradient-to-b from-slate-900 to-slate-800 text-center rounded-3xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-animate text-5xl md:text-7xl font-normal text-white leading-tight mb-6 tracking-tight">
            <TypeAnimation
              sequence={[
                "Tools that actually lift learning",
                1800,
                "Plan smarter, revise deeper",
                1800,
                "Practice with purpose",
                1800,
              ]}
              speed={45}
              wrapper="span"
              repeat={Infinity}
            />
          </h1>
          <p className="hero-animate text-lg text-slate-200 mb-10">
            An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer, and more.
          </p>

          {/* Intentionally minimal hero CTAs — the main CTA appears later */}
          <div className="hero-animate flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-all duration-500 ease-in-out shadow-lg hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-full bg-slate-800 border border-white/20 text-white hover:bg-slate-700 transition-all duration-500 ease-in-out shadow-md hover:scale-105"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Storytelling */}
      <section className="mt-28 text-center px-6 fade-up">
        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">We hate the way we study</h2>
        <p className="text-lg text-slate-200 mb-12">Who wouldn’t?</p>
      </section>

      {/* Why is this a problem? */}
      <section className="max-w-6xl mx-auto px-6 mt-28 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center">Why is this a problem?</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => (
            <div
              key={i}
              onClick={() => toggleFlip(i)}
              className="group relative h-56 bg-white text-slate-900 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] perspective"
            >
              <div
                className={`absolute inset-0 flex items-center justify-center p-6 text-center transition-transform duration-700 transform ${flipped[i] ? "rotate-y-180" : ""}`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold ${flipped[i] ? "opacity-0" : "opacity-100"} transition-opacity`}>
                  <span>{p.stat}</span>
                  <span className="text-sm text-slate-500 italic group-hover:text-slate-700 transition-colors">Click to find out</span>
                </div>

                {/* Back */}
                <div className={`absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed bg-slate-50 rounded-2xl text-slate-800 ${flipped[i] ? "opacity-100" : "opacity-0"} transition-opacity`}>
                  <div>
                    <div>{p.text}</div>
                    <div className="text-xs mt-3 text-slate-500">
                      Source:{" "}
                      <a href={p.source.href} target="_blank" rel="noreferrer" className="underline">
                        {p.source.label}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center fade-up">
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-10">
          <p className="text-lg md:text-xl leading-relaxed">
            Studying has become harder than ever. With too much information and scattered tools, progress feels elusive. We’re building a space that adapts to your learning style and keeps progress continuous.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            Marks aren't everything, but they matter. If exams demand performance, our platform makes sure learning and scoring go hand-in-hand.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            We aim to not only improve your score with evidence-based tools but also create a space where true learning never stops.
          </p>
        </div>
      </section>

      {/* Three major goals */}
      <section className="mt-20 px-6 fade-up">
        <div className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl shadow-2xl p-10">
          <h3 className="text-2xl font-semibold">Our mission — three clear goals</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border bg-slate-50 text-center">
              <div className="text-xl font-semibold mb-2">Improve learning beyond the classroom</div>
              <div className="text-sm text-slate-600">We help students build learning routines that connect classroom topics to broader understanding and projects.</div>
            </div>
            <div className="p-4 rounded-2xl border bg-slate-50 text-center">
              <div className="text-xl font-semibold mb-2">Improve performance on papers</div>
              <div className="text-sm text-slate-600">Practice with real-style mocks, targeted feedback, and timing drills so exam performance becomes predictable.</div>
            </div>
            <div className="p-4 rounded-2xl border bg-slate-50 text-center">
              <div className="text-xl font-semibold mb-2">Improve depth of understanding</div>
              <div className="text-sm text-slate-600">From notes to flashcards to application tasks — we aim for conceptual depth across subjects.</div>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-700">
            Beyond these goals we want students to develop a genuine passion for learning and applying knowledge — skills that last long after exams.
          </div>
        </div>
      </section>

      {/* How we stand out */}
      <section className="mt-20 px-6 fade-up">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-semibold">How we tackle the bigger picture</h3>
            <p className="mt-3 text-slate-300">
              We aren’t another single-function tool. VertexED brings together three pillars that are rarely combined: personalization, curriculum-grounded feedback, and compact workflows that reduce friction. The result: faster learning loops and clearer progress.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white text-slate-800 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-100">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="font-medium">Personalized</div>
                </div>
                <div className="text-xs mt-2 text-slate-600">Learner models adapt to your pace, strengths, and exam targets.</div>
              </div>

              <div className="p-4 rounded-2xl bg-white text-slate-800 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-100">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="font-medium">Curriculum-aware</div>
                </div>
                <div className="text-xs mt-2 text-slate-600">Marking rubrics and past-paper distributions are baked into feedback and paper creation.</div>
              </div>

              <div className="p-4 rounded-2xl bg-white text-slate-800 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-slate-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="font-medium">To-the-point</div>
                </div>
                <div className="text-xs mt-2 text-slate-600">Minimal friction: convert notes → flashcards → quiz in a click; get targeted review that tells you exactly what to fix.</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-300">
              <strong>Holistic approach:</strong> we pair scheduling, active recall, and high-quality feedback so students don’t just memorize — they understand and apply.
            </div>
          </div>

          <aside className="hidden md:block sticky top-24">
            <div className="bg-white/90 p-6 rounded-2xl shadow-lg text-slate-900">
              <div className="text-sm font-semibold">Impact</div>
              <div className="mt-2 text-xs text-slate-600">Strategic study beats raw hours: small, science-backed changes can raise average grades and reduce wasted time.</div>
            </div>
          </aside>
        </div>
      </section>

      {/* Features preview (minimal) - single CTA kept near the bottom */}
      <section className="mt-20 px-6 fade-up">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-white text-center mb-8">Explore Our Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="font-semibold text-lg">{f.title}</div>
                <div className="text-sm text-slate-600 mt-2">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            {/* The only CTA near the bottom — "Explore Features" kept per request */}
            <Link to="/features" className="px-10 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300">
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-20 px-6 text-center fade-up">
        <div className="max-w-4xl mx-auto bg-white/95 rounded-3xl p-10 shadow-xl">
          <h3 className="text-2xl font-semibold">A more focused, evidence-based way to learn</h3>
          <p className="mt-3 text-slate-700">VertexED combines scheduling, retrieval practice, and exam-style feedback in one workspace — so students spend less time deciding what to do, and more time doing the right thing.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/signup" className="px-6 py-3 rounded bg-slate-900 text-white">Get started — free</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-6 py-3 rounded border">Back to top</button>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-400 mt-10">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
    </>
  );
}

/*
---------------------------
Original Home.tsx (kept as a reference)
---------------------------
The full original Home component you provided has been preserved below in case you want to restore parts of it.

(If you want this original component re-enabled instead of the improved one above, say "restore original".)

-- START ORIGINAL --
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // General fade-up
      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.3,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
      });

      // Feature rows
      gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -120 : 120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 90%" },
          }
        );
      });

      // Hero stagger animation
      gsap.fromTo(
        ".hero-animate",
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }
  }, []);

  // Problems cards
  const problems = [
    { stat: "65%", text: "of students report struggling to find relevant resources despite studying for long hours." },
    { stat: "70%", text: "say note-taking takes up more time than actual learning, making revision less effective." },
    { stat: "80%", text: "feel that current test papers lack rigor and fail to prepare them for real exams." },
    { stat: "60%", text: "admit procrastination is easier because studying feels overwhelming and tedious." },
    { stat: "75%", text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient." },
    { stat: "50%", text: "wish there was a single platform that combines planning, practice, and AI-powered help in one place." },
  ];

  // Features preview (shortened for home)
  const features = [
    { title: "Study Zone", desc: "All-in-one tool for calculators, logs, and more. Everything in one place." },
    { title: "AI Chatbot", desc: "Your personal academic companion — adaptive and conversational." },
    { title: "Study Planner", desc: "Adapts to your schedule, deadlines, and pace. Study smarter, not harder." },
    { title: "Answer Reviewer", desc: "Strict but constructive feedback that shows exactly how to improve." },
    { title: "IB/IGCSE Paper Maker", desc: "Instant syllabus-aligned test papers for rigorous practice." },
    { title: "Notes },
