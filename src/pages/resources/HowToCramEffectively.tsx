import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function HowToCramEffectively() {
  return (
    <>
      <SEO
        title="How to cram when the exam is tomorrow | VertexED"
        description="Not ideal — but if you are down to one day, triage high-yield topics, blurting, cheat sheets, and six hours of sleep beat an all-nighter."
        canonical="https://www.vertexed.app/resources/how-to-cram-effectively"
        keywords="how to cram for exams, last minute study tips, emergency revision, high yield studying, exam panic, VertexED"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "How to cram when the exam is tomorrow",
            description: "Triage, blurting, cheat sheets, and sleep — an honest emergency protocol when revision week never happened.",
            author: {
              "@type": "Organization",
              name: "VertexED Team",
              url: "https://www.vertexed.app"
            },
            publisher: {
              "@type": "Organization",
              name: "VertexED",
              logo: {
                "@type": "ImageObject",
                url: "https://www.vertexed.app/logo.png"
              }
            },
            datePublished: "2025-12-24",
            dateModified: "2025-12-24"
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Should I drink coffee?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A moderate amount can help — but stop six hours before you plan to sleep. Jitters plus exam anxiety rarely help."
                }
              },
              {
                "@type": "Question",
                name: "What if I don't understand a concept?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "If it takes more than fifteen minutes, park it. Focus on definitions and facts you can retain overnight."
                }
              },
              {
                "@type": "Question",
                name: "How do I prevent this next time?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Block revision across the term in the Planner — mocks, retrieval slots, and lighter evenings built in from the start."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="How to cram when the exam is tomorrow"
        subtitle="Cramming is a survival tactic, not a strategy — but if you are here, this is the least-bad protocol."
        kicker="Study Strategy"
      >
        <p className="lead">
          Ideally you would have used the <Link to="/planner">Planner</Link> across the term. You did not.
          The exam is tomorrow. Panic wastes the energy you need for retrieval. This is an honest
          emergency protocol — triage, blurting, cheat sheets, and sleep.
        </p>

        <h2>Step 1: Triage (pick your battles)</h2>
        <p>
          You cannot cover the full syllabus in twelve hours. Accept that and focus on what past papers
          actually repeat.
        </p>
        <p>
          <strong>Action:</strong> Open <Link to="/chatbot">Apex</Link>.
          <br /><em>&ldquo;I have an exam on [subject] tomorrow and have not revised. List the five highest-yield topics on [board] past papers. Skip niche content.&rdquo;</em>
        </p>

        <h2>Step 2: Blurting (not rereading)</h2>
        <p>
          Passive reading will not stick overnight. Force retrieval:
        </p>
        <ol>
          <li>Read a summary of Topic 1 for ten minutes.</li>
          <li>Close the book.</li>
          <li>Write everything you remember on blank paper.</li>
          <li>Check what you missed.</li>
          <li>Repeat.</li>
        </ol>

        <h2>Step 3: One-page cheat sheet</h2>
        <p>
          You do not have time for the full textbook.
          <br /><strong>Action:</strong> Upload notes to <Link to="/notetaker">Notetaker</Link>.
          <br /><em>&ldquo;Summarize this unit into one page — definitions, formulas, and key dates only.&rdquo;</em>
        </p>

        <h2>Step 4: Sleep (non-negotiable)</h2>
        <p>
          All-nighters drop working memory sharply. You will perform worse with zero sleep than with six hours.
        </p>
        <p>
          <strong>Practical split:</strong> Study until midnight. Sleep six hours. Wake at 6 AM.
          Sleep consolidates what you crammed; skipping it means most of tonight&apos;s work evaporates by Paper 1.
        </p>

        <h2>Step 5: Morning of the exam</h2>
        <p>
          Do not learn new topics. Review only what you blurred last night.
          Run a ten-minute active recall warm-up in <Link to="/study-zone">Study Zone</Link>.
        </p>

        <h2>FAQ</h2>
        <p><strong>Should I drink coffee?</strong> A moderate amount can help — stop six hours before sleep. Jitters plus exam anxiety rarely help.</p>
        <p><strong>What if I don&apos;t understand a concept?</strong> If it takes more than fifteen minutes, park it. Focus on facts you can retain overnight.</p>
        <p><strong>How do I prevent this next time?</strong> Block revision across the term in the <Link to="/planner">Planner</Link> — mocks, retrieval, and realistic evenings from week one.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/notetaker" className="neu-button">Build cheat sheet</Link>
          <Link to="/chatbot" className="neu-button">Find high-yield topics</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>Walker, M. (2017): Why We Sleep — sleep deprivation and memory formation.</li>
          <li>Dunlosky et al. (2013): Re-reading scores low; self-testing scores high.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Cramming is a survival tactic, not a long-term strategy.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy &amp; Time Management</Link></li>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall &amp; Spaced Repetition</Link></li>
          <li><Link to="/resources/subject-guides-common-mistakes">Subject Guides: Common Mistakes</Link></li>
        </ul>
      </Article>
    </>
  );
}
