import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { motion } from "framer-motion";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "All in 1 tool section for your calculators, activity logs and more." },
    { title: "AI Chatbot", to: "/chatbot", info: "Ask questions and get help on general topics or just simply have a discussion on academics." },
    { title: "Study Planner", to: "/planner", info: "Plan sessions and deadlines for your busy schedule in an instant." },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Not just a basic reviewer; a strict teacher of sorts which also gives the best feedback on how you can improve." },
    { title: "IB/IGCSE Paper Maker", to: "/paper-maker", info: "Create syllabus-aligned papers which are actually helpful." },
    { title: "Note taker + Flashcards + Quiz", to: "/notetaker", info: "Notes to cards to quizzes all in 1 place for those late night revision sessions." },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard — Vertex AI Study Tools</title>
        <meta
          name="description"
          content="Your Vertex dashboard with quick access to all AI study tools."
        />
        <link rel="canonical" href="https://www.vertexed.app/main" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto pt-12 pb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold text-slate-100"
          >
            Welcome to <span className="text-indigo-400">Vertex AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 text-slate-300 text-lg"
          >
            Your all-in-one AI-powered study companion. Pick a tool below and get
            started 🚀
          </motion.p>
        </div>

        {/* Grid of Tools */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto py-16 flex-1">
          {tiles.map((t, i) => (
            <Link to={t.to} key={t.title} className="group relative">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <NeumorphicCard
                  className="relative h-full aspect-square p-6 rounded-2xl shadow-xl
                             bg-gradient-to-br from-slate-800/80 to-slate-900/90
                             border border-slate-700 backdrop-blur-md
                             group-hover:border-slate-500
                             group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
                             transition-all duration-500 ease-out"
                  title={t.title}
                  info={t.info}
                >
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-slate-100 group-hover:text-slate-50 transition-colors duration-300">
                    {t.title}
                  </h3>

                  {/* CTA */}
                  <p className="opacity-70 text-sm mt-2 group-hover:opacity-100 group-hover:text-indigo-300 transition duration-500">
                    Open {t.title.toLowerCase()} →
                  </p>

                  {/* Info */}
                  <p className="text-xs opacity-60 mt-2 leading-relaxed group-hover:opacity-90 text-slate-300">
                    {t.info}
                  </p>
                </NeumorphicCard>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-slate-700 mt-auto">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Vertex AI — All rights reserved.
          </p>
        </footer>
      </PageSection>
    </>
  );
}
