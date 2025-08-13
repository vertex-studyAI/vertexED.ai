import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
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
      </motion.section>

      <section className="mt-12 max-w-4xl">
        <p className="opacity-90 text-lg md:text-xl leading-relaxed mb-8">
          Vertex revolutionizes the way students approach learning by unifying planning, note-taking, flashcards, quizzes, AI chat, and specialized tools like IB/IGCSE paper makers into one seamless, elegant workspace. Born from the minds of three ambitious high school students, Vertex is designed for focus and flow—it's fast, minimal, intuitive, and perfectly crafted for your study routine. Whether you're preparing for exams, organizing complex projects, or seeking AI-powered assistance with challenging concepts, Vertex adapts to your unique learning style and helps you achieve academic excellence.
        </p>
        <blockquote className="mt-8 border-l-4 border-primary pl-6 italic opacity-90 text-xl font-medium">
          "The only study tool you'll ever need."
        </blockquote>
      </section>
    </>
  );
}