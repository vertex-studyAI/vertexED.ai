// File: /src/pages/Home.tsx
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
    { title: "Notes + Flashcards + Quiz", desc: "Seamless workflow from notes to practice sessions." },
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
          <h1 className="hero-animate text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            <TypeAnimation
              sequence={[
                "AI Study Tools for Students", 2000,
                "Smarter Planning", 2000,
                "Flashcards That Learn With You", 2000,
                "Adaptive Quizzes", 2000,
                "Your Personal Study Assistant", 2000,
              ]}
              speed={50}
              wrapper="span"
              repeat={Infinity}
            />
          </h1>
          <p className="hero-animate text-lg text-slate-200 mb-10">
            An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer, and more.
          </p>
          <div className="hero-animate flex gap-4 justify-center">
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
            <Link
              to="/features"
              className="px-8 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-500 ease-in-out shadow-lg hover:scale-105"
            >
              Explore Features
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

      {/* Mission */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center fade-up">
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-10">
          <p className="text-lg md:text-xl leading-relaxed">
            Studying has become harder than ever. With too much information and scattered tools,
            progress feels elusive. We’re building a space that adapts to your learning style and
            keeps progress continuous.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            Marks aren't everything, but they matter. If exams demand performance, our platform
            makes sure learning and scoring go hand-in-hand.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            We aim to not only improve your score with evidence-based tools but also create a space
            where true learning never stops.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-12 text-center">
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
                {featureSideText[i]}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-16">
          <Link
            to="/features"
            className="px-8 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-500 ease-in-out shadow-lg hover:scale-105"
          >
            See All Features
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">
          Ready to get started?
          <br />
          We guarantee a change!
        </h3>
        <button
          onClick={scrollToTop}
          className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out"
        >
          Back to the Top?
        </button>
      </section>
    </>
  );
}
