import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function IGCSEScienceGuide() {
  return (
    <>
      <SEO
        title="IGCSE Sciences revision: Biology, Chemistry, Physics | VertexED"
        description="Mark-scheme keywords, process sequences, mole calculations, and Paper 6 skills — with AI workflows for definitions, mocks, and rubric feedback."
        canonical="https://www.vertexed.app/resources/igcse-science-revision"
        keywords="IGCSE Biology, IGCSE Chemistry, IGCSE Physics, IGCSE revision, IGCSE past papers, Cambridge IGCSE, Edexcel IGCSE, science revision notes, active recall science, IGCSE exam tips, VertexED"
      />
      <Article
        title="IGCSE Sciences revision: Biology, Chemistry, and Physics"
        subtitle="Content-heavy syllabuses — but marks often hinge on exact keywords, sequences, and shown working."
        kicker="IGCSE / O-Level"
      >
        <p className="lead">
          IGCSE Sciences (Cambridge 0610/0620/0625 or Edexcel) pack a lot of content into two years.
          Examiners mark against specific wording — a clear explanation of osmosis without
          &ldquo;partially permeable membrane&rdquo; can score zero. Revision means learning mark-scheme
          definitions, practising processes in order, and drilling calculations under time.
        </p>

        <h2>The mark-scheme mindset</h2>
        <p>
          Summarizing the textbook in your own words feels productive. For IGCSE sciences, examiner-preferred
          phrasing is what earns marks.
        </p>
        <p>
          <strong>Workflow:</strong> Use <Link to="/notetaker">VertexED Notetaker</Link> to extract mark-scheme definitions.
        </p>
        <div className="article-callout border-l-4 border-green-500 my-4">
          <strong>Prompt:</strong> &ldquo;List exact IGCSE definitions for: Diffusion, Osmosis, Active Transport, Enzymes, Photosynthesis. Bold the mandatory keywords.&rdquo;
        </div>

        <hr className="article-divider" />

        <h2>Biology (0610): processes and flowcharts</h2>
        <p>
          Biology rewards sequences — eutrophication, natural selection, reflex arcs. Learn them as ordered steps.
        </p>
        <h3>Six-mark process questions</h3>
        <p>
          Turn processes into bullet chains:
          <br /><em>&ldquo;Explain eutrophication as a six-step list suitable for a six-mark IGCSE answer.&rdquo;</em>
        </p>
        <p>
          <strong>High-yield topics:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Human nutrition (enzymes and digestion)</li>
          <li>Plant nutrition (photosynthesis and leaf structure)</li>
          <li>Transport in plants (xylem and phloem)</li>
        </ul>

        <h2>Chemistry (0620): moles and organic patterns</h2>
        <p>
          Two areas catch most students: stoichiometry and organic functional groups.
        </p>
        <h3>1. Stoichiometry</h3>
        <p>
          You cannot memorize your way through mole calculations — you have to practise.
          <br /><strong>Action:</strong> <Link to="/paper-maker">Paper Maker</Link> → IGCSE Chemistry → Stoichiometry. Generate a set of calculation questions.
        </p>
        <h3>2. Organic chemistry</h3>
        <p>
          Patterns matter — alkanes, alkenes, alcohols, carboxylic acids.
          <br /><strong>Action:</strong> Ask <Link to="/chatbot">Apex</Link>: &ldquo;Create a table comparing functional group, general formula, and reaction with bromine water for alkanes and alkenes.&rdquo;
        </p>

        <h2>Physics (0625): formulas and Paper 6 skills</h2>
        <p>
          Physics is half calculation, half explaining method.
        </p>
        <h3>Formula fluency</h3>
        <p>
          For every formula ($F=ma$, $V=IR$, $P=IV$), practise rearranging without the formula sheet.
        </p>
        <h3>Alternative to Practical (Paper 6)</h3>
        <p>
          Paper 6 tests practical skills without a lab. Know how to:
        </p>
        <ul>
          <li>Read a meniscus (bottom of the curve).</li>
          <li>Plot graphs (thin lines of best fit).</li>
          <li>Identify independent and dependent variables.</li>
        </ul>
        <p>
          <strong>Practice prompt:</strong> &ldquo;Describe an experiment to investigate how wire length affects resistance. List apparatus, method, and safety precautions.&rdquo;
        </p>

        <h2>A revision loop for IGCSE sciences</h2>
        <ol>
          <li><strong>Learn:</strong> <Link to="/chatbot">Apex</Link> explains a concept — e.g., electrolysis of brine.</li>
          <li><strong>Memorize:</strong> <Link to="/notetaker">Notetaker</Link> builds flashcards for keywords.</li>
          <li><strong>Apply:</strong> <Link to="/paper-maker">Paper Maker</Link> generates a 40-minute topic test.</li>
          <li><strong>Review:</strong> <Link to="/answer-reviewer">Answer Reviewer</Link> flags missing mark-scheme words.</li>
        </ol>

        <h2>FAQ</h2>
        <p><strong>Does this cover Coordinated Sciences?</strong> Yes — specify Coordinated (Double Award) or Separate Sciences (Triple) in your prompt.</p>
        <p><strong>Can it help with practicals?</strong> It cannot run the experiment, but it can generate Paper 6-style questions and data-analysis practice.</p>
        <p><strong>Cambridge or Edexcel?</strong> VertexED supports both — name your board in the prompt for better command-word phrasing.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/notetaker" className="neu-button">Extract keywords</Link>
          <Link to="/paper-maker" className="neu-button">Practice Paper 4</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>Cambridge Assessment International Education (2023): Learner Guide for IGCSE Sciences.</li>
          <li>Hattie, J. (2009): Visible Learning — formative feedback and assessment.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/notes-to-flashcards">From Notes to Flashcards</Link></li>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy &amp; Time Management</Link></li>
          <li><Link to="/resources/automated-note-taking-guide">Automated Note Taking Guide</Link></li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          The syllabus is large, but revision is manageable topic by topic — keywords first, then timed
          practice, then rubric feedback on what you missed. Repeat until the mark-scheme language feels
          automatic.
        </p>
      </Article>
    </>
  );
}
