import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Layers,
  UploadCloud,
} from "lucide-react";

import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function ArchivesHome(): JSX.Element {
  const reduceMotion = useReducedMotion();

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
        <header className="mb-10">
          <h1 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen size={20} aria-hidden />
            Archives
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-4xl">
            A structured knowledge base of curated notes and exemplar answers,
            organized by subject and built for long-term academic use.
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Explanation Panel */}
          <NeumorphicCard className="p-6 lg:col-span-1 h-full">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Layers size={18} aria-hidden />
              What the Archives Do
            </h2>

            <ul className="list-disc pl-5 space-y-4 text-sm text-gray-600 leading-relaxed">
              <li>
                Provide{" "}
                <span className="text-gray-800 font-medium">
                  exam-aligned notes
                </span>
                , exemplar responses, and structured explanations.
              </li>
              <li>
                Act as a{" "}
                <span className="text-gray-800 font-medium">
                  reference library
                </span>{" "}
                — not a feed. Content is added deliberately.
              </li>
              <li>
                Teach{" "}
                <span className="text-gray-800 font-medium">
                  how high-quality answers are built
                </span>
                , not just what to memorize.
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-black/5">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <UploadCloud size={18} className="mt-0.5" aria-hidden />
                <p>
                  You can contribute notes, exemplars, or study material.
                  Submissions are reviewed before being added.
                  <br />
                  <a
                    href="mailto:vertexed.25@gmail.com"
                    className="block mt-2 font-medium text-gray-800 hover:underline"
                  >
                    vertexed.25@gmail.com
                  </a>
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
              reduceMotion={reduceMotion}
            />

            <ArchiveCard
              to="/archives/history"
              title="History"
              description="Clear timelines, cause–consequence analysis, structured arguments, and source-based exemplars."
              reduceMotion={reduceMotion}
            />

            <ArchiveCard
              to="/archives/geography"
              title="Geography"
              description="Case studies, spatial frameworks, diagrams, and exam-focused explanations for physical and human geography."
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
      </PageSection>
    </>
  );
}

type ArchiveCardProps = {
  to: string;
  title: string;
  description: string;
  reduceMotion: boolean;
};

function ArchiveCard({
  to,
  title,
  description,
  reduceMotion,
}: ArchiveCardProps) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        to={to}
        aria-label={`Open ${title}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded-xl"
      >
        <NeumorphicCard className="p-6 transition-transform hover:scale-[1.01]">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-medium mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>

            <ArrowRight
              className="w-5 h-5 text-gray-400 shrink-0"
              aria-hidden
            />
          </div>
        </NeumorphicCard>
      </Link>
    </motion.div>
  );
}
