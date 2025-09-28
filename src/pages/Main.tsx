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

      {/* Clean rectangular layout */}
        <PageSection className="relative w-full max-w-6xl bg-slate-900/70 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md overflow-hidden p-10 flex flex-col">
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Welcome to Vertex AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-4 text-slate-300 text-lg"
            >
              Your all-in-one AI-powered study companion. Pick a tool below and get started
            </motion.p>
          </div>

          {/* Rectangular Grid of Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {tiles.map((t, i) => (
              <Link to={t.to} key={t.title} className="group relative">
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <NeumorphicCard
                    className="w-full h-full p-6 rounded-xl shadow-lg
                               bg-gradient-to-br from-slate-800/80 to-slate-900/90
                               border border-slate-700 backdrop-blur-md
                               group-hover:border-indigo-400 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
                               transition-all duration-500 ease-out"
                    title={t.title}
                    info={t.info}
                  >
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors duration-300">
                      {t.title}
                    </h3>

                    {/* CTA */}
                    <p className="opacity-70 text-sm mt-2 group-hover:opacity-100 group-hover:text-indigo-400 transition duration-500">
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
          <footer className="text-center py-6 border-t border-slate-700 mt-12">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Vertex AI — All rights reserved.
            </p>
          </footer>
        </PageSection>
      </div>
    </>
  );
}
