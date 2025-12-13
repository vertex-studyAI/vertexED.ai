import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

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

      <PageSection>
        {/* Header (compact, app-style) */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen size={20} />
            Archives
          </h1>
          <p className="text-sm text-gray-500 max-w-3xl mt-1">
            Subject-wise collections of curated notes, exemplars, and exam-ready material.
          </p>
        </div>

        {/* Archive Cards */}
        <div className="space-y-4 max-w-5xl">
          <ArchiveCard
            to="/archives/english"
            title="English (Language & Literature)"
            description="Close readings, annotated extracts, literary analysis, and high-scoring responses."
          />

          <ArchiveCard
            to="/archives/history"
            title="History"
            description="Timelines, structured arguments, source analysis, and case studies."
          />

          <ArchiveCard
            to="/archives/geography"
            title="Geography"
            description="Case studies, spatial concepts, diagrams, and exam-focused explanations."
          />
        </div>

        {/* Footer note (quiet, not a hero) */}
        <div className="mt-10 text-xs text-gray-500 max-w-3xl">
          Archives are reviewed for accuracy, relevance, and exam alignment.
          Contributions can be sent to{" "}
          <span className="text-gray-700 font-medium">
            vertexed.25@gmail.com
          </span>
          .
        </div>
      </PageSection>
    </>
  );
}

function ArchiveCard({
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={to} aria-label={`Open ${title}`}>
        <NeumorphicCard className="p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-medium mb-1">{title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
        </NeumorphicCard>
      </Link>
    </motion.div>
  );
}
