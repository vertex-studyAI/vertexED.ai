import SEO from "@/components/SEO";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function PaperMakerGuide() {
  const canonical = "https://www.vertexed.app/resources/ib-igcse-paper-maker";
  return (
    <>
      <SEO
        title="IB/IGCSE Paper Maker · Generate Practice Papers | VertexED"
        description="How to create syllabus‑aligned practice papers with VertexED's Paper Maker: topics, difficulty, marks, criteria modes, and exporting PDFs/DOCX."
        canonical={canonical}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "IB/IGCSE Paper Maker — Guide",
          datePublished: "2025-10-11",
          dateModified: "2025-10-11",
          author: { "@type": "Organization", name: "VertexED" },
          publisher: { "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app" },
          mainEntityOfPage: canonical,
          about: [
            { "@type": "Thing", name: "Exam practice" },
            { "@type": "Thing", name: "Mark schemes" },
            { "@type": "Thing", name: "Difficulty calibration" }
          ]
        }}
      />
  <BreadcrumbsJsonLd />
      <Article title="IB/IGCSE Paper Maker" subtitle="Generate realistic, board‑aligned practice papers with VertexED — then export and review." kicker="Guides">
        <p>
          VertexED’s Paper Maker builds realistic, board‑aligned practice papers. Choose your board,
          grade, and subject, add topic tags, and generate questions that read like the real thing. You
          can export to PDF or DOCX for printing or sharing.
        </p>

        <h2>Inputs that matter</h2>
        <ul>
          <li>Board + Grade + Subject (e.g., IGCSE, Grade 10, Physics)</li>
          <li>Topic tags: comma‑separated focus areas</li>
          <li>Difficulty and question count, or rubric components for IB modes</li>
        </ul>

        <h2>Question types and mark schemes</h2>
        <ul>
          <li><strong>Definitions/recall:</strong> Secure easy marks quickly; expect precise wording in sciences.</li>
          <li><strong>Data/graph:</strong> Read axes carefully; justify patterns with mechanisms, not just trends.</li>
          <li><strong>Short structured:</strong> Multi‑part items with progressive difficulty; don’t skip (a).</li>
          <li><strong>Extended response:</strong> Thesis → arguments with evidence → evaluative conclusion.</li>
        </ul>
        <p>
          Align generated questions with typical mark scheme structures. Practise scanning your answer against a
          quick checklist before moving on.
        </p>

        <h2>Tips</h2>
        <ul>
          <li>Start broad (topics) → then regenerate with 2–3 specific tags.</li>
          <li>Mix short answers and extended responses to mimic real mark schemes.</li>
          <li>For IB, try criteria modes (e.g., Paper 1 vs Paper 2) to guide balance and weighting.</li>
        </ul>

        <h2>Tune difficulty sensibly</h2>
        <ul>
          <li><strong>Ramp style:</strong> Begin with one low‑difficulty set to warm up, then increase.</li>
          <li><strong>Target weak topics:</strong> Add 1–2 tags for areas you routinely miss.</li>
          <li><strong>Timed variants:</strong> Re‑generate with tighter mark budgets to simulate pressure.</li>
        </ul>

        <h2>Example set‑ups</h2>
        <ul>
          <li><strong>IGCSE Physics, Grade 10:</strong> Topics = “Waves, Refraction, Total Internal Reflection”; 10 questions; difficulty 2/3.</li>
          <li><strong>IB DP History, Paper 2:</strong> Topic = “Causes of the Cold War”; mix short prompts + one extended response.</li>
        </ul>

        <h2>Weekly workflow</h2>
        <ol>
          <li>Generate a 20–30 mark mini‑set every Friday.</li>
          <li>Attempt under a visible timer. Move on when time is up; don’t polish.</li>
          <li>Paste 1–2 answers into the <Link to="/answer-reviewer">Answer Reviewer</Link> for rubric feedback.</li>
          <li>Create 3 flashcards for missing elements via <Link to="/notetaker">Notetaker</Link>.</li>
          <li>Schedule a micro‑review in the <Link to="/planner">Planner</Link> before the next set.</li>
        </ol>

        <h2>Feedback loop with VertexED</h2>
        <p>
          Generate a paper, attempt it, then paste an answer into the
          <Link to="/answer-reviewer"> Answer Reviewer</Link> for marks and improvement advice. Schedule a rematch in the
          <Link to="/planner"> Planner</Link> to revisit weak areas.
        </p>

        <h2>FAQ</h2>
        <p><strong>How many marks per practice?</strong> 20–30 is ideal for weekly cadence; add a longer run biweekly.</p>
        <p><strong>Should I include diagrams?</strong> Yes—request data/graph items to rehearse interpretation.</p>
        <p><strong>How do I avoid overfitting?</strong> Rotate tags and difficulty; interleave subjects.
        </p>

        <div className="not-prose mt-8 flex gap-3">
          <Link to="/paper-maker" className="neu-button">Try Paper Maker</Link>
          <Link to="/answer-reviewer" className="neu-button">Review Answers</Link>
          <Link to="/planner" className="neu-button">Schedule Next Set</Link>
        </div>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Accuracy note: Use official past papers to calibrate phrasing and mark distributions. VertexED generated items
          are for practice and should be validated against your board’s standards.
          <div className="mt-1">Last updated: 2025‑10‑11 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/ai-answer-reviewer">AI Answer Reviewer</Link></li>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall & Spaced Repetition</Link></li>
        </ul>
      </Article>
    </>
  );
}
