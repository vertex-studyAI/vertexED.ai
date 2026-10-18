import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Library,
  Layers,
  UploadCloud,
} from "lucide-react";

import { ARCHIVE_COLLECTIONS } from '@/content/resourceLibrary';

import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function ArchivesHome() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>Archives - VertexED</title>
        <meta
          name="description"
          content="Three legacy starter collections for English Language and Literature, History and Geography."
        />
      </Helmet>

      <PageSection>
        <header className="mb-10">
          <h1 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen size={20} aria-hidden />
            Archives
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-4xl leading-relaxed">
            A directory of legacy English Language &amp; Literature, History and Geography collections.
            Materials awaiting subject review are labelled and unavailable.
          </p>
        </header>

        <NeumorphicCard className="p-5 mb-8 border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Library className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {ARCHIVE_COLLECTIONS.length} reviewed collections are available. Browse subject directories in the{" "}
              <Link to="/myp" className="text-primary hover:underline">
                MYP 5 learning hub
              </Link>
              . For available resources and study workflows, open the{" "}
              <Link to="/resources" className="text-primary hover:underline">
                Learning library
              </Link>.
            </p>
          </div>
        </NeumorphicCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <NeumorphicCard className="p-6 lg:col-span-1 h-full">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Layers size={18} aria-hidden />
              What the Archives Do
            </h2>

            <ul className="list-disc pl-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <li>Collection names remain available while their material is reviewed.</li>
              <li>Content, sources and permissions must be checked before publication.</li>
              <li>Use your teacher’s approved materials for current exam preparation.</li>
            </ul>

            <div className="mt-6 pt-4 border-t border-border/60">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <UploadCloud size={18} className="mt-0.5 shrink-0" aria-hidden />
                <p>
                  Got notes or exemplars to share? Send them our way - we review everything before it goes live.
                  <br />
                  <a
                    href="mailto:vertexed.25@gmail.com"
                    className="block mt-2 font-medium text-primary hover:underline"
                  >
                    vertexed.25@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </NeumorphicCard>

          <div className="lg:col-span-2 space-y-4">
            <ArchiveCard
              to="/archives-lnl"
              title="English - Language & Literature"
              description="Literary analysis, annotated texts, and exemplar responses across prose, poetry, and non-fiction."
              reduceMotion={reduceMotion}
            />

            <ArchiveCard
              to="/archives-history"
              title="History"
              description="Timelines, cause-and-effect chains, and source-based answers that actually score."
              reduceMotion={reduceMotion}
            />

            <ArchiveCard
              to="/archives-geography"
              title="Geography"
              description="Case studies, diagrams, and explanations for physical and human geography."
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
  reduceMotion: boolean | null;
};

function ArchiveCard({ to, title, description, reduceMotion }: ArchiveCardProps) {
  if (!ARCHIVE_COLLECTIONS.some((entry) => entry.to === to)) return <NeumorphicCard className="p-6">
    <h3 className="text-base font-medium mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">Awaiting subject review. This collection is not available yet.</p>
  </NeumorphicCard>;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        to={to}
        aria-label={`Open ${title}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
      >
        <NeumorphicCard className="p-6 transition-transform hover:scale-[1.01]">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-medium mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
          </div>
        </NeumorphicCard>
      </Link>
    </motion.div>
  );
}
