import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BookOpenCheck, Check, ChevronRight } from "lucide-react";

import SEO from "@/components/SEO";
import { CURRICULA, FEATURES } from "@/pages/CurriculumFeature";
import { BOARD_CONFIGS } from "@/lib/curriculum";
import type { ExamBoard } from "@/types/curriculum";
import "@/styles/curriculum-directory.css";

const curriculumEntries = Object.entries(CURRICULA) as Array<[string, ExamBoard]>;

export default function CurriculumToolsIndex() {
  const [selectedSlug, setSelectedSlug] = useState("ib-myp");
  const selectedBoardId = CURRICULA[selectedSlug] ?? "IB_MYP";
  const selectedBoard = BOARD_CONFIGS[selectedBoardId];
  const selectedEntry = useMemo(
    () => curriculumEntries.find(([slug]) => slug === selectedSlug) ?? curriculumEntries[0],
    [selectedSlug],
  );

  return <>
    <SEO
      title="Study tools by curriculum | VertexED"
      description="Choose a curriculum and open focused planning, practice, answer review, notes, and AI tutor workflows for your subjects."
      keywords="study tools by curriculum, IB study tools, IGCSE revision tools, GCSE revision tools, AP study tools, CBSE study tools, ICSE study tools"
      canonical="https://www.vertexed.app/curricula"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "VertexED study tools by curriculum",
        numberOfItems: Object.keys(CURRICULA).length * Object.keys(FEATURES).length,
      }}
    />

    <div className="curriculum-directory">
      <header className="curriculum-directory-hero">
        <div>
          <p className="curriculum-directory-kicker"><span>01</span> Curriculum desk</p>
          <h1>Choose the course.<br /><em>Keep the task clear.</em></h1>
        </div>
        <div className="curriculum-directory-intro">
          <p>Select a curriculum to see the subjects, assessment language and VertexED tools that belong together.</p>
          <p>Generated material is independent practice. Check current official specifications, past papers and teacher guidance before using it for assessment preparation.</p>
        </div>
      </header>

      <section className="curriculum-selector" aria-labelledby="curriculum-selector-title">
        <p className="curriculum-directory-kicker"><span>02</span> Select a curriculum</p>
        <h2 id="curriculum-selector-title" className="sr-only">Available curricula</h2>
        <div className="curriculum-selector-rail" role="group" aria-label="Curricula">
          {curriculumEntries.map(([slug, boardId], index) => {
            const board = BOARD_CONFIGS[boardId];
            const selected = slug === selectedSlug;
            return <button key={slug} type="button" aria-pressed={selected} onClick={() => setSelectedSlug(slug)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{board.shortLabel}</strong>
              {selected && <Check aria-hidden />}
            </button>;
          })}
        </div>
      </section>

      <section className="curriculum-focus" aria-live="polite">
        <aside className="curriculum-focus-summary">
          <p className="curriculum-directory-kicker"><span>03</span> {selectedBoard.label}</p>
          <h2>{selectedBoard.label}<br />revision desk</h2>
          <p>Grades {selectedBoard.gradeRange[0]} to {selectedBoard.gradeRange[1]}. Choose your real subjects and match each practice task to the current instructions you have been given.</p>
          <div className="curriculum-subjects" aria-label={`Example ${selectedBoard.label} subjects`}>
            {selectedBoard.subjects.slice(0, 6).map((subject) => <span key={subject}>{subject}</span>)}
          </div>
          <div className="curriculum-features">
            {(selectedBoard.features ?? []).map((feature) => <p key={feature}><Check aria-hidden /> {feature}</p>)}
          </div>
        </aside>

        <div className="curriculum-tool-list">
          {Object.entries(FEATURES).map(([featureSlug, feature], index) => <Link key={featureSlug} to={`/curricula/${selectedEntry[0]}/${featureSlug}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{feature.name}</h3><p>{feature.focus}</p></div>
            <ChevronRight aria-hidden />
          </Link>)}
        </div>
      </section>

      <section className="curriculum-humanities-feature" aria-labelledby="humanities-feature-title">
        <div className="curriculum-humanities-copy">
          <p className="curriculum-directory-kicker"><span>04</span> New for IB MYP Humanities</p>
          <h2 id="humanities-feature-title">From a research question to a supported judgement.</h2>
          <p>Build a focused inquiry, work through OPVL, and plan short or extended History and Geography answers without sending your notes anywhere.</p>
          <Link to="/resources/ib-myp-humanities-guide">Open the Humanities answer studio <ArrowRight aria-hidden /></Link>
        </div>
        <div className="curriculum-humanities-paper" aria-label="Example Humanities revision trace">
          <div><BookOpenCheck aria-hidden /><span>Example / no work saved</span></div>
          <ol>
            <li><span>01</span><p><strong>Question</strong> Define factor, outcome, place and period.</p></li>
            <li><span>02</span><p><strong>Source</strong> Test origin, purpose, value and limitation.</p></li>
            <li><span>03</span><p><strong>Answer</strong> Connect evidence to a reasoned judgement.</p></li>
          </ol>
        </div>
      </section>
    </div>
  </>;
}
