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
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
            },
          }
        );
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Study Tools for Students | VertexED</title>
        <meta
          name="description"
          content="VertexED — Apple-inspired AI toolkit for students: smarter notes, flashcards, planner, and more."
        />
        <link rel="canonical" href="https://www.vertexed.app/" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 rounded-3xl bg-gradient-to-b from-slate-50/90 to-slate-100/60 backdrop-blur-xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-6 text-neutral-900 tracking-tight fade-up">
            AI study tools for students
          </h1>
          <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto text-neutral-800 fade-up">
            All-in-one AI toolkit for students—planner, notes, flashcards,
            quizzes, chatbot, and more in one elegant workspace.
          </p>
          <div className="flex gap-4 justify-center flex-wrap fade-up">
            <Link
              to="/main"
              className="px-8 py-4 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-md"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300 transition-colors shadow-sm"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="mt-32 px-6 max-w-4xl mx-auto text-center fade-up">
        <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-6">
          We hate the way we study
        </h2>
        <p className="text-xl text-neutral-600 mb-10">Who wouldn’t?</p>
      </section>

      {/* The Problem */}
      <section className="mt-16 px-6 max-w-5xl mx-auto fade-up">
        <div className="rounded-3xl bg-white/60 backdrop-blur-lg p-10 shadow-xl">
          <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-6">
            The Problem
          </h3>
          <ul className="space-y-3 text-neutral-700 text-lg">
            <li>• Lack of relevant resources</li>
            <li>• Too much effort into note-taking</li>
            <li>• Lack of rigor-appropriate test papers</li>
            <li>• Extremely tedious, easy to procrastinate</li>
            <li>• Multiple apps, scattered workflow</li>
          </ul>
        </div>
      </section>

      {/* The Solution */}
      <section className="mt-24 px-6 max-w-5xl mx-auto fade-up text-center">
        <h3 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-6">
          The Solution
        </h3>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
          VertexED.AI brings everything into one elegant, Apple-like workspace —
          powered by AI. Notes, flashcards, planner, quizzes, and more, designed
          to make studying easier, smarter, and more productive.
        </p>
      </section>

      {/* What We Offer */}
      <section className="mt-24 px-6 max-w-6xl mx-auto fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-neutral-900 text-center mb-12">
          What We Offer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Smarter Notes", desc: "Summarize instantly, never waste hours writing." },
            { title: "Flashcards on Demand", desc: "AI builds your flashcards while you learn." },
            { title: "Mock Papers", desc: "Practice with AI-generated test papers." },
            { title: "Study Planner", desc: "Custom-tailored plans that adapt to you." },
            { title: "AI Tutor", desc: "Your own chatbot mentor for any subject." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white/70 backdrop-blur-xl p-8 text-center shadow-lg hover:shadow-2xl transition-all"
            >
              <h4 className="text-xl font-semibold mb-3 text-neutral-900">
                {item.title}
              </h4>
              <p className="text-neutral-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What Makes Us Special */}
      <section className="mt-28 px-6 max-w-5xl mx-auto fade-up text-center">
        <h3 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-6">
          What Makes Us Special
        </h3>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
          Unlike other tools, VertexED.AI is designed by students, for students.
          We know the pain of endless hours, scattered apps, and unproductive
          studying. Our liquid-glass design, AI-powered features, and
          all-in-one approach make learning as elegant as it is powerful.
        </p>
      </section>

      {/* End CTA */}
      <section className="mt-32 mb-24 text-center fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-8">
          Ready to get started?
        </h3>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="px-10 py-5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-lg"
        >
          Back to Top
        </button>
      </section>
    </>
  );
}
