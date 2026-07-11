import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function IBMathGuide() {
  return (
    <>
      <SEO
        title="IB Math AA and AI revision guide | VertexED"
        description="Practical revision for Analysis &amp; Approaches and Applications &amp; Interpretation — spiral review, IA planning, Paper 1 non-calculator drills, and GDC working checks."
        canonical="https://www.vertexed.app/resources/ib-math-aa-ai-guide"
        keywords="IB Math AA, IB Math AI, IB Math Analysis and Approaches, IB Math Applications and Interpretation, IB Math HL, IB Math SL, IB Math past papers, IB Math revision, IB Math IA ideas, IB Math exploration, AI for IB Math, VertexED, math practice questions, IB exam prep, International Baccalaureate"
      />
      <Article
        title="IB Math AA and AI: a practical revision guide"
        subtitle="AA vs AI, HL vs SL, spiral review, IA planning, and what examiners expect on each paper."
        kicker="IB Diploma"
      >
        <p className="lead">
          IB Math is one of the heaviest subject groups on the Diploma. Whether you take
          <strong> Analysis &amp; Approaches (AA)</strong> or <strong>Applications &amp; Interpretation (AI)</strong>,
          rereading the textbook will not get you to a 7. You need topic rotation, timed practice, and working
          that matches what mark schemes actually award.
        </p>

        <h2>AA vs AI (and HL vs SL)</h2>
        <p>
          The IB splits math into two courses with different emphases:
        </p>
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div className="article-callout">
            <h3 className="text-xl font-bold text-blue-400 mt-0">Analysis &amp; Approaches (AA)</h3>
            <p className="text-sm text-muted-foreground mb-4">Algebra, calculus, proof</p>
            <ul className="space-y-2 text-sm">
              <li><strong>Focus:</strong> Algebraic methods, calculus, trigonometry, proof.</li>
              <li><strong>Typical path:</strong> Engineering, physics, pure maths, some economics.</li>
              <li><strong>Exam pressure:</strong> Paper 1 is non-calculator — mental maths and manipulation must be solid.</li>
            </ul>
          </div>
          <div className="article-callout">
            <h3 className="text-xl font-bold text-purple-400 mt-0">Applications &amp; Interpretation (AI)</h3>
            <p className="text-sm text-muted-foreground mb-4">Statistics, modelling, technology</p>
            <ul className="space-y-2 text-sm">
              <li><strong>Focus:</strong> Statistics, modelling, graph theory, GDC use.</li>
              <li><strong>Typical path:</strong> Social sciences, biology, business, psychology.</li>
              <li><strong>Exam pressure:</strong> Long word problems and confident GDC setup.</li>
            </ul>
          </div>
        </div>

        <h2>Strategy 1: Spiral revision</h2>
        <p>
          Math is cumulative. Weak algebra undermines calculus. Spiral revision keeps earlier topics warm:
        </p>
        <ol>
          <li><strong>Week 1:</strong> Study Topic 1 (Algebra).</li>
          <li><strong>Week 2:</strong> Study Topic 2 (Functions) + one question from Topic 1.</li>
          <li><strong>Week 3:</strong> Study Topic 3 (Trig) + one question each from Topics 1 and 2.</li>
        </ol>
        <p>
          Use <Link to="/paper-maker">Paper Maker</Link> to generate mixed papers — select IB Math AA or AI and
          tick Algebra, Functions, and Trig. Forcing topic switches mirrors real papers.
        </p>

        <h2>Strategy 2: Internal Assessment (IA)</h2>
        <p>
          The IA is 20% of your grade. It often separates a 6 from a 7.
        </p>
        <h3>Step 1: The idea</h3>
        <p>
          Avoid overdone topics like the golden ratio. Use <Link to="/chatbot">Apex</Link> to find a personal angle.
        </p>
        <div className="article-callout border-l-4 border-blue-500 my-4">
          <strong>Prompt:</strong> &ldquo;I am interested in [tennis/architecture/music]. Suggest five IB Math [AA/AI] IA topics linking this to [calculus/statistics]. Briefly outline the maths for each.&rdquo;
        </div>

        <h3>Step 2: Maths rigour check</h3>
        <p>
          Before you write twelve pages, confirm the maths fits SL or HL expectations.
        </p>
        <div className="article-callout border-l-4 border-purple-500 my-4">
          <strong>Prompt:</strong> &ldquo;I plan to model coffee cooling with Newton&apos;s Law of Cooling for Math AA SL. Is this complex enough? What techniques should I include for Criterion E (Use of Mathematics)?&rdquo;
        </div>

        <h2>Strategy 3: Exam technique (Paper 1 vs Paper 2/3)</h2>
        
        <h3>Paper 1 (AA): non-calculator</h3>
        <p>
          Speed matters. You cannot afford to stall on arithmetic.
        </p>
        <ul>
          <li><strong>Tip:</strong> Know your unit circle — $\sin(\pi/3)$ should be instant.</li>
          <li><strong>Drill:</strong> Use <Link to="/notetaker">Notetaker</Link> for quick-fire trig and log rule quizzes.</li>
        </ul>

        <h3>Paper 2 &amp; 3: GDC papers</h3>
        <p>
          In AI (and AA Paper 2), your calculator is essential — but answers alone lose method marks.
        </p>
        <ul>
          <li><strong>Common mistake:</strong> Writing only the GDC output.</li>
          <li><strong>Fix:</strong> Show the mathematical setup (e.g., integral with limits) before the calculator result.</li>
          <li><strong>Check:</strong> Upload working to <Link to="/answer-reviewer">Answer Reviewer</Link>. Ask: &ldquo;Did I earn method marks or only the final answer?&rdquo;</li>
        </ul>

        <h2>Conclusion: pattern recognition over genius</h2>
        <p>
          A 7 is less about raw talent and more about recognising question types. IB papers repeat structures
          with new numbers. Use VertexED to generate variations until the patterns feel familiar.
        </p>

        <h2>FAQ</h2>
        <p><strong>Can I use AI for my IA?</strong> Brainstorming, maths checks, and structural feedback — yes. Writing the IA text — no. That is plagiarism.</p>
        <p><strong>Does VertexED support HL and SL?</strong> Yes — Paper Maker and Apex distinguish Standard and Higher Level content.</p>
        <p><strong>How accurate is the mark scheme generator?</strong> It follows IB-style phrasing and point allocation, but always compare against official mark schemes for calibration.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/paper-maker" className="neu-button">Generate math papers</Link>
          <Link to="/chatbot" className="neu-button">Brainstorm IA topics</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>IBO (2025): Mathematics: Analysis and Approaches Guide.</li>
          <li>IBO (2025): Mathematics: Applications and Interpretation Guide.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/ib-igcse-paper-maker">IB/IGCSE Paper Maker Guide</Link></li>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall &amp; Spaced Repetition</Link></li>
          <li><Link to="/resources/ai-answer-reviewer">AI Answer Reviewer</Link></li>
        </ul>
      </Article>
    </>
  );
}
