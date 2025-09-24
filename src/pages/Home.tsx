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

      const featureRows = gsap.utils.toArray<HTMLElement>(".feature-row");
      featureRows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -80 : 80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
            },
          }
        );
      });
    }
  }, []);

  const problems = [
    { stat: "65%", text: "of students report struggling to find relevant resources despite studying for long hours." },
    { stat: "70%", text: "say note-taking takes up more time than actual learning, making revision less effective." },
    { stat: "80%", text: "feel that current test papers lack rigor and fail to prepare them for real exams." },
    { stat: "60%", text: "admit procrastination is easier because studying feels overwhelming and tedious." },
    { stat: "75%", text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient." },
    { stat: "50%", text: "wish there was a single platform that combines planning, practice, and AI-powered help in one place." },
  ];

  const features = [
    { title: "Study Zone", desc: "All-in-one tool for your calculators, activity logs, and more. A space designed for clarity where everything you need to study lives in one place." },
    { title: "AI Chatbot", desc: "Your personal academic companion. Ask questions, get explanations, and engage in real discussions to deepen your understanding of any subject." },
    { title: "Study Planner", desc: "Never miss a beat. Our planner adapts to your schedule, deadlines, and pace — making your study plan smarter, not harder." },
    { title: "Answer Reviewer", desc: "Not just a reviewer, but a mentor. Receive strict yet constructive feedback on your answers, showing you exactly how to improve." },
    { title: "IB/IGCSE Paper Maker", desc: "Create syllabus-aligned test papers instantly. No fluff, no generic questions — just rigorous practice that actually helps you prepare." },
    { title: "Notes + Flashcards + Quiz", desc: "From notes to flashcards to quizzes, all in one seamless workflow. Perfect for late-night revision or quick practice sessions." },
  ];

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));

  const toggleFlip = (index: number) => {
    setFlipped((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
              className="group relative h-56 bg-white text-slate-900 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] perspective"
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
                  <span className="text-sm text-slate-500 italic group-hover:text-slate-700 transition-colors">
                    Click to find out
                  </span>
                </div>
                {/* Back */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed bg-slate-50 rounded-2xl text-slate-800 ${
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

      {/* Mission Paragraph */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center fade-up">
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-10">
          <p className="text-lg md:text-xl leading-relaxed">
            Studying has become harder than ever. With too much information to know what to do with,
            resources which never seem to construct real progress, tools which just seem to make
            problems worse and the lack of a space which not only adapts to your learning, but
            constructs an environment where learning never stops is a problem we all face today.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            Marks aren't everything and we agree. But in today's world if learning requires people to
            score arbitrary marks on a piece of paper, we might as well take out 2 birds with 1 stone.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            We aim to not only improve your score on a paper with evidence based tools but also
            foster an environment for learning like no other.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-16 text-center">
          Explore Our Features
        </h3>
        <div className="space-y-20">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-row flex flex-col md:flex-row items-center gap-10 ${
                i % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 text-slate-800">
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p>{f.desc}</p>
              </div>
              <div className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left">
                {i % 2 === 0
                  ? "Here’s why this feature matters — it tackles one of the biggest pain points students face."
                  : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mt-28 fade-up">
        <button
          onClick={scrollToTop}
          className="px-10 py-4 rounded-full bg-white text-slate-900 font-semibold shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500"
        >
          Ready to Get Started?
        </button>
      </section>
    </>
  );
}
