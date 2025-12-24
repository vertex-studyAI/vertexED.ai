import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function AIChatbotTutorGuide() {
  return (
    <>
      <SEO
        title="Your 24/7 AI Tutor: Homework Help & Exam Prep | VertexED"
        description="Stuck on a problem? VertexED's AI Chatbot is your personal tutor available 24/7. Get instant explanations for IB, IGCSE, and AP subjects."
        canonical="https://www.vertexed.app/resources/ai-chatbot-tutor"
        keywords="AI tutor, homework help AI, math solver AI, physics explainer, IB tutor, IGCSE tutor, AP tutor, chemistry help, biology answers, history essay help, AI for students, free AI tutor, VertexED chatbot, study assistant, exam prep help, homework solver, instant study help"
      />
      <Article
        title="Your 24/7 AI Tutor: How to Turn a Chatbot into a Professor"
        subtitle="Most students use AI like a search engine. Top students use it like a Socratic tutor. Here is the guide to prompt engineering for academic success."
        kicker="Features"
      >
        <p className="lead">
          Private tutoring costs $50-$100 an hour. Teachers go to sleep at night. 
          <Link to="/chatbot">VertexED's AI Chatbot</Link> is free (with your account), awake 24/7, and knows every syllabus from IB Math AA to AP US History. 
          But it is only as smart as the questions you ask it.
        </p>

        <h2>The "Socratic" Method: Don't Ask for Answers</h2>
        <p>
          If you ask "What is the answer to 2x + 5 = 15?", you learn nothing.
          <br />
          Instead, force the AI to teach you.
        </p>
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-blue-500 my-4">
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

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: Reviewed for clarity and usefulness. Always cross‑check with your official syllabus and teacher guidance.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/ib-math-aa-ai-guide">IB Math AA & AI Guide</Link></li>
          <li><Link to="/resources/igcse-science-revision">IGCSE Science Revision</Link></li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          The AI Chatbot isn't a cheat code; it's a force multiplier. It allows you to get personalized, instant feedback that used to require a human tutor. 
          Master the art of the prompt, and you master your education.
        </p>
      </Article>
    </>
  );
}
