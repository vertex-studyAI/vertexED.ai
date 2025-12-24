import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function BestAIPromptsForStudents() {
  return (
    <>
      <SEO
        title="The 50 Best AI Prompts for Students: Math, Science & Essays | VertexED"
        description="Stop asking basic questions. Here is a curated list of the most powerful ChatGPT/AI prompts for students. Unlock deep explanations, quiz generation, and essay feedback."
        canonical="https://www.vertexed.app/resources/best-ai-prompts-for-students"
        keywords="best AI prompts for students, ChatGPT prompts for studying, prompt engineering for education, math prompts, essay writing prompts, science explanation prompts, VertexED, study hacks"
      />
      <Article
        title="The 50 Best AI Prompts for Students: Math, Science & Essays"
        subtitle="Garbage in, garbage out. The quality of your AI output depends entirely on your prompt. Here is your copy-paste library for academic success."
        kicker="Guides"
      >
        <p className="lead">
          Most students use AI like a search engine ("What is mitochondria?"). 
          Power users use AI like a simulator ("Act as a cell biologist and explain the mitochondria's role in ATP production using a factory analogy").
          Here are the best prompts to level up your study game.
        </p>

        <h2>General Study Prompts</h2>
        <ul className="space-y-4">
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Feynman" Simplifier:</strong> "Explain [Topic] to me as if I were 12 years old. Use simple language and no jargon."
          </li>
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Mental Model" Builder:</strong> "What are the 3 core principles I need to understand to master [Subject]? How do they connect?"
          </li>
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Pareto" Prioritizer:</strong> "I have an exam on [Subject]. What are the 20% of concepts that will likely make up 80% of the marks?"
          </li>
        </ul>

        <h2>Math & Science Prompts</h2>
        <ul className="space-y-4">
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Socratic" Solver:</strong> "I am stuck on this problem: [Insert Problem]. Don't give me the answer. Ask me a question that will help me figure out the first step."
          </li>
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Error Hunter":</strong> "Here is my working for a physics problem. I got the wrong answer. Find my mistake and explain <em>why</em> I made it."
          </li>
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Real World" Connector:</strong> "Give me a real-world engineering application of [Calculus Concept] so I can understand why it matters."
          </li>
        </ul>

        <h2>Essay & Humanities Prompts</h2>
        <ul className="space-y-4">
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Devil's Advocate":</strong> "Here is my thesis statement: [Insert Thesis]. Argue against it. Give me 3 strong counter-arguments."
          </li>
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Rubric" Grader:</strong> "Act as an IB/AP examiner. Grade this paragraph based on the criterion 'Critical Analysis'. Be harsh."
          </li>
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Vocabulary" Upgrader:</strong> "Rewrite this sentence to sound more academic, but keep the meaning exactly the same: [Insert Sentence]."
          </li>
        </ul>

        <h2>Language Learning Prompts</h2>
        <ul className="space-y-4">
          <li className="bg-slate-800/50 p-4 rounded-lg border border-white/5">
            <strong>The "Immersion" Sim:</strong> "Let's roleplay. You are a shopkeeper in Madrid. I am a customer. We will speak only in Spanish. Correct my grammar in brackets after each response."
          </li>
        </ul>

        <h2>How to Engineer Your Own Prompts</h2>
        <p>
          A perfect prompt has 3 parts:
        </p>
        <ol>
          <li><strong>Persona:</strong> "Act as a..." (Professor, Examiner, Tutor).</li>
          <li><strong>Task:</strong> "Explain/Grade/Quiz..."</li>
          <li><strong>Constraint:</strong> "In under 100 words", "Using an analogy", "Strictly following the rubric".</li>
        </ol>

        <h2>FAQ</h2>
        <p><strong>Can I save these prompts?</strong> Yes, keep a "Prompt Library" in your notes app or use VertexED's built-in prompt templates.</p>
        <p><strong>Why does AI sometimes ignore constraints?</strong> Models can be forgetful. If it ignores you, reply with "You forgot the constraint: [Constraint]. Try again."</p>
        <p><strong>Which model is best?</strong> For logic/math, use GPT-4o or Claude 3.5 (available in VertexED). For creative writing, basic models are often sufficient.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Test These Prompts</Link>
          <Link to="/notetaker" className="neu-button">Summarize Notes</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Mollick, E. (2024): Co-Intelligence — the definitive book on working with AI.</li>
          <li>OpenAI (2023): Prompt Engineering Guide.</li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: Prompts are tools. You are the craftsman.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/ai-chatbot-tutor">Your 24/7 AI Tutor</Link></li>
          <li><Link to="/resources/essay-writing-with-ai">Mastering Essay Writing with AI</Link></li>
        </ul>
      </Article>
    </>
  );
}
