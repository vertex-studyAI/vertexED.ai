import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function HowToCramEffectively() {
  return (
    <>
      <SEO
        title="How to Cram Effectively (When You Have No Time Left) | VertexED"
        description="Exam tomorrow? Don't panic. Here is a science-backed guide to emergency studying, triage, and high-yield revision using AI."
        canonical="https://www.vertexed.app/resources/how-to-cram-effectively"
        keywords="how to cram for exams, last minute study tips, emergency revision, high yield studying, Pareto principle studying, all-nighter tips, VertexED, exam panic"
      />
      <Article
        title="How to Cram Effectively (When You Have No Time Left)"
        subtitle="We don't recommend cramming. But sometimes, life happens. If you have 12 hours until the exam, here is how to survive."
        kicker="Study Strategy"
      >
        <p className="lead">
          Ideally, you would use <Link to="/planner">VertexED's Planner</Link> to study over weeks. 
          But you didn't. The exam is tomorrow. You are panicking.
          Stop. Panic burns energy you need for your brain. Follow this emergency protocol.
        </p>

        <h2>Step 1: Triage (The 80/20 Rule)</h2>
        <p>
          You cannot learn everything. You must accept this.
          The Pareto Principle states that 80% of the marks come from 20% of the curriculum.
        </p>
        <p>
          <strong>Action:</strong> Go to the <Link to="/chatbot">Chatbot</Link>.
          <br /><em>"I have an exam on [Subject] tomorrow. I have done zero study. List the top 5 'High Yield' topics that appear most frequently on past papers. Ignore the niche topics."</em>
        </p>

        <h2>Step 2: The "Blurting" Method</h2>
        <p>
          Passive reading is useless now. You need to force information into your brain.
        </p>
        <ol>
          <li>Read a summary of Topic 1 for 10 minutes.</li>
          <li>Close the book.</li>
          <li>Write down everything you remember on a blank sheet of paper.</li>
          <li>Check what you missed.</li>
          <li>Repeat.</li>
        </ol>

        <h2>Step 3: Use AI for "Cheat Sheet" Synthesis</h2>
        <p>
          You don't have time to read the textbook.
          <br /><strong>Action:</strong> Upload your notes to <Link to="/notetaker">Notetaker</Link>.
          <br /><em>"Summarize this entire unit into a one-page 'Cheat Sheet' containing only definitions, formulas, and key dates."</em>
        </p>

        <h2>Step 4: Sleep (Yes, Really)</h2>
        <p>
          The "All-Nighter" is a myth. If you stay up all night, your working memory drops by 40%. You will fail.
        </p>
        <p>
          <strong>The Strategy:</strong> Study until 12 AM. Sleep for 6 hours. Wake up at 6 AM.
          Those 6 hours of sleep will consolidate what you studied. 0 hours of sleep means you will forget everything by the time you sit down.
        </p>

        <h2>Step 5: The Morning Of</h2>
        <p>
          Do not learn new things. Only review what you crammed last night.
          Use <Link to="/study-zone">Study Zone</Link> for a quick 10-minute active recall session to warm up your brain.
        </p>

        <h2>FAQ</h2>
        <p><strong>Should I drink coffee?</strong> Yes, but stop 6 hours before your planned sleep time. Caffeine jitters + exam anxiety = disaster.</p>
        <p><strong>What if I don't understand a concept?</strong> Skip it. If it takes more than 15 minutes to understand, it's not worth the time investment right now. Focus on memorizing facts you <em>can</em> retain.</p>
        <p><strong>How do I prevent this next time?</strong> Use the <Link to="/planner">VertexED Planner</Link>. It automatically schedules your revision so you never have to cram again.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/notetaker" className="neu-button">Generate Cheat Sheets</Link>
          <Link to="/chatbot" className="neu-button">Find High Yield Topics</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Walker, M. (2017): Why We Sleep — the impact of sleep deprivation on memory formation.</li>
          <li>Dunlosky et al. (2013): The low utility of re-reading vs. the high utility of self-testing.</li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: Cramming is a survival tactic, not a long-term strategy.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall & Spaced Repetition</Link></li>
          <li><Link to="/resources/subject-guides-common-mistakes">Subject Guides: Common Mistakes</Link></li>
        </ul>
      </Article>
    </>
  );
}
