import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "All in 1 tool section for your calculators, activity logs and more.", span: "md:col-span-2" },
    { title: "AI Chatbot", to: "/chatbot", info: "Ask questions and get help on general topics or just simply have a discussion on academics.", span: "md:row-span-2" },
    { title: "Study Planner", to: "/planner", info: "Plan sessions and deadlines for your busy schedule in an instant." },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Strict teacher vibes, giving detailed feedback on how you can improve." },
    { title: "IB/IGCSE Paper Maker", to: "/paper-maker", info: "Create syllabus-aligned papers that actually help." },
    { title: "Note taker + Flashcards + Quiz", to: "/notetaker", info: "Notes → cards → quizzes, all in one place.", span: "md:col-span-2 md:row-span-2" },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-[minmax(200px,1fr)] gap-6 p-6">
          {tiles.map((t, i) => (
            <motion.div
              key={t.title}
              className={`relative ${t.span || ""}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              whileHover={{
                scale: 1.05,
                rotate: Math.random() > 0.5 ? 1 : -1,
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Link to={t.to}>
                <NeumorphicCard
                  className="p-8 h-full group relative overflow-hidden transition-colors duration-300 hover:shadow-2xl hover:border-accent"
                  info={t.info}
                  title={
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-yellow-400 transition-all duration-500">
                      {t.title}
                    </span>
                  }
                >
                  <p className="opacity-70 text-lg group-hover:text-accent-foreground transition-colors duration-300">
                    Open {t.title.toLowerCase()} →
                  </p>
                  <p className="text-sm opacity-60 mt-3 group-hover:opacity-90 transition-opacity duration-300">
                    {t.info}
                  </p>

                  {/* floating animated background accent */}
                  <motion.div
                    className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
                    animate={{ x: [0, 15, -15, 0], y: [0, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  />
                </NeumorphicCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
