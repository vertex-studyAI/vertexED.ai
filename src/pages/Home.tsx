import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      const elements = gsap.utils.toArray<HTMLElement>(".fade-up");
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
          }
        );
      });
    }
  }, []);

  const features = [
    {
      title: "Study Zone",
      desc: "All-in-one tool for your calculators, activity logs, and more. A space designed for clarity where everything you need to study lives in one place.",
    },
    {
      title: "AI Chatbot",
      desc: "Your personal academic companion. Ask questions, get explanations, and engage in real discussions to deepen your understanding of any subject.",
    },
    {
      title: "Study Planner",
      desc: "Never miss a beat. Our planner adapts to your schedule, deadlines, and pace — making your study plan smarter, not harder.",
    },
    {
      title: "Answer Reviewer",
      desc: "Not just a reviewer, but a mentor. Receive strict yet constructive feedback on your answers, showing you exactly how to improve.",
    },
    {
      title: "IB/IGCSE Paper Maker",
      desc: "Create syllabus-aligned test papers instantly. No fluff, no generic questions — just rigorous practice that actually helps you prepare.",
    },
    {
      title: "Notes + Flashcards + Quiz",
      desc: "From notes to flashcards to quizzes, all in one seamless workflow. Perfect for late-night revision or quick practice sessions.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Study Tools for Students | VertexED</title>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-center rounded-3xl shadow-xl">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-semibold text-white leading-tight mb-6 fade-up">
            AI study tools for students
          </h1>
          <p className="text-lg text-slate-200 mb-10 fade-up">
            An all-in-one toolkit made for you: planner, notes, flashcards,
            quizzes, chatbot, answer reviewer, and more.
          </p>
          <div className="flex gap-4 justify-center fade-up">
            <Link
              to="/main"
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
        <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
          We hate the way we study
        </h2>
        <p className="text-lg text-slate-200 mb-12">Who wouldn’t?</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 fade-up">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Why is this a problem?
        </h3>
        <ul className="list-disc list-inside text-slate-200 space-y-2">
          <li>Lack of relevant resources</li>
          <li>Too much effort into note-taking</li>
          <li>Lack of rigor-appropriate test papers</li>
          <li>Extremely tedious, easy to procrastinate</li>
          <li>Multiple apps, scattered workflow</li>
        </ul>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20 fade-up">
        <h3 className="text-3xl font-semibold text-white mb-4">
          The Solution
        </h3>
        <p className="text-lg text-slate-200">
          VertexED unifies everything in one elegant, AI-powered platform.
          Study smarter with notes, flashcards, planner, quizzes, chatbot,
          and answer reviewer all in a seamless flow.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-20 fade-up">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Why should you use it?
        </h3>
        <p className="text-lg text-slate-200">
          Because we’re students too. We know the frustration, the wasted
          hours, and the stress. VertexED is built to make studying
          efficient, elegant, and effective.
        </p>
      </section>

      {/* Features cinematic flow */}
      <section className="mt-28 space-y-32">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-6 fade-up ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Card */}
            <div className="flex-1 rounded-3xl bg-white shadow-xl p-10 text-neutral-900 transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4 hover:text-neutral-700 transition-colors duration-500 ease-in-out">
                {f.title}
              </h3>
              <p className="text-neutral-700 text-lg leading-relaxed">
                {f.desc}
              </p>
            </div>

            {/* Cinematic description */}
            <div className="flex-1">
              <p className="text-xl md:text-2xl text-white leading-relaxed">
                {f.desc} This is where VertexED transforms a tedious process
                into something elegant — like a movie scene unfolding as you
                study.
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Special */}
      <section className="mt-32 text-center px-6 fade-up">
        <h3 className="text-4xl md:text-5xl font-semibold text-white mb-6">
          What Makes Us Special
        </h3>
        <p className="max-w-3xl mx-auto text-lg text-slate-200">
          Built by students who live the same struggles. Every feature is
          crafted not just to look elegant but to solve real problems in the
          smartest way possible. Sleek, powerful, and truly student-first.
        </p>
      </section>

      {/* End CTA */}
      <section className="mt-32 mb-24 text-center fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-8">
          Ready to get started?
        </h3>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="px-10 py-5 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-all duration-500 ease-in-out shadow-xl hover:scale-105"
        >
          Back to Top
        </button>
      </section>
    </>
  );
}
