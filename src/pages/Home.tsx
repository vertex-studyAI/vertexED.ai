import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);
  return (
    <>
      <Helmet>
        <title>Vertex — AI Study Toolkit | Home</title>
        <meta name="description" content="Vertex is a modern AI-powered study toolkit with planner, chatbot, notes, flashcards and quizzes." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/'} />
      </Helmet>
  {/* Gradient background now provided by SiteLayout when on home route */}

  <section
    className="relative overflow-hidden px-6 py-14 md:py-20 rounded-3xl animate-fade-in brand-hero"
  >
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-4 text-black">The only study tool you need</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl text-black">All-in-one AI toolkit for students—planner, notes, flashcards, quizzes, chatbot, and more in one elegant workspace.</p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/main" className="px-6 py-3 rounded-2xl brand-cta brand-ink-dark">Get Started</Link>
            <Link to="/about" className="subtle px-6 py-3 rounded-2xl brand-cta brand-ink-dark">Learn more</Link>
          </div>
        </div>
  </section>

      <section className="mt-12 w-full px-4 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 mb-8">
          {[
            { title: 'AI Powered Notes', icon: '/notes.png', desc: 'Summarize learning in seconds' },
            { title: 'Smart Flashcards', icon: '/flashcards.png', desc: 'Revise quickly and efficiently' },
            { title: 'Custom Study Planner', icon: '/studyplanner.png', desc: 'Spend less time planning,\nmore time doing' },
            { title: 'Mock Paper Generator', icon: '/mockpaper.png', desc: 'Test yourself on any topic\ninstantly' },
          ].map(card => (
            <div
              key={card.title}
              className="group relative rounded-xl shadow-sm border border-border/40 overflow-hidden brand-tile"
            >
              <div className="flex flex-col h-full aspect-[5/3] p-3 sm:p-4 md:p-5 items-center justify-center text-center gap-3">
                <img src={card.icon} alt="" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain transition-all duration-300" loading="lazy" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-neutral-900 leading-snug tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-1 text-[10px] sm:text-[11px] md:text-xs font-medium text-neutral-700 whitespace-pre-line leading-relaxed tracking-tight max-w-[90%]">
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