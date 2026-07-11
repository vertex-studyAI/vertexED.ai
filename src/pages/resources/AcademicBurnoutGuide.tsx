import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function AcademicBurnoutGuide() {
  return (
    <>
      <SEO
        title="Academic burnout: signs and recovery | VertexED"
        description="Tired after a weekend off is normal; cynical and ineffective after rest may be burnout. Minimum viable studying, lower planner intensity, and when to seek help."
        canonical="https://www.vertexed.app/resources/academic-burnout-guide"
        keywords="academic burnout, student burnout, study motivation, mental health for students, recovering from burnout, minimum viable studying, VertexED, exam stress"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Academic burnout: signs and recovery",
            description: "How to spot burnout vs ordinary tiredness — and a practical recovery path for exam season.",
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
                name: "Should I take a gap year?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "That is a major decision. Try a full week off revision first — complete detachment often clarifies whether you need a longer break."
                }
              },
              {
                "@type": "Question",
                name: "Is it my fault?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Burnout is a response to sustained pressure — coursework, mocks, university applications stacked together. It is not a character flaw."
                }
              },
              {
                "@type": "Question",
                name: "How do I explain this to my parents?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Be specific: you are not avoiding work, you are reducing load so you can return to focused revision. Rest now prevents a worse crash before exams."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="Academic burnout: signs and recovery"
        subtitle="Exhaustion that sleep does not fix — and how to scale back without dropping everything."
        kicker="Mental Health"
      >
        <p className="lead">
          Tiredness clears with a good night&apos;s sleep. Burnout often does not. If you feel cynical,
          detached from your subjects, and ineffective even after a weekend off, you may be burnt out —
          not lazy. Recovery means scaling back deliberately, not pretending nothing is wrong.
        </p>

        <h2>Three signs of burnout</h2>
        <p>
          The Maslach Burnout Inventory describes three components:
        </p>
        <ol>
          <li><strong>Exhaustion:</strong> Emotional and physical drain — &ldquo;I cannot face another revision block.&rdquo;</li>
          <li><strong>Cynicism:</strong> Detachment from schoolwork — &ldquo;None of this matters.&rdquo;</li>
          <li><strong>Inefficacy:</strong> Feeling that effort does not pay off — &ldquo;I try hard and still fail.&rdquo;</li>
        </ol>

        <h2>Minimum viable studying (MVS)</h2>
        <p>
          Stopping completely can spike anxiety about falling behind. MVS keeps you moving at the lowest
          sustainable level.
        </p>
        <p>
          <strong>The rule:</strong> Do only what prevents failing — not what maximizes marks.
        </p>
        <ul>
          <li><strong>Pause:</strong> Polished notes, extra reading, perfectionism on non-assessed work.</li>
          <li><strong>Continue:</strong> Assigned homework. Use <Link to="/notetaker">AI summaries</Link> for readings you cannot face in full.</li>
        </ul>
        <p>
          Set <Link to="/planner">Planner</Link> intensity to &ldquo;Low&rdquo; — it strips the schedule to essentials.
        </p>

        <h2>Reduce input overload</h2>
        <p>
          Burnout often follows overstimulation, not just hours studied.
          <br /><strong>One-week experiment:</strong> Remove short-form scrolling during study breaks.
          Replace with low-stimulation recovery — a walk, a nap, nothing. Boredom can reset attention
          when feeds have trained your brain to need constant novelty.
        </p>

        <h2>Let AI reduce decision fatigue</h2>
        <p>
          &ldquo;What should I study?&rdquo; costs energy when you are already depleted.
          <br />Let the <Link to="/planner">Planner</Link> assign the next block. Removing the decision
          preserves capacity for the work itself.
        </p>

        <h2>FAQ</h2>
        <p><strong>Should I take a gap year?</strong> Major decision — try a full week off revision first. Complete detachment often clarifies what you actually need.</p>
        <p><strong>Is it my fault?</strong> Burnout responds to sustained pressure. It is not a character flaw.</p>
        <p><strong>How do I explain this to my parents?</strong> Be specific: you are reducing load to return to focused revision, not avoiding work. Rest now prevents a worse crash before exams.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/planner" className="neu-button">Set low-intensity plan</Link>
          <Link to="/study-zone" className="neu-button">Focus timer</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>Maslach, C., &amp; Leiter, M. P. (2016): Understanding the burnout experience.</li>
          <li>Huberman, A. (2023): Dopamine Nation — motivation, fatigue, and recovery.</li>
        </ul>

        <div className="article-footer">
          Editorial note: We are an AI study tool, not a medical service. If you are struggling with severe mental health issues, seek professional help.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy &amp; Time Management</Link></li>
          <li><Link to="/resources/how-to-cram-effectively">How to Cram Effectively</Link></li>
          <li><Link to="/resources/ai-study-planner">AI Study Planner &amp; Calendar</Link></li>
        </ul>
      </Article>
    </>
  );
}
