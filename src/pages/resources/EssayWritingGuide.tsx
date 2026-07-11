import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function EssayWritingGuide() {
  return (
    <>
      <SEO
        title="Essay writing with AI for IB, A-Level, and AP | VertexED"
        description="Use AI to stress-test your thesis, check PEEL structure, and read rubric feedback — without outsourcing the argument you have to defend in the exam hall."
        canonical="https://www.vertexed.app/resources/essay-writing-with-ai"
        keywords="essay writing AI, IB History essay, English Literature essay, Psychology essay, A-Level essay tips, thesis statement, essay structure, PEEL paragraph, essay feedback AI, VertexED, humanities study guide, academic writing"
      />
      <Article
        title="Essay writing with AI for History, English, and Psychology"
        subtitle="AI works best as editor and examiner — you still build the argument, evidence, and links."
        kicker="Humanities"
      >
        <p className="lead">
          In History, English Literature, and Psychology, the essay carries most of the marks. The gap
          between a B and an A* is rarely missing facts — it is weak argument. Many students list evidence;
          stronger scripts construct a line of reasoning examiners can follow. AI can help you test structure
          and rubric depth if you keep doing the writing.
        </p>

        <h2>Phase 1: The thesis statement</h2>
        <p>
          Your thesis is the anchor. It must be debatable, specific, and answer the &ldquo;so what?&rdquo;
        </p>
        <p>
          <strong>Use AI to challenge you, not to draft for you:</strong>
        </p>
        <div className="article-callout border-l-4 border-purple-500 my-4">
          <strong>Prompt:</strong> &ldquo;I am writing an essay on [topic]. My initial stance is [your opinion]. Play devil&apos;s advocate and give me three strong counter-arguments.&rdquo;
        </div>
        <p>
          <em>Why this works:</em> Seeing counter-arguments early lets you refine a nuanced thesis — e.g.,
          &ldquo;While X is true, Y is more significant because&hellip;&rdquo;
        </p>

        <h2>Phase 2: Structuring with PEEL / PETAL</h2>
        <p>
          Strong paragraphs follow a pattern:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>P</strong>oint: What is this paragraph arguing?</li>
          <li><strong>E</strong>vidence: Quote, date, or statistic.</li>
          <li><strong>E</strong>xplanation / <strong>A</strong>nalysis: How does the evidence prove the point?</li>
          <li><strong>L</strong>ink: Tie back to the thesis and question.</li>
        </ul>
        <p>
          <strong>Check with AI:</strong> Paste a paragraph into <Link to="/chatbot">Apex</Link>.
          <br /><em>&ldquo;Analyze this paragraph. Does it follow PEEL? Is the link back to the question explicit?&rdquo;</em>
        </p>

        <h2>Phase 3: Subject-specific strategies</h2>

        <h3>History: historiography and perspectives</h3>
        <p>
          Show that history is debated, not fixed.
          <br /><strong>Prompt:</strong> &ldquo;What are the main historiographical schools on the causes of WWI? Give one Orthodox, one Revisionist, and one Post-Revisionist view.&rdquo;
        </p>

        <h3>English Literature: zoom in on language</h3>
        <p>
          Do not stop at &ldquo;the author uses a metaphor.&rdquo; Analyze the effect.
          <br /><strong>Prompt:</strong> &ldquo;I am analyzing &lsquo;[quote]&rsquo;. What are the connotations of &lsquo;[word]&rsquo; here? How does it shape the reader&apos;s mood?&rdquo;
        </p>

        <h3>Psychology: critical evaluation</h3>
        <p>
          Use GRAVE or GRENADE (Generalizability, Reliability, Application, Validity, Ethics).
          <br /><strong>Prompt:</strong> &ldquo;Evaluate Milgram&apos;s obedience study using GRAVE. Focus on ethics and ecological validity.&rdquo;
        </p>

        <h2>Phase 4: Rubric feedback before you submit</h2>
        <p>
          Once you have a draft, you need examiner-style critique — not praise.
        </p>
        <p>
          Upload to <Link to="/answer-reviewer">Answer Reviewer</Link>:
        </p>
        <div className="article-callout border-l-4 border-red-500 my-4">
          <strong>Prompt:</strong> &ldquo;Grade this essay against the [IB/A-Level] rubric. Name three places where my analysis is superficial and how to deepen each.&rdquo;
        </div>

        <h2>Ethical warning</h2>
        <p className="bg-red-900/20 p-4 rounded border border-red-500/50 text-red-200">
          <strong>Do not ask AI to write your essay.</strong>
          <br />
          1. It is plagiarism.
          <br />
          2. AI prose is often flat — examiners notice missing voice.
          <br />
          3. You will not learn to think under time pressure.
          <br />
          Use AI as coach, not author.
        </p>

        <h2>FAQ</h2>
        <p><strong>Can AI check my citations?</strong> It can format them (e.g., &ldquo;Format this in MLA 9&rdquo;), but verify every source exists. AI can invent book titles.</p>
        <p><strong>Will Turnitin detect this?</strong> Copy-pasting AI output, yes. Using AI for feedback while you write yourself, no. VertexED is built for the second case.</p>
        <p><strong>How do I improve vocabulary?</strong> Ask for academic synonyms in context — e.g., &ldquo;Give five alternatives to &lsquo;shows&apos; in analytical writing.&rdquo;</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Stress-test thesis</Link>
          <Link to="/answer-reviewer" className="neu-button">Grade my essay</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>Purdue OWL: Academic Writing and Citation Guide.</li>
          <li>Turnitin (2023): AI Writing Detection Capabilities — limits of detection tools.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/ai-answer-reviewer">AI Answer Reviewer Guide</Link></li>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/alevel-ap-exam-prep">A-Level &amp; AP Exam Prep</Link></li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          Essay writing is a skill you build under feedback loops — thesis, paragraph, rubric, rewrite.
          VertexED gives you the tools to run those loops faster; you still supply the argument.
        </p>
      </Article>
    </>
  );
}
