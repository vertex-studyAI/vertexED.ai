import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Layers,
  UploadCloud,
} from "lucide-react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function ArchivesHome(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — VertexED</title>
        <meta
          name="description"
          content="A curated, subject-wise archive of IB MYP notes, exemplars, and study material."
        />
      </Helmet>

      <PageSection>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen size={20} />
            Archives
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-4xl">
            A structured knowledge base of curated notes and exemplar answers,
            organized by subject and built for long-term academic use.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Explanation Panel */}
          <NeumorphicCard className="p-6 lg:col-span-1 h-full">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Layers size={18} />
              What the Archives Do
            </h2>

            <ul className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <li>
                • Provide <span className="text-gray-800 font-medium">exam-aligned notes</span>,
                exemplar responses, and structured explanations across subjects.
              </li>
              <li>
                • Act as a <span className="text-gray-800 font-medium">reference library</span> —
                not a feed. Content is added deliberately, not algorithmically.
              </li>
              <li>
                • Help students understand{" "}
                <span className="text-gray-800 font-medium">
                  how high-quality answers are built
                </span>
                , not just what to memorize.
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-black/5">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <UploadCloud size={18} className="mt-0.5" />
                <p>
                  You can contribute notes, exemplars, or study material.
                  Submissions are reviewed before being added.
                  <br />
                  <span className="block mt-2 text-gray-800 font-medium">
                    Send contributions to:
                    <br />
                    vertexed.25@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </NeumorphicCard>

          {/* Right: Subject Collections */}
          <div className="lg:col-span-2 space-y-4">
            <ArchiveCard
              to="/archives/english"
              title="English — Language & Literature"
              description="Literary analysis, annotated texts, close readings, and exemplar responses across prose, poetry, and non-fiction."
            />

            <ArchiveCard
              to="/archives/history"
              title="History"
              description="Clear timelines, cause–consequence analysis, structured arguments, and source-based exemplars."
            />

            <ArchiveCard
              to="/archives/geography"
              title="Geography"
              description="Case studies, spatial frameworks, diagrams, and exam-focused explanations for physical and human geography."
            />
          </div>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link to={to} aria-label={`Open ${title}`}>
        <NeumorphicCard className="p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-medium mb-1">{title}</h3>
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
