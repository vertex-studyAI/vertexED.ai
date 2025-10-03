import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "All-in-1 workspace: calculators, activity logs, and focused-session helpers." },
    { title: "AI Chatbot", to: "/chatbot", info: "A discussion-first agent for explanations, research prompts and step-by-step help." },
    { title: "Study Planner", to: "/planner", info: "Adaptive schedule builder that fits practice around life and priorities." },
    { title: "Answer Reviewer", to: "/answer-reviewer", info: "Rubric-aware feedback with clear, actionable steps to raise your grade." },
    { title: "Paper Maker", to: "/paper-maker", info: "Board-aligned practice papers with authentic phrasing and mark schemes." },
    { title: "Note Taker + Flashcards", to: "/notetaker", info: "Capture lectures, auto-summarise and turn notes into flashcards & quizzes." },
  ];

  return (
    // Minimal wrapper — integrates into your existing page template / backdrop
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* The outer rectangle: purely stylistic container so the tiles read as one large rectangle */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-gradient-to-br from-slate-900/70 to-slate-800/60 shadow-2xl">
        {/* subtle grid outline to make the tiles read as one block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 md:p-10">
          {tiles.map((t, i) => (
            <Link to={t.to} key={t.title} className="group block">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className="h-56 md:h-64 w-full"
              >
                <NeumorphicCard
                  className={
                    "h-full p-6 rounded-xl flex flex-col justify-between bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700 shadow-md transition-all duration-400 group-hover:shadow-[0_18px_50px_rgba(12,18,40,0.6)] group-hover:border-indigo-500"
                  }
                  title={t.title}
                  info={t.info}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {/* visual accent circle */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {t.title.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-100">{t.title}</h3>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">{t.info}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-400">Quick open</span>
                    <span className="text-sm text-indigo-300 font-medium">Open →</span>
                  </div>
                </NeumorphicCard>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Decorative border highlight when the block is hovered (parent-level) */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 transition-all duration-500"></div>
      </div>
    </div>
  );
}
