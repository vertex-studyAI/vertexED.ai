import SEO from "@/components/SEO";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import Article from "@/components/Article";
import { Link } from "react-router";

export default function AIStudyPlannerArticle() {
  const canonical = "https://www.vertexed.app/resources/ai-study-planner";
  return (
    <>
      <SEO
        title="AI study planner and revision timetable | VertexED"
        description="Build a realistic study planner and revision timetable around exams, school, sport, sleep, and weak topics. Turn tasks into focused study sessions."
        keywords="AI study planner, study planner, revision timetable, study schedule maker, exam revision planner, student calendar"
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
          A useful revision plan says what you will do, when you will do it, and how long it should take.
          VertexED gives you an editable calendar for that work and can suggest study tasks from your profile and saved study signals.
        </p>

        <h2>Key capabilities</h2>
        <ul>
          <li>Create, edit, move, and complete study tasks on a calendar.</li>
          <li>Request AI suggestions, then keep, edit, or discard each result.</li>
          <li>Open the <Link to="/study-zone">Study Zone</Link> when a task needs a focused timer block.</li>
          <li>Keep planner work tied to your account, with a device fallback if cloud sync is unavailable.</li>
        </ul>

        <h2>Workflow</h2>
        <ol>
          <li>Add the task, date, start time, and duration.</li>
          <li>Use suggestions when you need ideas for what to schedule.</li>
          <li>Review the week yourself and move anything that does not fit.</li>
        </ol>

        <h2>Design principles</h2>
        <ul>
          <li><strong>Short blocks win.</strong> 20–40 minute sessions reduce switching cost and sustain focus.</li>
          <li><strong>Interleaving.</strong> Rotate topics (e.g., Math → Biology → Language) to strengthen recall.</li>
          <li><strong>Recovery.</strong> Planned breaks prevent over‑optimistic schedules that fail by day 2.</li>
        </ul>

        <h2>Feature deep dive</h2>
        <h3>Editable scheduling</h3>
        <p>
          The calendar gives every task a visible time and duration. Suggestions are drafts, not automatic decisions:
          you remain responsible for checking clashes with school, sleep, travel, sport, and other commitments.
        </p>
        <h3>Priority and urgency</h3>
        <p>
          Suggestions can use your exam date, subjects, and verified weak-topic evidence. Those signals help choose
          a reasonable next task, but they do not estimate how many marks a session will add.
        </p>
        <h3>Micro‑reviews</h3>
        <p>
          Flashcard timing lives in Study Mode, where your rating determines the next due date. Add a planner task
          when you want a protected calendar block for that review.
        </p>

        <h2>Plan a real study week</h2>
        <p>
          Suppose you have an IGCSE Physics quiz Friday and an IB History essay outline Monday.
          In VertexED:
        </p>
        <ol>
          <li>Add “IGCSE Physics — Waves recap” due Fri; set intensity to “standard”.</li>
          <li>Add “IB History — Essay outline (Cold War)” due Mon; intensity “deep”.</li>
          <li>Check school and sport in your own calendar, then keep the evenings you can actually use.</li>
          <li>Add four sessions: two short Physics blocks, one History reading, and one outline.</li>
        </ol>
        <p>Add a ten-minute Thursday review if you want the Physics material fresh before Friday.</p>

        <h2>Examples by subject</h2>
        <ul>
          <li><strong>Math:</strong> Two problem‑solving blocks + one mixed review; interleave algebra and geometry.</li>
          <li><strong>Sciences:</strong> One concept block + one data/graphing block; end week with a short paper set.</li>
          <li><strong>Humanities:</strong> Reading + outline + timed paragraph; add a Sunday synthesis micro‑review.</li>
        </ul>

        <h2>From plan to action</h2>
        <p>
          Start each session from the dashboard. The Study Zone provides a focus timer and quick logs; when you finish,
          log what you covered, then return to the planner and adjust future blocks if the estimate was wrong.
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
          <li><strong>Only content, no recall:</strong> Convert notes to <Link to="/notetaker">flashcards or a quiz</Link>.</li>
          <li><strong>Ignoring weak topics:</strong> Add a retry block after you verify a weak result.</li>
        </ul>

        <h2>FAQ</h2>
        <p><strong>Does it sync with Google Calendar?</strong> No two-way calendar sync is available in the current beta. Keep important commitments in your main calendar as well.</p>
        <p><strong>What if I miss a day?</strong> Move the task to a realistic time or delete it. VertexED does not silently rebuild your week.</p>
        <p><strong>How does it know what I need to study?</strong> Suggestions can use your exam date, profile, due reviews, and verified weak-topic evidence. You decide whether the result makes sense.</p>

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
          <div className="mt-1">Product walkthrough checked: 6 September 2026 · VertexED Team</div>
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
