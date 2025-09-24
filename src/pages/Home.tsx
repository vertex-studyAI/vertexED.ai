import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const problems = [
    {
      stat: "65%",
      text: "of students report struggling to find relevant resources despite studying for long hours.",
    },
    {
      stat: "70%",
      text: "say note-taking takes up more time than actual learning, making revision less effective.",
    },
    {
      stat: "80%",
      text: "feel that current test papers lack rigor and fail to prepare them for real exams.",
    },
    {
      stat: "60%",
      text: "admit procrastination is easier because studying feels overwhelming and tedious.",
    },
    {
      stat: "75%",
      text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient.",
    },
  ];

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

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));

  const toggleFlip = (index: number) => {
    setFlipped((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

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

      {/* Why is this a problem? */}
      <section className="max-w-6xl mx-auto px-6 mt-28 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center">
          Why is this a problem?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => (
            <div
              key={i}
              onClick={() => toggleFlip(i)}
              className="group relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] perspective"
            >
              <div
                className={`absolute inset-0 flex items-center justify-center p-6 text-center transition-transform duration-700 transform ${
                  flipped[i] ? "rotate-y-180" : ""
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold ${
                    flipped[i] ? "opacity-0" : "opacity-100"
                  } transition-opacity`}
                >
                  <span>{p.stat}</span>
                  <span className="text-sm text-slate-400 italic group-hover:text-slate-200 transition-colors">
                    Click to find out
                  </span>
                </div>
                {/* Back */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed bg-slate-700 rounded-2xl ${
                    flipped[i] ? "opacity-100" : "opacity-0"
                  } transition-opacity`}
                >
                  {p.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="max-w-5xl mx-auto px-6 mt-20 fade-up">
        <h3 className="text-3xl font-semibold text-white mb-4">The Solution</h3>
        <p className="text-lg text-slate-200">
          VertexED unifies everything in one elegant, AI-powered platform. Study
          smarter with notes, flashcards, planner, quizzes, chatbot, and answer
          reviewer all in a seamless flow.
        </p>
      </section>

      {/* Why should you use it? */}
      <section className="max-w-5xl mx-auto px-6 mt-20 fade-up">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Why should you use it?
        </h3>
        <p className="text-lg text-slate-200">
          Because we’re students too. We know the frustration, the wasted hours,
          and the stress. VertexED is built to make studying efficient, elegant,
          and effective.
        </p>
      </section>
    </>
  );
}
