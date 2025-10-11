import SEO from "@/components/SEO";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function AIStudyPlannerArticle() {
  const canonical = "https://www.vertexed.app/resources/ai-study-planner";
  return (
    <>
      <SEO
        title="AI Study Planner & Calendar · How It Works | VertexED"
        description="A complete guide to VertexED's AI study planner and calendar: auto-scheduling, spaced retrieval, time‑boxed deep work, and how to plan a real study week."
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
      <Article title="AI Study Planner & Calendar" subtitle="Plan learning, not just tasks — auto‑scheduling, micro‑reviews, and time‑boxed focus with VertexED." kicker="Guides">
        <p>
          Most planners track tasks; VertexED plans learning. It transforms topics into time‑boxed
          sessions, places micro‑reviews before forgetting curves dip, and respects school, sleep, and
          life constraints. The result is a schedule that’s realistic and score‑focused.
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

        <h2>Why VertexED is the solution</h2>
        <ul>
          <li>It plans work you’ll actually do, not a wish list.</li>
          <li>It coordinates notes, flashcards, and quizzes scheduled across your week.</li>
          <li>It ties practice to exams — perfect for /paper-maker and /answer-reviewer flows.</li>
        </ul>

        <h2>Common pitfalls (and fixes)</h2>
        <ul>
          <li><strong>Oversized tasks:</strong> Split into 20–40 minute sessions so they fit real days.</li>
          <li><strong>Only content, no recall:</strong> Convert notes to <Link to="/notetaker">flashcards</Link> and add a <Link to="/study-zone">quiz</Link>.</li>
          <li><strong>Ignoring weak topics:</strong> Tag sessions and let the planner rebalance distribution.</li>
        </ul>

        <h2>FAQ</h2>
        <p><strong>How often should I schedule micro‑reviews?</strong> 2–3 per week across subjects is enough—keep them short.</p>
        <p><strong>Can I drag sessions around?</strong> Yes. The planner resolves conflicts and keeps spacing logic intact.</p>
        <p><strong>How do I add exam practice?</strong> Use <Link to="/paper-maker">Paper Maker</Link> for 20–30 mark mini‑sets weekly.</p>

        <div className="not-prose mt-8 flex gap-3">
          <Link to="/planner" className="neu-button">Open Planner</Link>
          <Link to="/study-zone" className="neu-button">Focus Timer</Link>
          <Link to="/notetaker" className="neu-button">Build Flashcards</Link>
          <Link to="/paper-maker" className="neu-button">Practice Papers</Link>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/notes-to-flashcards">From Notes to Flashcards (and Quizzes)</Link></li>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall & Spaced Repetition</Link></li>
        </ul>
      </Article>
    </>
  );
}
