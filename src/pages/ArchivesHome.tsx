import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ArchivesHome(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — VertexED</title>
        <meta
          name="description"
          content="Curated subject-wise archives of IB MYP notes, exemplar answers, and study resources."
        />
      </Helmet>

      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-24">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-5">
              Welcome to the Archives
            </h1>

            <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
              Subject-wise collections of carefully curated notes, exemplar responses, and
              exam-ready material. Designed for clarity, structure, and real classroom use.
            </p>

            <p className="mt-6 text-sm text-slate-400 max-w-2xl mx-auto">
              You can explore existing collections or contribute your own high-quality notes by
              emailing{" "}
              <span className="text-slate-200 font-medium">
                vertexed.25@gmail.com
              </span>
              .
            </p>
          </motion.header>

          {/* Archive Sections */}
          <div className="space-y-16">
            <ArchiveRow
              to="/archives/english"
              title="English (Language & Literature)"
              description="Close readings, annotated extracts, literary analysis, and high-scoring written responses across prose, poetry, and non-fiction."
            />

            <ArchiveRow
              to="/archives/history"
              title="History"
              description="Timelines, structured arguments, source analysis, and clear explanations of key historical themes and case studies."
            />

            <ArchiveRow
              to="/archives/geography"
              title="Geography"
              description="Case studies, spatial concepts, diagrams, and exam-focused explanations for physical and human geography."
            />
          </div>

          {/* Footer Note */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-28 text-center"
          >
            <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The Archives grow intentionally. Every entry is reviewed for accuracy, relevance,
              and usefulness — prioritizing depth and exam alignment over volume.
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-b border-white/10 pb-12"
    >
      <Link
        to={to}
        className="group flex items-center justify-between gap-8 focus:outline-none"
        aria-label={`Open ${title} archives`}
      >
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        <ArrowRight className="w-7 h-7 text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-200" />
      </Link>
    </motion.div>
  );
}
