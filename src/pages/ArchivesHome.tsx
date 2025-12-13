import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * ArchivesHome — Minimal, editorial-style redesign
 * - Removes boxed cards entirely
 * - Full-width, typographic layout
 * - Subtle motion + hover underline
 * - Feels like a serious archive, not a dashboard
 */
export default function ArchivesHome(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — VertexED</title>
        <meta
          name="description"
          content="A clean, curated archive of IB MYP notes and exemplar answers across Language & Literature, History, and Geography."
        />
      </Helmet>

      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-28">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-6">
              The Archives
            </h1>
            <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
              A carefully maintained repository of notes and exemplar responses for common
              classroom and exam questions. Built primarily for IB MYP students, with clarity,
              structure, and depth as first principles.
            </p>
          </motion.header>

          {/* Archive Links */}
          <div className="space-y-14">
            <ArchiveRow
              to="/archives/lnl"
              title="Language & Literature"
              description="Close readings, annotated texts, and high-scoring written responses."
            />
            <ArchiveRow
              to="/archives/history"
              title="History"
              description="Structured timelines, source analysis, and exam-ready arguments."
            />
            <ArchiveRow
              to="/archives/geography"
              title="Geography"
              description="Case studies, spatial thinking, and practice prompts." 
            />
          </div>

          {/* Footer Note */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-28 text-center"
          >
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              This archive grows over time. Content is added deliberately — prioritizing accuracy,
              usefulness, and exam relevance over volume.
            </p>
          </motion.footer>
        </div>
      </section>
    </>
  );
}

function ArchiveRow({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-b border-white/10 pb-10"
    >
      <Link
        to={to}
        className="group flex items-center justify-between gap-6 focus:outline-none"
        aria-label={`Open ${title} archives`}
      >
        <div>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-slate-300 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        <ArrowRight className="w-7 h-7 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-200" />
      </Link>
    </motion.div>
  );
}
