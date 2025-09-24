import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { motion } from "framer-motion";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "All in 1 tool section for your calculators, activity logs and more.", size: "md:col-span-2" },
    { title: "AI Chatbot", to: "/chatbot", info: "Ask questions and get help on general topics or just simply have a discussion on academics.", size: "md:row-span-2" },
    { title: "Study Planner", to: "/planner", info: "Plan sessions and deadlines for your busy schedule in an instant." },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Not just a basic reviewer; a strict teacher of sorts which also gives the best feedback on how you can improve" },
    { title: "IB/IGCSE Paper Maker", to: "/paper-maker", info: "Create syllabus-aligned papers which are actually helpful." },
    { title: "Note taker + Flashcards + Quiz", to: "/notetaker", info: "Notes to cards to quizzes all in 1 place for those late night revision sessions", size: "md:col-span-2" },
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

      <PageSection className="relative min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
        {/* Animated background accents */}
        <motion.div
          className="absolute -left-40 top-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ y: [0, 40, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 bottom-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"
          animate={{ y: [0, -30, 0], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid layout */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[95%] mx-auto py-12">
          {tiles.map((t, i) => (
            <Link
              to={t.to}
              key={t.title}
              className={`${t.size || ""} group relative`}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <NeumorphicCard
                  className="relative h-64 md:h-80 p-8 rounded-2xl shadow-xl
                             bg-gradient-to-br from-neutral-900/80 to-neutral-800/70
                             border border-neutral-700/50
                             group-hover:border-purple-400/40
                             backdrop-blur-md overflow-hidden
                             transition-all duration-300"
                  title={t.title}
                  info={t.info}
                >
                  {/* Subtle radial overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent)] pointer-events-none" />

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-neutral-200 group-hover:text-white transition-colors duration-300">
                    {t.title}
                  </h3>

                  {/* Call to action */}
                  <p className="opacity-60 text-base mt-3 group-hover:opacity-90 group-hover:text-purple-200 transition duration-300">
                    Open {t.title.toLowerCase()} →
                  </p>

                  {/* Info */}
                  <p className="text-sm opacity-50 mt-2 leading-relaxed group-hover:opacity-70">
                    {t.info}
                  </p>
                </NeumorphicCard>
              </motion.div>
            </Link>
          ))}
        </div>
      </PageSection>
    </>
  );
}
