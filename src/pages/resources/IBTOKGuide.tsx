import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function IBTOKGuide() {
  return (
    <>
      <SEO
        title="Using AI for IB TOK: Essays & Exhibitions (2025 Guide) | VertexED"
        description="Struggling with Theory of Knowledge? Learn how to use AI to brainstorm Real Life Situations (RLS), develop Knowledge Questions, and explore AOKs/WOKs."
        canonical="https://www.vertexed.app/resources/ib-tok-guide-ai"
        keywords="IB TOK, Theory of Knowledge, TOK Essay AI, TOK Exhibition AI, Real Life Situations RLS, Knowledge Questions, Areas of Knowledge, Ways of Knowing, IB Diploma, VertexED"
      />
      <Article
        title="Using AI for IB TOK: Essays & Exhibitions"
        subtitle="Theory of Knowledge is the most abstract part of the IB. AI is the perfect tool to ground your philosophical thoughts in real-world examples."
        kicker="IB Diploma"
      >
        <p className="lead">
          TOK (Theory of Knowledge) is often the most hated and loved part of the IB. 
          It requires you to think about <em>how</em> we know what we know. 
          The hardest part? Finding good "Real Life Situations" (RLS) and connecting them to abstract "Knowledge Questions" (KQ). 
          This is where AI shines.
        </p>

        <h2>The TOK Exhibition: Finding Objects</h2>
        <p>
          You need 3 objects that connect to one IA prompt (e.g., "To what extent is certainty attainable?").
        </p>
        <p>
          <strong>The AI Brainstorm:</strong>
          <br /><em>"I have chosen the prompt 'To what extent is certainty attainable?'. I am interested in Physics and History. Suggest 5 specific, tangible objects (not generic concepts) that could represent this prompt in these fields."</em>
        </p>
        <p>
          <strong>Example Output:</strong> "Heisenberg's original 1927 paper on Uncertainty" (Physics) vs. "A propaganda poster from 1940 claiming victory" (History - false certainty).
        </p>

        <h2>The TOK Essay: Counter-Claims & Perspectives</h2>
        <p>
          A good TOK essay needs nuance. You need to argue $A$, then argue $Not A$, then synthesize.
        </p>
        <h3>Workflow:</h3>
        <ol>
          <li><strong>Decode the Title:</strong> Paste the prescribed title into the <Link to="/chatbot">Chatbot</Link>. <em>"Explain what this title is asking in simple terms. What are the key terms and ambiguities?"</em></li>
          <li><strong>Generate RLS:</strong> <em>"Give me a Real Life Situation from the Natural Sciences in the last 5 years that challenges the idea that scientific knowledge is permanent."</em></li>
          <li><strong>Develop Counter-Claims:</strong> <em>"I am arguing that emotion is an obstacle to knowledge in History. Give me a counter-claim: when is emotion actually essential for historical understanding?"</em></li>
        </ol>

        <h2>The "Areas of Knowledge" (AOK) Cheat Sheet</h2>
        <p>
          Use AI to understand the methodology of each AOK.
        </p>
        <ul>
          <li><strong>Mathematics:</strong> Axiomatic deductive reasoning. (Ask AI: "How is truth proven in Math vs. Science?")</li>
          <li><strong>History:</strong> Evidence selection and interpretation. (Ask AI: "How does a historian's bias affect the selection of sources?")</li>
          <li><strong>The Arts:</strong> Subjective experience and communication.</li>
        </ul>

        <h2>Warning: The "AI Voice" in TOK</h2>
        <p>
          TOK examiners hate generic, flowery language. AI loves generic, flowery language.
          <br /><strong>Do not</strong> let AI write your essay. It will sound like a Wikipedia article, not a TOK analysis. 
          Use AI to find the <em>examples</em>, but do the <em>linking</em> yourself.
        </p>

        <h2>FAQ</h2>
        <p><strong>Can I use AI examples?</strong> Yes, but verify them. AI might invent a "study" or a "historical event." Always Google the RLS to ensure it actually happened.</p>
        <p><strong>What if my RLS is too common?</strong> Ask the AI for "niche" or "under-represented" examples. Avoid the standard ones like "Flat Earth Theory" or "The Mandela Effect."</p>
        <p><strong>How do I structure the essay?</strong> Use the standard structure: Intro, Body 1 (Claim + Counter + Mini-Conclusion), Body 2 (Claim + Counter + Mini-Conclusion), Conclusion. Ask AI to check your flow.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Brainstorm RLS</Link>
          <Link to="/answer-reviewer" className="neu-button">Critique Essay Structure</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>IBO (2022): Theory of Knowledge Guide (First Assessment 2022).</li>
          <li>Lagemaat, R. (2015): Theory of Knowledge for the IB Diploma.</li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: TOK is subjective. Use AI to broaden your perspective, not to narrow it.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/essay-writing-with-ai">Mastering Essay Writing with AI</Link></li>
          <li><Link to="/resources/ib-math-aa-ai-guide">IB Math AA & AI Guide</Link></li>
          <li><Link to="/resources/is-using-ai-cheating">Is Using AI Cheating?</Link></li>
        </ul>
      </Article>
    </>
  );
}
