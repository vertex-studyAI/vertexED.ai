import SEO from "@/components/SEO";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function ExamStrategyTimeManagement() {
  const canonical = "https://www.vertexed.app/resources/exam-strategy-time-management";
  return (
    <>
      <SEO
        title="Exam Strategy, Timing, and Marking Schemes | VertexED"
        description="Master IB/IGCSE exam strategy: time management, command terms, marking schemes, and weekly rehearsal using VertexED’s Paper Maker and Answer Reviewer."
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Exam Strategy & Time Management — IB/IGCSE",
          datePublished: "2025-10-11",
          dateModified: "2025-10-11",
          author: { "@type": "Organization", name: "VertexED" },
          publisher: { "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app" },
          mainEntityOfPage: canonical,
        }}
      />
      <Article
        title="Exam Strategy & Time Management"
        subtitle="Turn mark schemes and timing into muscle memory before test day."
        kicker="Exam Skills"
      >
        <p>
          Strong content knowledge is essential, but exams reward precision under time pressure. This
          guide converts marking schemes and command terms into concrete behaviors you can practice each
          week, so exam day feels like a familiar routine—not a surprise.
        </p>

        <h2>Decode the paper before you start</h2>
        <ul>
          <li><strong>Scan sections:</strong> Identify mandatory vs optional questions.</li>
          <li><strong>Budget time:</strong> A simple rule is ~1 minute per mark plus a small buffer.</li>
          <li><strong>Spot traps:</strong> Multi‑part items often hide easy marks in (a); secure these early.</li>
        </ul>

        <h2>Command terms → behaviors</h2>
        <p>
          Command terms map to expected depth: “Define” (precise wording), “Explain” (cause → effect →
          link), “Evaluate” (criteria + judgment), “Compare” (similarities/differences with structure).
          Build a personal checklist for 5–7 common terms in your subjects.
        </p>

        <h2>Timing drills with VertexED</h2>
        <ol>
          <li>
            <strong>Weekly mini‑papers:</strong> Use <Link to="/paper-maker">Paper Maker</Link> to generate 20–30
            marks worth of items. Set a visible timer and practice moving on when time is up.
          </li>
          <li>
            <strong>Rapid review:</strong> Immediately paste 1–2 answers into the
            <Link to="/answer-reviewer"> Answer Reviewer</Link> and compare feedback to your self‑assessment.
          </li>
          <li>
            <strong>Schedule the cycle:</strong> Add a Friday “timed set” and Sunday “review + fixes” in the
            <Link to="/planner"> Planner</Link> each week.
          </li>
        </ol>

        <h2>Mark schemes as checklists</h2>
        <p>
          Turn mark scheme patterns into short checklists. For example, a 6‑mark “Explain” might require
          mechanism, two consequences, limitations, and a linking statement. Train yourself to scan your
          answer against the checklist in 20–30 seconds before moving on.
        </p>

        <h2>Common timing mistakes</h2>
        <ul>
          <li>Spending too long perfecting early answers; starving later questions.</li>
          <li>Skipping easy definition marks because they look “too simple.”</li>
          <li>Not leaving a 5‑minute end buffer for quick gains and obvious fixes.</li>
        </ul>

        <h2>Build exam stamina</h2>
        <p>
          Once a fortnight, simulate a longer session (45–60 minutes) to practice focus and pacing. Use
          interleaved topics to mirror real papers and condition the switch‑cost of changing contexts.
        </p>

        <h2>Template: 30‑mark timed set</h2>
        <ul>
          <li>Q1: Definitions/short items (6–8 marks) — secure these in ~6–7 minutes.</li>
          <li>Q2: Data/diagram or structured response (10–12 marks) — outline then write, 12–13 minutes.</li>
          <li>Q3: Extended response (10 marks) — thesis, 2–3 arguments with evidence, conclusion, 10 minutes.</li>
        </ul>

        <h2>FAQ</h2>
        <p><strong>Should I read the whole paper first?</strong> Yes, spend the first 5 minutes scanning. Identify the "easy wins" to build confidence and momentum before tackling the hard questions.</p>
        <p><strong>What if I panic?</strong> It happens. Use the "Box Breathing" technique: Inhale for 4s, Hold for 4s, Exhale for 4s, Hold for 4s. It resets your nervous system.</p>
        <p><strong>How do I speed up?</strong> Practice with a timer set to 90% of the actual time. If a paper is 60 minutes, practice doing it in 54 minutes.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/paper-maker" className="neu-button">Generate a timed set</Link>
          <Link to="/answer-reviewer" className="neu-button">Check against rubric</Link>
          <Link to="/planner" className="neu-button">Schedule rehearsal</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Dunlosky et al. (2013): Improving Students’ Learning with Effective Learning Techniques.</li>
          <li>Beilock, S. (2010): Choke: What the Secrets of the Brain Reveal About Getting It Right When You Have To.</li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: Reviewed for clarity and usefulness. If you spot a discrepancy with your board’s guidance,
          use your board’s mark scheme as the source of truth.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall & Spaced Repetition</Link></li>
          <li><Link to="/resources/ib-math-aa-ai-guide">IB Math AA & AI Guide</Link></li>
          <li><Link to="/resources/ai-study-planner">AI Study Planner</Link></li>
        </ul>
      </Article>
    </>
  );
}
