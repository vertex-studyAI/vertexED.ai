import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function EssayWritingGuide() {
  return (
    <>
      <SEO
        title="Mastering Essay Writing with AI: History, English & Psychology | VertexED"
        description="Learn how to write A-grade essays for IB, A-Level, and AP Humanities. Use AI to structure arguments, refine thesis statements, and check evidence."
        canonical="https://www.vertexed.app/resources/essay-writing-with-ai"
        keywords="essay writing AI, IB History essay, English Literature essay, Psychology essay, A-Level essay tips, thesis statement generator, essay structure, PEEL paragraph, essay feedback AI, VertexED, humanities study guide, academic writing"
      />
      <Article
        title="Mastering Essay Writing with AI: History, English & Psychology"
        subtitle="Writing the perfect essay is an art. AI can be your muse, your editor, and your critic—helping you structure arguments that score top marks."
        kicker="Humanities"
      >
        <p className="lead">
          In subjects like History, English Literature, and Psychology, the essay is king. 
          The difference between a B and an A* isn't usually knowledge—it's <em>argument</em>. 
          Most students "dump facts." Top students "construct arguments." Here is how to use AI to bridge that gap.
        </p>

        <h2>Phase 1: The Thesis Statement (The Anchor)</h2>
        <p>
          Your thesis is the most important sentence in your essay. It must be debatable, specific, and answer the "So What?" question.
        </p>
        <p>
          <strong>The AI Brainstorm:</strong> Don't ask AI to write your thesis. Ask it to challenge your assumptions.
        </p>
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-purple-500 my-4">
          <strong>Prompt:</strong> "I am writing an essay on [Topic]. My initial stance is [Your Opinion]. Play the role of a Devil's Advocate and give me 3 strong counter-arguments against my position."
        </div>
        <p>
          <em>Why this works:</em> By seeing the counter-arguments, you can refine your thesis to be more nuanced (e.g., "While X is true, Y is more significant because...").
        </p>

        <h2>Phase 2: Structuring with PEEL / PETAL</h2>
        <p>
          Great paragraphs follow a structure.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>P</strong>oint: What is the argument of this paragraph?</li>
          <li><strong>E</strong>vidence: The quote, date, or statistic.</li>
          <li><strong>E</strong>xplanation/<strong>A</strong>nalysis: How does the evidence prove the point?</li>
          <li><strong>L</strong>ink: Connect it back to the thesis.</li>
        </ul>
        <p>
          <strong>The AI Check:</strong> Paste a paragraph into the <Link to="/chatbot">Chatbot</Link>.
          <br /><em>"Analyze this paragraph. Does it follow the PEEL structure? Specifically, is the 'Link' back to the question clear and explicit?"</em>
        </p>

        <h2>Phase 3: Subject-Specific Strategies</h2>

        <h3>History: Historiography & Perspectives</h3>
        <p>
          You need to show that history is a debate, not a fixed story.
          <br /><strong>Prompt:</strong> "What are the main historiographical schools of thought regarding the causes of WWI? Give me one Orthodox, one Revisionist, and one Post-Revisionist viewpoint."
        </p>

        <h3>English Literature: The "Zoom In"</h3>
        <p>
          Don't just say "The author uses a metaphor." Analyze the <em>effect</em>.
          <br /><strong>Prompt:</strong> "I am analyzing the quote '[Quote]'. What are the connotations of the word '[Word]' in this context? How does it shape the reader's mood?"
        </p>

        <h3>Psychology: Critical Evaluation</h3>
        <p>
          Use the GRAVE or GRENADE frameworks (Generalizability, Reliability, Application, Validity, Ethics).
          <br /><strong>Prompt:</strong> "Evaluate Milgram's study on obedience using the GRAVE framework. Focus on ethical issues and ecological validity."
        </p>

        <h2>Phase 4: The "Red Pen" Simulation</h2>
        <p>
          You've written the essay. Now you need a harsh critic.
        </p>
        <p>
          <strong>The Strategy:</strong> Upload your essay to <Link to="/answer-reviewer">Answer Reviewer</Link>.
        </p>
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-red-500 my-4">
          <strong>Prompt:</strong> "Grade this essay based on the [IB/A-Level] rubric. Be harsh. Identify 3 places where my analysis is superficial and suggest how I could deepen it."
        </div>

        <h2>Ethical Warning</h2>
        <p className="bg-red-900/20 p-4 rounded border border-red-500/50 text-red-200">
          <strong>Do not ask AI to write your essay.</strong>
          <br />
          1. It is plagiarism.
          <br />
          2. AI writing is often bland and lacks the "voice" examiners look for.
          <br />
          3. You won't learn how to think.
          <br />
          Use AI as a coach, not a player.
        </p>

        <h2>FAQ</h2>
        <p><strong>Can AI check my citations?</strong> Yes, it can format them (e.g., "Format this in MLA 9"), but always verify the source exists. AI can sometimes hallucinate book titles.</p>
        <p><strong>Will Turnitin detect this?</strong> If you copy-paste AI output, yes. If you use AI for feedback and write the essay yourself, no. VertexED is designed to help you write, not write for you.</p>
        <p><strong>How do I improve my vocabulary?</strong> Ask the AI for "academic synonyms." For example, "Give me 5 academic alternatives to the word 'shows' in an analytical context."</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Brainstorm Thesis</Link>
          <Link to="/answer-reviewer" className="neu-button">Grade My Essay</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Purdue OWL: Academic Writing and Citation Guide — the gold standard for formatting.</li>
          <li>Turnitin (2023): AI Writing Detection Capabilities — understanding the limits of AI detection.</li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/ai-answer-reviewer">AI Answer Reviewer Guide</Link></li>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/alevel-ap-exam-prep">A-Level & AP Exam Prep</Link></li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          Writing is a craft. VertexED gives you the tools to refine that craft, ensuring every sentence you write earns its place on the page.
        </p>
      </Article>
    </>
  );
}
