import SEO from "@/components/SEO";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function AIAnswerReviewerArticle() {
  const canonical = "https://www.vertexed.app/resources/ai-answer-reviewer";
  return (
    <>
      <SEO
        title="AI Answer Reviewer · Teacher‑Style Feedback | VertexED"
        description="See how the VertexED Answer Reviewer scores answers using rubric cues, suggests marks, and explains targeted improvements with clear, actionable advice."
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "AI Answer Reviewer — How It Helps",
          datePublished: "2025-10-11",
          dateModified: "2025-10-11",
          author: { "@type": "Organization", name: "VertexED" },
          publisher: { "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app" },
          mainEntityOfPage: canonical,
          about: [
            { "@type": "Thing", name: "Rubrics" },
            { "@type": "Thing", name: "Formative feedback" }
          ]
        }}
      />
  <BreadcrumbsJsonLd />
      <Article title="AI Answer Reviewer" subtitle="Teacher‑style feedback that mirrors rubric language — powered by VertexED." kicker="Guides">
        <p>
          Paste a question and your response; the VertexED Answer Reviewer provides strict, teacher‑style
          feedback, explains what’s missing, and suggests a mark. It mirrors rubric language so you learn to
          think like an examiner.
        </p>

        <h2>When to use it</h2>
        <ul>
          <li>Before submitting an assignment to catch easy points.</li>
          <li>After practice papers to understand where marks are lost.</li>
        </ul>

        <h2>How it works (at a glance)</h2>
        <ol>
          <li>Provide question, board/grade, and your response.</li>
          <li>Reviewer maps your answer to likely rubric criteria.</li>
          <li>It highlights missing or weak elements and suggests improvements.</li>
          <li>Optionally, it estimates a plausible mark band or score.</li>
        </ol>

        <h2>Pro tips</h2>
        <ul>
          <li>Include the board/grade so feedback matches expected rubric depth.</li>
          <li>Ask for “next‑step prompts” you can practice immediately.</li>
        </ul>

        <h2>Example (History short response)</h2>
        <p>
          If the command term is “Evaluate”, the Reviewer will look for criteria and a justified judgment—not just
          description. Missing either piece leads to targeted suggestions such as “State criteria explicitly, then weigh
          evidence before concluding.”
        </p>

        <h2>Turn feedback into progress</h2>
        <ol>
          <li>Generate a paper in <Link to="/paper-maker">Paper Maker</Link> or attempt a past paper.</li>
          <li>Paste one answer into Answer Reviewer; note the missing elements.</li>
          <li>Create 3 flashcards from the missing points using the <Link to="/notetaker">Notetaker</Link>.</li>
          <li>Send a 5‑minute micro‑review to the <Link to="/planner">Planner</Link>.</li>
        </ol>

        <h2>Best practices</h2>
        <ul>
          <li>Use concise answers first; iterate after feedback to avoid anchoring.</li>
          <li>Paste only the relevant part when items are multi‑part; review each separately.</li>
          <li>Alternate subjects to train transfer and reduce overfitting to one paper style.</li>
        </ul>

        <h2>FAQ</h2>
        <p><strong>Is the mark final?</strong> Treat it as a guidance band; use it to spot missing elements quickly.</p>
        <p><strong>Can I supply a rubric?</strong> Yes—paste criteria or describe expectations for even tighter alignment.</p>
        <p><strong>What about bias?</strong> Provide board/grade/context to reduce ambiguity; always sanity‑check feedback.</p>

        <div className="not-prose mt-8 flex gap-3">
          <Link to="/answer-reviewer" className="neu-button">Try Answer Reviewer</Link>
          <Link to="/paper-maker" className="neu-button">Make a Paper</Link>
          <Link to="/planner" className="neu-button">Schedule a Review Loop</Link>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/ib-igcse-paper-maker">IB/IGCSE Paper Maker</Link></li>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
          <li><Link to="/resources/notes-to-flashcards">From Notes to Flashcards</Link></li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Transparency: Feedback is guidance, not a final grade. Always compare against your official rubric/mark scheme.
          <div className="mt-1">Last updated: 2025‑10‑11 · Author: VertexED Team</div>
        </div>
      </Article>
    </>
  );
}
