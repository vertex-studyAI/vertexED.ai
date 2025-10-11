import SEO from "@/components/SEO";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function SubjectGuidesCommonMistakes() {
  const canonical = "https://www.vertexed.app/resources/subject-guides-common-mistakes";
  return (
    <>
      <SEO
        title="Subject Guides: Common Mistakes and Fixes (IB/IGCSE) | VertexED"
        description="High‑yield fixes for common mistakes in Math, Sciences, and Humanities across IB/IGCSE, with quick drills you can schedule in VertexED."
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Subject Guides — Common Mistakes & Fixes",
          datePublished: "2025-10-11",
          author: { "@type": "Organization", name: "VertexED" },
          mainEntityOfPage: canonical,
        }}
      />
      <Article
        title="Subject Guides: Common Mistakes and How to Fix Them"
        subtitle="Targeted, exam‑oriented advice for Math, Sciences, and Humanities with quick drills in VertexED."
        kicker="Subject Guides"
      >
        <p>
          This guide collects high‑leverage mistakes seen across IB/IGCSE subjects and turns them into
          short, repeatable drills. Use it to capture easy marks you might be leaving on the table.
        </p>

        <h2>Mathematics</h2>
        <ul>
          <li><strong>Showing working:</strong> Lose fewer marks by writing intermediate steps, even when mental math is easy.</li>
          <li><strong>Units and rounding:</strong> Carry units through; round only at the end unless specified.</li>
          <li><strong>Diagrams:</strong> Draw quick sketches—axes labeled, knowns shown—before solving.</li>
        </ul>
        <p>
          Drill with a mixed set each week. In <Link to="/study-zone">Study Zone</Link>, generate problem variants of
          the same concept to practice transfer; then use <Link to="/answer-reviewer">Answer Reviewer</Link> to check
          for clarity and completeness.
        </p>

        <h2>Sciences</h2>
        <ul>
          <li><strong>Precision in definitions:</strong> Learn examiner‑preferred wording for key terms.</li>
          <li><strong>Graphing errors:</strong> Choose correct scales, label axes with quantity + unit, and include trend lines only when justified.</li>
          <li><strong>Experimental design:</strong> Identify variables, controls, and sources of error explicitly.</li>
        </ul>
        <p>
          Use <Link to="/paper-maker">Paper Maker</Link> to generate data/graph prompts. Time yourself, then self‑check
          against a short rubric before asking <Link to="/answer-reviewer">Answer Reviewer</Link> for suggestions.
        </p>

        <h2>Humanities</h2>
        <ul>
          <li><strong>Thesis drift:</strong> Write the thesis first, then topic sentences that echo it; check alignment per paragraph.</li>
          <li><strong>Evidence without analysis:</strong> Pair every quote/fact with a why/how link to the argument.</li>
          <li><strong>Command terms:</strong> “Evaluate” needs criteria and judgment; “Compare” needs structured similarities/differences.</li>
        </ul>
        <p>
          Build a bank of outlines in <Link to="/study-zone">Study Zone</Link> and practice 10‑minute micro‑essays.
          Then pass 1–2 paragraphs through <Link to="/answer-reviewer">Answer Reviewer</Link> for rubric feedback.
        </p>

        <h2>How to use this weekly</h2>
        <ol>
          <li><strong>Pick 2 mistakes</strong> per subject that cost marks last week.</li>
          <li><strong>Schedule two 15‑minute drills</strong> in the <Link to="/planner">Planner</Link>.</li>
          <li><strong>Finish with a timed item</strong> from <Link to="/paper-maker">Paper Maker</Link> to test transfer.</li>
        </ol>

        <h2>Quick checklists</h2>
        <ul>
          <li><strong>Math:</strong> Units? Work shown? Diagram/variables labeled?</li>
          <li><strong>Sciences:</strong> Definitions precise? Variables/controls stated? Graph axes/units correct?</li>
          <li><strong>Humanities:</strong> Clear thesis? Evidence + analysis? Command term satisfied?</li>
        </ul>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/planner" className="neu-button">Schedule subject drills</Link>
          <Link to="/study-zone" className="neu-button">Generate practice prompts</Link>
          <Link to="/answer-reviewer" className="neu-button">Get feedback fast</Link>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/notes-to-flashcards">From Notes to Flashcards</Link></li>
          <li><Link to="/resources/ai-study-planner">AI Study Planner & Calendar</Link></li>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
        </ul>
      </Article>
    </>
  );
}
