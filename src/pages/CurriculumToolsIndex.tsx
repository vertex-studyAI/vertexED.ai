import { Link } from "react-router-dom";

import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { CURRICULA, FEATURES } from "@/pages/CurriculumFeature";
import { BOARD_CONFIGS } from "@/lib/curriculum";

export default function CurriculumToolsIndex() {
  return (
    <>
      <SEO
        title="Study tools by curriculum | VertexED"
        description="Find study planner, practice paper, answer feedback, notes, and AI tutor tools for IB MYP, IB DP, IGCSE, GCSE, A-Level, AP, CBSE, and ICSE revision."
        keywords="study tools by curriculum, IB study tools, IGCSE revision tools, GCSE revision tools, AP study tools, CBSE study tools, ICSE study tools"
        canonical="https://www.vertexed.app/curricula"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "VertexED study tools by curriculum",
          numberOfItems: Object.keys(CURRICULA).length * Object.keys(FEATURES).length,
        }}
      />
      <Article
        kicker="Exam preparation"
        title="Study tools by curriculum"
        subtitle="Choose your curriculum, then open the revision tool that fits the job in front of you."
      >
        <p className="lead">Each page explains how a VertexED tool can support a specific curriculum. Use official specifications, teacher guidance, and past papers alongside these tools.</p>
        <div className="not-prose grid gap-6 sm:grid-cols-2">
          {Object.entries(CURRICULA).map(([slug, boardId]) => {
            const board = BOARD_CONFIGS[boardId];
            return (
              <section key={slug} className="glass-panel p-5">
                <h2 className="text-xl font-semibold">{board.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{board.subjects.slice(0, 4).join(", ")} and more.</p>
                <ul className="mt-4 grid gap-2 text-sm">
                  {Object.entries(FEATURES).map(([featureSlug, feature]) => (
                    <li key={featureSlug}>
                      <Link className="text-primary hover:underline" to={`/curricula/${slug}/${featureSlug}`}>
                        {board.label} {feature.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Article>
    </>
  );
}
