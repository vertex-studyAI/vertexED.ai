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
      <section className="relative overflow-hidden px-6 py-24 bg-gradient-to-b from-white to-slate-100 text-center rounded-3xl shadow-xl">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-semibold text-slate-900 leading-tight mb-6 fade-up">
            AI study tools for students
          </h1>
          <p className="text-lg text-slate-700 mb-10 fade-up">
            An all-in-one toolkit made for you: planner, notes, flashcards,
            quizzes, chatbot, answer reviewer, and more.
          </p>
          <div className="flex gap-4 justify-center fade-up">
            <Link
              to="/main"
              className="px-8 py-4 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-all duration-500 ease-in-out shadow-lg hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-all duration-500 ease-in-out shadow-md hover:scale-105"
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
        <p className="max-w-4xl mx-auto text-slate-300 text-lg leading-relaxed">
          Studying has become harder than ever. With too much information to
          know what to do with, resources which never seem to construct real
          progress, tools which just seem to make problems worse and the lack of
          a space which not only adapts to your learning, but constructs an
          environment where learning never stops is a problem we all face today.
          <br /><br />
          Marks aren't everything and we agree. But in today's world if learning
          requires people to score arbitrary marks on a piece of paper, we might
          as well take out 2 birds with 1 stone.
          <br /><br />
          We aim to not only improve your score on a paper with evidence based
          tools but also foster an environment for learning like no other.
        </p>
      </section>

      {/* Why is this a problem? */}
      <section className="max-w-6xl mx-auto px-6 mt-28 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center">
          Why is this a problem?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div
              key={i}
              onClick={() => toggleFlip(i)}
              className="relative h-48 bg-slate-900 text-white rounded-2xl shadow-xl cursor-pointer perspective"
            >
              <div
                className={`absolute inset-0 flex items-center justify-center p-6 text-center transition-transform duration-700 transform ${
                  flipped[i] ? "rotate-y-180" : ""
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${
                    flipped[i] ? "opacity-0" : "opacity-100"
                  } transition-opacity`}
                >
                  {p.stat}
                </div>
                {/* Back */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed bg-slate-800 rounded-2xl ${
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

      {/* Keep the rest (features, solution, etc.) the same */}
    </>
  );
}
