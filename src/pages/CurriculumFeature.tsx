import { APP_ORIGIN } from '@/lib/appOrigin';
import { Link, useParams } from "react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { CURRICULA, FEATURES, isFeatureSlug } from '@/content/curriculumDirectory';
import { BOARD_CONFIGS } from "@/lib/curriculum";

const SITE_URL = `${APP_ORIGIN}`;

export default function CurriculumFeature() {
  const { curriculum: curriculumSlug, feature: featureSlug } = useParams();
  const boardId = curriculumSlug ? CURRICULA[curriculumSlug] : undefined;

  if (!boardId || !isFeatureSlug(featureSlug)) {
    return <Article title="Study tools by curriculum" subtitle="Choose a curriculum and study tool from VertexED's supported exam-prep workspace."><Link className="btn-solid" to="/features">Explore study tools</Link></Article>;
  }

  const board = BOARD_CONFIGS[boardId];
  const feature = FEATURES[featureSlug];
  const title = `${board.label} ${feature.name} | VertexED`;
  const canonical = `${SITE_URL}/curricula/${curriculumSlug}/${featureSlug}`;
  const keywords = [
    `${board.label} ${feature.searchName}`,
    `${board.shortLabel} ${feature.searchName}`,
    `${board.label} revision tools`,
    `${board.label} exam preparation`,
    `${board.label} study app`,
  ].join(", ");

  return (
    <>
      <SEO
        title={title}
        description={`${board.label} ${feature.searchName}: ${feature.description} VertexED supports ${board.label} students with focused exam-prep workflows.`}
        keywords={keywords}
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: `${board.label} ${feature.name}`,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          description: `${board.label} ${feature.description}`,
          url: canonical,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          audience: { "@type": "EducationalAudience", educationalRole: "student" },
          keywords,
        }}
      />
      <Article
        kicker={`${board.label} exam preparation`}
        title={`${board.label} ${feature.name}`}
        subtitle={feature.description}
      >
        <p><Link to="/curricula" className="text-primary hover:underline">Browse all curriculum study tools</Link></p>
        <p className="lead">VertexED helps {board.label} students build a repeatable revision workflow without claiming affiliation with {board.label} or any examination board. {feature.focus}</p>

        {boardId === "AP" && <p><Link to="/ap">Open the AP course library for subject modules and original practice</Link></p>}
        <h2>How it fits {board.label} revision</h2>
        <ul>
          <li>Plan around subjects such as {board.subjects.slice(0, 4).join(", ")}, plus your own exam date and deadlines.</li>
          <li>Keep command terms such as {(board.commandTerms ?? []).slice(0, 4).join(", ")} visible when you practise and review answers.</li>
          {(board.features ?? []).slice(0, 2).map((item) => <li key={item}>{item} can shape the way you choose topics and practise.</li>)}
        </ul>

        <h2>Use {feature.name} effectively</h2>
        <p>{feature.focus} Pair it with official specifications, teacher guidance, and past papers when preparing for a real assessment.</p>

        <div className="not-prose mt-8 rounded-2xl border border-primary/25 bg-primary/10 p-6">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold">Start your {board.label} revision workflow</h2>
              <p className="mt-1 text-sm text-muted-foreground">Create an account, select your curriculum, and set up the tools around your real subjects and timetable.</p>
              <Link to="/signup" className="btn-solid mt-4 inline-flex items-center gap-2">Get started <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </Article>
    </>
  );
}
