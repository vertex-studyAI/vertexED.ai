import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";
import { Zap, CheckCircle, Activity } from "lucide-react";

/**
 * Home.tsx (fixed + improved)
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

  // Features preview
  const features = [
    { title: "Study Zone", desc: "All-in-one tool for calculators, logs, and more. Everything in one place." },
    { title: "AI Chatbot", desc: "Your personal academic companion — adaptive and conversational." },
    { title: "Study Planner", desc: "Adapts to your schedule, deadlines, and pace. Study smarter, not harder." },
    { title: "Answer Reviewer", desc: "Strict but constructive feedback that shows exactly how to improve." },
    { title: "IB/IGCSE Paper Maker", desc: "Instant syllabus-aligned test papers for rigorous practice." },
    { title: "Notes + Flashcards + Quiz", desc: "Seamless workflow from notes to practice sessions." },
  ];

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));
  const toggleFlip = (i: number) =>
    setFlipped((prev) => {
      const copy = [...prev];
      copy[i] = !copy[i];
      return copy;
    });

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

      {/* Problems Section */}
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

      {/* Features preview */}
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
            <Link to="/features" className="px-10 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300">
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-400 mt-10">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
    </>
  );
}
