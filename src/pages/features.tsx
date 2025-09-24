import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Features() {
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

  const features = [
    {
      title: "AI Personalized Chatbots",
      icon: "/chatbot.png",
      desc: "Get tailored guidance and instant support from intelligent study companions.",
    },
    {
      title: "IB & IGCSE Paper Makers",
      icon: "/papermaker.png",
      desc: "Generate exam-style papers aligned with IB and IGCSE standards instantly.",
    },
    {
      title: "Note Takers, Flashcards & Quick Quizzes",
      icon: "/noteflashquiz.png",
      desc: "Turn your study materials into clear notes, smart flashcards, and quizzes on demand.",
    },
    {
      title: "Answer Reviewers",
      icon: "/answerreview.png",
      desc: "Upload answers and receive instant AI-powered feedback to improve your performance.",
    },
    {
      title: "Study Hub",
      icon: "/studyhub.png",
      desc: "Organize all your notes, quizzes, flashcards, and resources in one clean workspace.",
    },
    {
      title: "AI Calendar",
      icon: "/calendar.png",
      desc: "Plan smarter with an AI-powered calendar that adapts to your study needs.",
    },
  ];

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

      <section className="mt-20 w-full px-4 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
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
