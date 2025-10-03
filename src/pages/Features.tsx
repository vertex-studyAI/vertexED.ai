// File: /src/pages/Features.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

const features = [
  {
    title: "AI Calendar",
    icon: "/calendar.png",
    desc: "Plan smarter with an AI-powered calendar that adapts to your study needs.",
  },
  {
    title: "Smart Notes",
    icon: "/notes.png",
    desc: "Generate concise notes instantly from your study materials.",
  },
  {
    title: "Adaptive Quizzes",
    icon: "/quiz.png",
    desc: "Test yourself with AI-tailored quizzes that focus on your weak spots.",
  },
  {
    title: "Flashcards",
    icon: "/flashcards.png",
    desc: "Retain information longer with intelligent, spaced-repetition flashcards.",
  },
  {
    title: "Study Hub",
    icon: "/hub.png",
    desc: "All your study resources in one place with seamless organization.",
  },
  {
    title: "Answer Reviewer",
    icon: "/review.png",
    desc: "Get instant feedback and corrections on practice answers.",
  },
];

export default function Features() {
  return (
    <>
      <Helmet>
        <title>Features — VertexED</title>
        <meta
          name="description"
          content="Explore VertexED's features: AI personalized chatbots, IB/IGCSE paper makers, note takers, flashcards, quizzes, answer reviewers, study hub, and AI calendar."
        />
        <link rel="canonical" href="https://www.vertexed.app/features" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 rounded-3xl animate-fade-in bg-gradient-to-b from-slate-50/90 to-slate-100/60 backdrop-blur-xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-semibold leading-tight mb-6 text-neutral-900 tracking-tight fade-up">
            Powerful AI Features
          </h1>
          <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto text-neutral-800 fade-up">
            Everything you need to study smarter: AI chatbots, paper makers,
            flashcards, quizzes, planners, and more.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mt-20 w-full px-4 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/70 overflow-hidden transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
            >
              <div className="flex flex-col h-full aspect-[5/3] p-6 items-center justify-center text-center gap-4">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-lg md:text-xl font-semibold text-neutral-900 leading-snug tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm font-medium text-neutral-700 whitespace-pre-line leading-relaxed tracking-tight max-w-[90%]">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
