import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function AIChatbotTutorGuide() {
  return (
    <>
      <SEO
        title="Using Apex for study help — Socratic AI | VertexED"
        description="How to use VertexED's Apex chat for explanations, rubric feedback, and exam technique — without outsourcing answers you can't reproduce in the hall."
        canonical="https://www.vertexed.app/resources/ai-chatbot-tutor"
        keywords="Apex, study chatbot, Socratic tutoring, IB help, IGCSE revision, AP exam prep, mark scheme feedback, VertexED, exam technique, active recall"
      />
      <Article
        title="Using Apex: Socratic help instead of copy-paste answers"
        subtitle="Apex is built to ask what you've tried, walk through reasoning, and stress-test essays against rubrics — not to finish homework for you."
        kicker="Guides"
      >
        <p className="lead">
          Generic chatbots default to giving you the answer.{" "}
          <Link to="/chatbot">Apex</Link> is tuned for revision: it asks about your attempt first,
          breaks problems into steps, and respects command words when you mention your board (IB, IGCSE, AP, and others).
          The quality of the session depends on how specific your question is.
        </p>

        <h2>The "Socratic" Method: Don't Ask for Answers</h2>
        <p>
          If you ask "What is the answer to 2x + 5 = 15?", you learn nothing.
          <br />
          Instead, force the AI to teach you.
        </p>
        <div className="article-callout border-l-4 border-blue-500 my-4">
          <strong>The Golden Prompt:</strong> "I am trying to solve [Problem]. I think the first step is [Your Idea], but I am stuck. Don't give me the answer. Instead, ask me a guiding question to help me figure out the next step myself."
        </div>
        <p>
          <em>Why this works:</em> It forces active recall. You are doing the thinking; the AI is just the guardrail.
        </p>

        <h2>Roleplay: The Secret Weapon</h2>
        <p>
          Context is everything. You can tell the AI <em>who</em> to be.
        </p>

        <h3>1. The "Strict Examiner"</h3>
        <p>
          <em>"Act as a strict IB History examiner. I am going to paste my introduction paragraph. Critique it ruthlessly. Tell me exactly why it would fail to get full marks in Criterion A."</em>
        </p>

        <h3>2. The "5-Year-Old" Explainer</h3>
        <p>
          <em>"I don't understand Quantum Superposition. Explain it to me like I am 5 years old. Use an analogy involving ice cream."</em>
        </p>

        <h3>3. The "Debate Opponent"</h3>
        <p>
          <em>"I believe that Macbeth is a tragic hero. Argue against me. Prove that he is actually a villain with no redeeming qualities."</em>
        </p>

        <h2>Subject-Specific Workflows</h2>

        <h3>Math & Science: The "Error Check"</h3>
        <p>
          You solved the problem, but the answer key says you're wrong. You can't find the mistake.
          <br />
          <strong>Action:</strong> Take a photo of your handwritten working. Upload it to the Chatbot.
          <br />
          <strong>Prompt:</strong> "Here is my working for this calculus problem. I got the wrong answer. Can you spot the specific line where I made an algebraic error?"
        </p>

        <h3>Languages: The "Conversation Partner"</h3>
        <p>
          You need to practice French, but you have no one to talk to.
          <br />
          <strong>Prompt:</strong> "Let's have a conversation in French about my summer holidays. Correct my grammar after every response, but keep the conversation going naturally."
        </p>

        <h3>Computer Science: The "Code Reviewer"</h3>
        <p>
          Your code runs, but it's messy.
          <br />
          <strong>Prompt:</strong> "Here is my Python code for a bubble sort. It works, but how can I make it more efficient? Explain Big O notation in the context of my specific code."
        </p>

        <h2>The "Feynman Technique" Loop</h2>
        <p>
          The best way to learn is to teach.
        </p>
        <ol>
          <li><strong>Step 1:</strong> Learn a topic (e.g., The Krebs Cycle).</li>
          <li><strong>Step 2:</strong> Open the Chatbot.</li>
          <li><strong>Step 3:</strong> "I am going to explain the Krebs Cycle to you. If I say anything wrong or miss a key detail, stop me and correct me."</li>
          <li><strong>Step 4:</strong> Type out your explanation.</li>
        </ol>

        <h2>FAQ</h2>
        <p><strong>Is the chatbot available offline?</strong> No, the AI models run in the cloud to ensure they are always up-to-date and powerful enough to handle complex queries.</p>
        <p><strong>Can it solve image-based problems?</strong> Yes, you can upload photos of diagrams, graphs, or handwritten equations, and the AI will analyze them.</p>
        <p><strong>Does it know the 2025 syllabus changes?</strong> Yes, VertexED's knowledge base is regularly updated to reflect the latest curriculum changes for IB, IGCSE, and AP.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Start Chatting</Link>
          <Link to="/notetaker" className="neu-button">Upload Notes</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Chi, M. T. H. et al. (2001): Learning from Human Tutoring — the effectiveness of Socratic dialogue.</li>
          <li>Sal Khan (2023): Harnessing AI for Education (TED Talk) — the potential of AI as a personalized tutor.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/ib-math-aa-ai-guide">IB Math AA & AI Guide</Link></li>
          <li><Link to="/resources/igcse-science-revision">IGCSE Science Revision</Link></li>
        </ul>

        <h2>Bottom line</h2>
        <p>
          Apex works when you treat it like office hours — bring your attempt, accept questions before answers, and retry without AI afterward.
          Generic prompts get generic replies; specific attempts get mark-scheme-aware help.
        </p>
      </Article>
    </>
  );
}
