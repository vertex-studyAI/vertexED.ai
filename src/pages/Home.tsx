import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import gsap from "gsap";
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
      gsap.utils.toArray(".fade-up").forEach((el) => {
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
        <title>
          AI Study Tools for Students — Notes, Flashcards, Planner | VertexED
        </title>
        <meta
          name="description"
          content="Study smarter with Vertex: AI-powered notes, flashcards, quizzes, planner, and chatbot. The all-in-one study tool for students."
        />
        <link rel="canonical" href="https://www.vertexed.app/" />
        <meta
          property="og:title"
          content="AI Study Tools for Students — Notes, Flashcards, Planner | VertexED"
        />
        <meta
          property="og:description"
          content="All-in-one AI study toolkit for students: notes, flashcards, quizzes, planner, chatbot."
        />
        <meta property="og:url" content="https://www.vertexed.app/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.vertexed.app/socialpreview.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="AI Study Tools for Students — Notes, Flashcards, Planner | VertexED"
        />
        <meta
          name="twitter:description"
          content="All-in-one AI study toolkit for students: notes, flashcards, quizzes, planner, chatbot."
        />
        <meta
          name="twitter:image"
          content="https://www.vertexed.app/socialpreview.jpg"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "AI Study Tools — VertexED",
            url: "https://www.vertexed.app/",
            description:
              "AI-powered study tools: notes, flashcards, quizzes, planner, and chatbot.",
          })}
        </script>
      </Helmet>

      <section className="relative overflow-hidden px-6 py-20 rounded-3xl animate-fade-in brand-hero bg-gradient-to-b from-slate-50/90 to-slate-100/60 backdrop-blur-xl">
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

      <section className="mt-20 w-full px-4 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              title: "AI Powered Notes",
              icon: "/notes.png",
              desc: "Summarize learning in seconds",
            },
            {
              title: "Smart Flashcards",
              icon: "/flashcards.png",
              desc: "Revise quickly and efficiently",
            },
            {
              title: "Custom Study Planner",
              icon: "/studyplanner.png",
              desc: "Spend less time planning,\nmore time doing",
            },
            {
              title: "Mock Paper Generator",
              icon: "/mockpaper.png",
              desc: "Test yourself on any topic\ninstantly",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/70 overflow-hidden transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl fade-up"
            >
              <div className="flex flex-col h-full aspect-[5/3] p-6 items-center justify-center text-center gap-4">
                <img
                  src={card.icon}
                  alt={card.title}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-lg md:text-xl font-semibold text-neutral-900 leading-snug tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm font-medium text-neutral-700 whitespace-pre-line leading-relaxed tracking-tight max-w-[90%]">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
