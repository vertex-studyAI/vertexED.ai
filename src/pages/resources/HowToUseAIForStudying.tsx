import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function HowToUseAIForStudying() {
  return (
    <>
      <SEO
        title="How to use AI for studying — a revision-week framework | VertexED"
        description="Where AI helps in exam prep — planning, Socratic explanations, mocks, rubric feedback, and flashcards — and where it crosses into work you cannot defend in the hall."
        canonical="https://www.vertexed.app/resources/how-to-use-ai-for-studying"
        keywords="how to use AI for studying, exam prep, Socratic tutoring, rubric feedback, active recall, VertexED"
      />
      <Article
        title="How to use AI for studying without skipping the thinking"
        subtitle="A five-step framework tied to a real revision week — plan, learn, retrieve, practise under time, review against rubrics."
        kicker="Guides"
      >
        <p className="lead">
          &ldquo;Use AI for studying&rdquo; can mean a finished essay you cannot reproduce, or a twenty-minute
          session that clears one gap before tomorrow&apos;s mock. The difference is structure. This guide maps
          AI to the same loop VertexED uses: plan → focus → practise → review → remember.
        </p>

        <h2>The human → AI → human pattern</h2>
        <p>
          Effective use follows three beats:
        </p>
        <ul>
          <li><strong>You start:</strong> Name the topic, state what you already tried, and set a time box (usually 25 minutes).</li>
          <li><strong>AI middle:</strong> Explains, asks a guiding question, generates cards, or critiques a draft against a rubric.</li>
          <li><strong>You finish:</strong> Retry without AI, log what stuck, schedule retrieval — flashcards or a mock question on the same topic.</li>
        </ul>
        <p>
          If you skip the last step, you saved time tonight and lost it on exam day.
        </p>

        <hr className="article-divider" />

        <h2>Step 1: Plan the week (not the semester)</h2>
        <p>
          Decision fatigue hits when the syllabus is a blob and the mock is Thursday. Use the{" "}
          <Link to="/planner">Study Planner</Link> to block:
        </p>
        <ul>
          <li>One timed mock before the real assessment</li>
          <li>Two retrieval slots for due flashcards</li>
          <li>One lighter evening after sport or a long school day</li>
        </ul>
        <p>
          Ask Apex: <em>&ldquo;I have chemistry and history assessments in ten days — suggest a realistic week with 25-minute blocks.&rdquo;</em>
        </p>

        <h2>Step 2: Learn with Socratic help, not answer dumps</h2>
        <p>
          When stuck, use <Link to="/chatbot">Apex</Link> like a tutor who asks first:
        </p>
        <ul className="list-none pl-0 space-y-4">
          <li className="article-callout">
            <strong>Stuck on method:</strong> &ldquo;I tried [your step]. What should I check before the next move? Don&apos;t give the full solution.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Dense definition:</strong> &ldquo;Explain [term] in two sentences, then ask me one question to test if I got it.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Common errors:</strong> &ldquo;What do students usually confuse about [topic] on [board] papers?&rdquo;
          </li>
        </ul>

        <h2>Step 3: Turn material into retrieval</h2>
        <p>
          Paste notes into <Link to="/notetaker">AI Notes</Link> and generate flashcards and a short quiz the same session.
          Passive re-reading trains recognition; exams test recall under time.
        </p>
        <ol>
          <li>Generate notes from a topic or paste your own</li>
          <li>Create cards for definitions, mechanisms, and command-word phrases</li>
          <li>Run the quiz; mark misses honestly</li>
          <li>Let spaced repetition resurface weak cards before you forget</li>
        </ol>

        <h2>Step 4: Practise under time</h2>
        <p>
          Use <Link to="/paper-maker">Paper Maker</Link> for board-shaped mocks — choose topics, marks, and question count.
          Sit the paper in <Link to="/study-zone">Study Zone</Link> with a timer. Phone away. Same posture as the hall.
        </p>

        <h2>Step 5: Review against rubrics</h2>
        <p>
          Upload or paste answers to the <Link to="/answer-reviewer">Answer Reviewer</Link>. Read which marks were earned and lost.
          Book a retry slot in the planner for the gaps it names — structure, evidence, units, command terms.
        </p>
        <p>
          Prompt for follow-up in Apex: <em>&ldquo;The reviewer said I lost analysis marks — what would an 8/8 paragraph include for this question?&rdquo;</em>
        </p>

        <h2>Subject notes</h2>

        <h3>Maths and physics</h3>
        <p>
          Ask for the next step, not the final number. Show your working in the prompt so feedback targets method marks.
        </p>

        <h3>History and English</h3>
        <p>
          Stress-test thesis and evidence: <em>&ldquo;Here is my intro — where is the line of argument weak against the question stem?&rdquo;</em>
        </p>

        <h3>Languages</h3>
        <p>
          Short roleplay for grammar correction works — but follow with a written paragraph you compose yourself.
        </p>

        <h2>FAQ</h2>
        <p><strong>How do I reduce hallucinations?</strong> Verify dates, quotes, and formulas in your textbook. Use AI for explanation and structure, not as a primary source.</p>
        <p><strong>Can AI predict exam questions?</strong> No. It can help you practise command words and topic coverage from past-paper patterns.</p>
        <p><strong>When is prompting a waste of time?</strong> If writing the prompt takes longer than doing one past-paper question, do the question.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/planner" className="neu-button">Open Planner</Link>
          <Link to="/chatbot" className="neu-button">Open Apex</Link>
          <Link to="/answer-reviewer" className="neu-button">Try Answer Reviewer</Link>
        </div>

        <h2 className="mt-10">References</h2>
        <ul>
          <li>Mollick (2023): Assigning AI — human-in-the-loop patterns for students.</li>
          <li>Roediger &amp; Karpicke: Testing effect and retrieval practice.</li>
        </ul>

        <div className="article-footer">
          Cross-check with your syllabus and teacher. AI policies vary by school.
          <div className="mt-1">Last updated: 2025-12-24 · VertexED team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/ai-study-planner">AI Study Planner guide</Link></li>
          <li><Link to="/resources/essay-writing-with-ai">Essay writing with AI</Link></li>
          <li><Link to="/resources/is-using-ai-cheating">Is using AI cheating?</Link></li>
        </ul>

        <h2>Bottom line</h2>
        <p>
          AI helps when it closes a loop you would run anyway: plan, explain, retrieve, mock, review.
          If a session does not end with you retrying something without AI, treat it as entertainment, not revision.
        </p>
      </Article>
    </>
  );
}
