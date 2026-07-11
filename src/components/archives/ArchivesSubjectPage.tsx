import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen } from "lucide-react";

import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

type SampleItem = { title: string; body: string; tag?: string };

const ARCHIVE_SAMPLES: Record<string, Record<string, SampleItem[]>> = {
  LnL: {
    Overview: [
      { title: "What makes a strong literary analysis?", body: "Lead with a precise thesis on authorial choice (structure, imagery, tone), then anchor each paragraph in a short quoted evidence line with explicit technique naming.", tag: "IB MYP" },
      { title: "Comparing prose vs poetry responses", body: "Prose rewards narrative voice and pacing commentary; poetry rewards sound devices, line breaks, and connotation chains. Keep comparison balanced — one paragraph per text minimum.", tag: "Guide" },
      { title: "Paper 1 timing", body: "15 min reading + planning, 75 min writing. Allocate marks-per-minute: a 20-mark response deserves roughly 25–30 minutes.", tag: "Exam" },
    ],
    "Close Readings": [
      { title: "Annotating for Paper 1", body: "Label: T (tone shift), I (image cluster), S (structure pivot). Circle verbs that carry emotional load. Margin-note 'so what?' after every observation.", tag: "Technique" },
      { title: "Sample prompt — Unseen prose", body: "How does the writer create a sense of unease in lines 1–18? Plan: diction of threat → syntax shortening → focalization narrowing.", tag: "Practice" },
    ],
    "Sample Essays": [
      { title: "Exemplar opener (Level 7 style)", body: "Rather than presenting the storm as mere backdrop, the writer embeds environmental volatility in the protagonist's syntax — short clauses mirror fractured control.", tag: "Exemplar" },
      { title: "Conclusion that evaluates", body: "End by weighing which technique is most significant for the overall effect — don't introduce new evidence in the final paragraph.", tag: "Technique" },
    ],
    "Practice Questions": [
      { title: "Paper 1 style Q", body: "Explore how the writer uses imagery to convey the speaker's attitude toward memory. [20 marks]", tag: "IB" },
      { title: "IO practice", body: "Discuss how the global issue of identity is presented through the extract and one other work you have studied.", tag: "Oral" },
    ],
  },
  History: {
    Overview: [
      { title: "Cause vs consequence paragraphs", body: "Open with a ranked cause claim, support with evidence, then evaluate significance using a criterion (duration, scale, inevitability).", tag: "Essay" },
      { title: "Compare two causes", body: "Use a two-column plan: Factor A evidence vs Factor B evidence. Conclude with a ranked judgement, not a summary.", tag: "Structure" },
    ],
    Timelines: [
      { title: "Cold War — core sequence", body: "1945 Potsdam → 1947 Truman Doctrine → 1949 NATO → 1962 Cuban Missile Crisis → 1972 détente → 1989 fall of Berlin Wall.", tag: "Timeline" },
      { title: "WWI causes chain", body: "Militarism → Alliances → Imperialism → Nationalism (MAIN) → assassination as trigger. Distinguish long-term vs short-term.", tag: "Causes" },
    ],
    "Source Analysis": [
      { title: "OPCVL in 4 sentences", body: "Origin + purpose in one line; content summary; limitation from bias/context; value for the specific historical question.", tag: "Method" },
    ],
    "Model Responses": [
      { title: "To what extent — structure", body: "Thesis with extent qualifier → 2 paragraphs 'to a great extent' → 1 counter paragraph → weighted conclusion with criteria.", tag: "Exemplar" },
    ],
  },
  Geography: {
    Overview: [
      { title: "Case study answers", body: "Always NAME → LOCATE → PROCESS → IMPACT → RESPONSE. Include a statistic or named policy for top bands.", tag: "Framework" },
      { title: "9-mark structure", body: "Define key term → describe process with data → explain impact → brief evaluation with a named example.", tag: "IGCSE" },
    ],
    "Case Studies": [
      { title: "River flooding — UK example", body: "Somerset Levels 2014: prolonged rainfall, saturated catchment, managed vs natural floodplain debate, EA recovery schemes.", tag: "Case study" },
      { title: "Urbanisation — Lagos", body: "Rapid growth, informal settlements, infrastructure strain, government responses including Eko Atlantic and transport investment.", tag: "Urban" },
    ],
    "Maps & Diagrams": [
      { title: "Sketch map checklist", body: "Compass, scale bar, key, shading for relief, arrows for flow/process, labelled title with figure number.", tag: "Skills" },
    ],
    "Practice Questions": [
      { title: "Evaluate urban sustainability", body: "Assess the success of one scheme used to improve sustainability in a city you have studied. [9 marks]", tag: "IGCSE" },
    ],
  },
};

type ArchivesSubjectPageProps = {
  title: string;
  slug: string;
  description: string;
  tabs: string[];
};

export default function ArchivesSubjectPage({
  title,
  slug,
  description,
  tabs,
}: ArchivesSubjectPageProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0]);
  const samples = ARCHIVE_SAMPLES[slug]?.[activeTab] ?? [];

  return (
    <>
      <Helmet>
        <title>{title} — Archives</title>
        <meta name="description" content={`${title} archive: curated notes, exemplars, and practice questions.`} />
      </Helmet>

      <PageSection>
        <div className="mb-6">
          <Link to="/archives" className="neu-button px-4 py-2 text-sm">
            ← Back to Archives
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold brand-text-gradient inline-block">{title}</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p>
          </div>

          <nav className="text-sm text-muted-foreground">
            <Link to="/archives" className="hover:text-foreground transition">
              Archives
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{slug}</span>
          </nav>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border/60 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-t-md transition ${
                activeTab === tab
                  ? "bg-foreground/[0.06] text-foreground border border-border/60 border-b-0"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {samples.length ? (
            samples.map((item) => (
              <NeumorphicCard key={item.title} className="p-5">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-medium text-foreground">{item.title}</h2>
                      {item.tag && (
                        <span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-0.5">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </NeumorphicCard>
            ))
          ) : (
            <NeumorphicCard className="p-8">
              <h2 className="text-lg font-medium mb-2">{activeTab}</h2>
              <p className="text-sm text-muted-foreground">
                More {activeTab.toLowerCase()} content is on the way. Contribute via{" "}
                <a href="mailto:vertexed.25@gmail.com" className="text-primary hover:underline">
                  vertexed.25@gmail.com
                </a>
                .
              </p>
            </NeumorphicCard>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Starter archive set — student-contributed expansion coming. Use{" "}
          <Link to="/paper-maker" className="text-primary hover:underline">Paper Maker</Link> for custom practice.
        </p>
      </PageSection>
    </>
  );
}
