import SEO from "@/components/SEO";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function AIStudyPlannerArticle() {
  const canonical = "https://www.vertexed.app/resources/ai-study-planner";
  return (
    <>
      <SEO
        title="AI study planner and calendar — how it works | VertexED"
        description="Plan a realistic revision week — 25-minute blocks, micro-reviews, sport and sleep included — instead of a fantasy timetable you abandon by Wednesday."
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "AI Study Planner & Calendar · How It Works",
          datePublished: "2025-10-11",
          author: { "@type": "Organization", name: "VertexED" },
          mainEntityOfPage: canonical,
          about: [
            { "@type": "Thing", name: "Spaced repetition" },
            { "@type": "Thing", name: "Interleaving" },
            { "@type": "Thing", name: "Timeboxing" }
          ]
        }}
      />
  <BreadcrumbsJsonLd />
      <Article title="AI study planner and calendar" subtitle="Block mocks, retrieval, and focus sessions around real life — not six-hour fantasy study days." kicker="Guides">
        <p className="lead">
          Most planners list tasks. VertexED plans learning: topics become 20–40 minute blocks, micro-reviews
          land before you forget key items, and school hours, sport, and sleep stay in the picture. The goal
          is a week you will actually follow — not a colour-coded wish list.
        </p>

        <h2>Key capabilities</h2>
        <ul>
          <li>Auto‑schedules tasks around fixed events and personal constraints.</li>
          <li>Prioritises sessions by urgency and expected learning impact.</li>
          <li>Integrates with the <Link to="/study-zone">Study Zone</Link> timers for time‑boxing and logs.</li>
          <li>Surfaces micro‑reviews just before forgetting curves kick in.</li>
        </ul>

        <h2>Workflow</h2>
        <ol>
          <li>Create a task with topic, target exam/board, and desired date.</li>
          <li>Pick intensity (light/standard/deep). The planner converts this into session lengths.</li>
          <li>Accept the suggested calendar or drag to rearrange. Conflicts are auto‑resolved.</li>
        </ol>

        <h2>Design principles</h2>
        <ul>
          <li><strong>Short blocks win.</strong> 20–40 minute sessions reduce switching cost and sustain focus.</li>
          <li><strong>Interleaving.</strong> Rotate topics (e.g., Math → Biology → Language) to strengthen recall.</li>
          <li><strong>Recovery.</strong> Planned breaks prevent over‑optimistic schedules that fail by day 2.</li>
        </ul>

        <h2>Feature deep dive</h2>
        <h3>Constraints‑aware scheduling</h3>
        <p>
          Add busy hours, bedtime, preferred session length, and VertexED will only schedule inside realistic
          windows. Conflicts are auto‑resolved and the planner proposes alternatives.
        </p>
        <h3>Priority and urgency</h3>
        <p>
          Sessions are ordered by due date proximity and expected learning impact. Higher‑yield items (exam
          prompts, weak topics, micro‑reviews) float to the top of your day.
        </p>
        <h3>Micro‑reviews</h3>
        <p>
          Tiny 3–10 minute reviews land just before you forget key items, often the night before an assessment.
          They’re short by design so you actually do them.
        </p>

        <h2>Plan a real study week</h2>
        <p>
          Suppose you have an IGCSE Physics quiz Friday and an IB History essay outline Monday.
          In VertexED:
        </p>
        <ol>
          <li>Add “IGCSE Physics — Waves recap” due Fri; set intensity to “standard”.</li>
          <li>Add “IB History — Essay outline (Cold War)” due Mon; intensity “deep”.</li>
          <li>Block school hours and sports practice; set weekday cut‑off at 9pm.</li>
          <li>Let VertexED suggest 4 sessions: two short Physics blocks (Tue/Thu), one History reading (Wed), one outline (Sat).</li>
        </ol>
        <p>The micro‑review for Physics drops on Thu night; a 10‑minute touch keeps the quiz fresh.</p>

        <h2>Examples by subject</h2>
        <ul>
          <li><strong>Math:</strong> Two problem‑solving blocks + one mixed review; interleave algebra and geometry.</li>
          <li><strong>Sciences:</strong> One concept block + one data/graphing block; end week with a short paper set.</li>
          <li><strong>Humanities:</strong> Reading + outline + timed paragraph; add a Sunday synthesis micro‑review.</li>
        </ul>

        <h2>From plan to action</h2>
        <p>
          Start each session from the dashboard. The Study Zone provides a focus timer and quick logs; when you finish,
          VertexED records the duration and nudges the schedule if you ran long or short.
        </p>

        <h2>How it fits a revision week</h2>
        <ul>
          <li>Schedules work you can finish — not overloaded days that collapse by midweek.</li>
          <li>Coordinates notes, flashcards, and quizzes across the same calendar.</li>
          <li>Links to timed practice in <Link to="/paper-maker">Paper Maker</Link> and rubric feedback in <Link to="/answer-reviewer">Answer Reviewer</Link>.</li>
        </ul>

        <h2>Common pitfalls (and fixes)</h2>
        <ul>
          <li><strong>Oversized tasks:</strong> Split into 20–40 minute sessions so they fit real days.</li>
          <li><strong>Only content, no recall:</strong> Convert notes to <Link to="/notetaker">flashcards</Link> and add a <Link to="/study-zone">quiz</Link>.</li>
          <li><strong>Ignoring weak topics:</strong> Tag sessions and let the planner rebalance distribution.</li>
        </ul>

        <h2>FAQ</h2>
        <p><strong>Does it sync with Google Calendar?</strong> We are working on a 2-way sync. For now, you can export your VertexED plan to an `.ics` file to import into Google Calendar or Outlook.</p>
        <p><strong>What if I miss a day?</strong> Life happens. The AI automatically detects missed tasks and prompts you to "Reschedule" them. It will intelligently slot them into future free blocks without overloading you.</p>
        <p><strong>How does it know what I need to study?</strong> It combines your exam date (deadline) with your self-reported confidence levels. Low confidence + near deadline = High Priority.</p>

        <div className="not-prose mt-8 flex gap-3">
          <Link to="/planner" className="neu-button">Open Planner</Link>
          <Link to="/study-zone" className="neu-button">Focus Timer</Link>
          <Link to="/notetaker" className="neu-button">Build Flashcards</Link>
          <Link to="/paper-maker" className="neu-button">Practice Papers</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Ebbinghaus, H. (1885): Memory: A Contribution to Experimental Psychology — the origin of the Forgetting Curve.</li>
          <li>Karpicke, J. D., & Roediger, H. L. (2008): The critical importance of retrieval for learning — why planning for <em>output</em> is better than planning for <em>input</em>.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall & Spaced Repetition</Link></li>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
          <li><Link to="/resources/best-ai-study-tools-2025">Best AI Study Tools 2025</Link></li>
        </ul>
      </Article>
    </>
  );
}
