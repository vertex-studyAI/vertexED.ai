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

      <PageSection>
        {/* Grid layout instead of scroll */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 px-4">
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
                whileHover={{ scale: 1.04, rotateX: 2, rotateY: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <NeumorphicCard
                  className="relative h-64 md:h-80 p-8 rounded-2xl shadow-lg 
                             bg-gradient-to-br from-neutral-900/80 to-neutral-800/70
                             border border-neutral-700/50
                             group-hover:border-neutral-500/50
                             backdrop-blur-sm overflow-hidden"
                  title={t.title}
                  info={t.info}
                >
                  {/* Subtle background texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04),transparent)]" />

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-neutral-200 group-hover:text-white transition-colors duration-300">
                    {t.title}
                  </h3>

                  {/* Call to action */}
                  <p className="opacity-60 text-base mt-3 group-hover:opacity-80 transition duration-300">
                    Open {t.title.toLowerCase()} →
                  </p>

                  {/* Info */}
                  <p className="text-sm opacity-50 mt-2 leading-relaxed">
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
