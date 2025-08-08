import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Vertex — AI Study Toolkit | Home</title>
        <meta name="description" content="Vertex is a modern AI-powered study toolkit with planner, chatbot, notes, flashcards and quizzes." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/'} />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden neu-hero px-6 py-14 md:py-20 rounded-3xl"
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-4">The only study tool you need</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl">All-in-one AI toolkit for students—planner, notes, flashcards, quizzes, chatbot, and more in one elegant workspace.</p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/main" className="neu-button px-6 py-3 text-base">Get Started</Link>
            <Link to="/about" className="neu-button subtle px-6 py-3 text-base">Learn more</Link>
          </div>
        </div>

        <img src="/lovable-uploads/64fbacd2-bdac-437f-aae4-b7a1751cd8f6.png" alt="Books illustration" loading="lazy" className="absolute -bottom-6 left-0 w-64 md:w-96 opacity-70 pointer-events-none" />
        <img src="/lovable-uploads/4ad3dbf0-06b3-4925-92ca-5ba6b3c5173a.png" alt="Leaves illustration" loading="lazy" className="absolute -right-6 -bottom-8 w-48 md:w-72 opacity-70 pointer-events-none" />
      </motion.section>

      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[
          { title: "Study Zone", to: "/study-zone" },
          { title: "AI Chatbot", to: "/chatbot" },
          { title: "Note taker + Flashcards + Quiz", to: "/notetaker" },
          { title: "AI Calendar", to: "/planner" },
          { title: "Study Planner", to: "/planner" },
          { title: "Image Answer", to: "/image-answer" },
        ].map((card) => (
          <Link key={card.title} to={card.to} className="group">
            <motion.div whileHover={{ y: -4 }} className="neu-card h-full p-6">
              <h3 className="text-xl font-medium mb-2 group-hover:translate-x-1 transition-transform">{card.title}</h3>
              <p className="opacity-70 text-sm">Explore {card.title.toLowerCase()} →</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </>
  );
}
